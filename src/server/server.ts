import { RedisStore } from 'connect-redis';
import express from 'express';
import session from 'express-session';
import http from 'http';
import { Server } from 'socket.io';
import { PlayerDesignator } from '../commonTypes';
import { HTTPResponseCodes } from '../httpResponseCodes';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from '../socketEvents';
import { Game } from './game';
import { gameRouter } from './gameRouter';
import { destroyRedis, getRedis } from './redisConnector';
import { usersRouter } from './usersRouter';

const BACKEND_PORT = 5151;
const TEST_BACKEND_PORT = 5150;

class SinkingIslandsBackend {
    private server: http.Server | null = null;

    private io: Server<ClientToServerEvents, ServerToClientEvents> | null =
        null;

    private running = false;

    public readonly start = (test: boolean) => {
        if (this.running) {
            throw new Error(
                'Cannot start the backend because it is already running.',
            );
        }
        this.running = true;

        const port = test ? TEST_BACKEND_PORT : BACKEND_PORT;

        const app = express();

        // eslint-disable-next-line @typescript-eslint/strict-void-return
        this.server = http.createServer(app);
        this.io = new Server<ClientToServerEvents, ServerToClientEvents>(
            this.server,
            { cors: { origin: '*' } },
        );

        //const whitelist = [
        //'http://localhost:3000',
        //`http://localhost:${port}`,
        //'http://192.168.0.16:3000',
        //'http://10.0.0.163:3000',
        //'http://192.168.42.2:3000',
        //'http://135.180.0.49:3000',
        //];
        //app.use(
        //cors({
        //credentials: true,
        //origin: (origin, callback) => {
        //if (origin && whitelist.includes(origin)) {
        //console.log(`CORS is accepting ${origin} as a valid origin.`);
        //callback(null, true);
        //} else {
        //callback(
        //new Error(
        //`Origin (${origin}) not whitelisted by CORS policy.`,
        //),
        //);
        //}
        //},
        //}),
        //);

        app.use(express.urlencoded({ extended: false }));
        app.use(express.json());

        (async () => {
            const redisStore = new RedisStore({
                client: await getRedis(),
                prefix: 'session:sinking-islands:',
            });
            app.use((request, response, next) => {
                session({
                    cookie: {
                        maxAge: 1000 * 60 * 10, // 10 minutes
                        // secure: true // TODO enable this when https is set up. See https://github.com/expressjs/session?tab=readme-ov-file#cookiesecure
                    },
                    name: 'sinking-islands',
                    resave: false,
                    rolling: true,
                    saveUninitialized: true,
                    secret: 'TODO', // TODO
                    store: redisStore,
                    unset: 'destroy',
                })(request, response, next);
            });
            app.use((request, __, next) => {
                console.log(
                    'HTTP request from',
                    (request.session as unknown) !== undefined &&
                        request.session.username !== undefined
                        ? `'${request.session.username}'`
                        : 'unknown user',
                );
                next();
            });
            app.use(usersRouter);
            app.use(gameRouter);
            app.use(
                (
                    error: Error,
                    __: express.Request,
                    response: express.Response,
                    next: express.NextFunction,
                ) => {
                    console.error(error);
                    if (response.statusCode === HTTPResponseCodes.OK) {
                        response.status(
                            HTTPResponseCodes.INTERNAL_SERVER_ERROR,
                        );
                    }
                    response.send({ message: error.message });
                    next();
                },
            );
        })().catch(console.error);

        this.server.listen(port, () => {
            console.log('Listening');
        });

        const games: Partial<Record<string, Game>> = {};

        this.io.on('connection', (socket) => {
            console.log(
                `Client ${socket.id} connected from ${socket.handshake.address}`,
            );

            socket.on('createGame', () => {
                console.log(`Game created for socket ID ${socket.id}`);
                //const game = new Game(socket.id);
                const game = new Game();
                games[socket.id] = game;
                game.connectSocket(PlayerDesignator.PLAYER_A, socket);
                socket.emit(
                    'gameState',
                    game.serialize(PlayerDesignator.PLAYER_A),
                );
            });

            socket.on('joinGame', (id) => {
                console.log('Join request from', socket.id, 'for game', id);
                const game = games[id];
                if (!game) {
                    socket.emit('joinFail');
                    return;
                }
                if (!game.isWaitingForPlayers()) {
                    socket.emit('joinFail');
                    return;
                }
                game.connectSocket(PlayerDesignator.PLAYER_B, socket);
                games[socket.id] = game;
                socket.emit(
                    'gameState',
                    game.serialize(PlayerDesignator.PLAYER_B),
                );

                game.play().catch(console.error);
            });

            // log disconnects
            socket.on('disconnect', () => {
                console.log(`Client ${socket.id} disconnected.`);
            });
        });
    };

    public readonly stop = () => {
        if (!this.running) {
            return;
        }
        this.running = false;

        if (this.server) {
            this.server.close();
        }

        if (this.io) {
            this.io.close().catch(console.error);
        }

        destroyRedis();
    };
}

export const BackendServer = new SinkingIslandsBackend();
