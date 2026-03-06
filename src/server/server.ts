import { RedisStore } from 'connect-redis';
import * as cookie from 'cookie';
import express from 'express';
import type { SessionData } from 'express-session';
import session from 'express-session';
import http from 'http';
import { Server } from 'socket.io';
import { HTTPResponseCodes } from '../communication/httpResponseCodes';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from '../communication/socketEvents';
import type { GameSerialized } from '../info/commonTypes';
import { PlayerDesignator } from '../info/commonTypes';
import { TEST_BACKEND_PORT } from '../test/ports';
import { GameOperations } from './gameObjects/gameOperations';
import { gameRouter } from './gameRouter';
import { playRouter } from './playRouter';
import { destroyRedis, getRedis } from './redisConnector';
import { RedisKeys, sessionPrefix } from './redisKeys';
import { usersRouter } from './usersRouter';

const cookieName = 'sinking-islands';

class SinkingIslandsBackend {
    private server: http.Server | null = null;

    private io: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        Record<string, never>,
        { sessionID: string | undefined }
    > | null = null;

    private running = false;

    public readonly start = async (test: boolean) => {
        if (this.running) {
            throw new Error(
                'Cannot start the backend because it is already running.',
            );
        }
        this.running = true;

        const port = test
            ? TEST_BACKEND_PORT
            : (process.env.BACKEND_PORT ?? 5151);

        const app = express();

        // eslint-disable-next-line @typescript-eslint/strict-void-return
        this.server = http.createServer(app);
        this.io = new Server<ClientToServerEvents, ServerToClientEvents>(
            this.server,
            { cors: { origin: '*' } },
        );

        app.use(express.urlencoded({ extended: false }));
        app.use(express.json());

        const redis = await getRedis();

        const redisStore = new RedisStore({
            client: redis,
            prefix: sessionPrefix,
        });
        app.use((request, response, next) => {
            session({
                cookie: {
                    maxAge: 1000 * 60 * 10, // 10 minutes
                    // secure: true // TODO enable this when https is set up. See https://github.com/expressjs/session?tab=readme-ov-file#cookiesecure
                },
                name: cookieName,
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
        app.use(playRouter);
        app.use(
            (
                error: Error,
                __: express.Request,
                response: express.Response,
                next: express.NextFunction,
            ) => {
                console.error(error);
                if (response.statusCode === HTTPResponseCodes.OK) {
                    response.status(HTTPResponseCodes.INTERNAL_SERVER_ERROR);
                }
                response.send({ message: error.message });
                next();
            },
        );

        this.server.listen(port, () => {
            console.log('Listening on port', port);
        });

        this.io.use((socket, next) => {
            try {
                const rawCookie = socket.request.headers.cookie;
                if (rawCookie) {
                    const match = cookie
                        .parse(rawCookie)
                        [cookieName]?.match(/s:(?<id>.*)\./);
                    if (match) {
                        socket.data.sessionID = match.groups?.id;
                    }
                }
                next();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(error);
                } else {
                    next(new Error(`Unknown error: ${error}`));
                }
            }
        });

        this.io.on('connection', (socket) => {
            console.log(
                `Client ${socket.id} connected from ${socket.handshake.address}`,
            );

            // when the client subscribes to a game, they get put into a
            // socket.io room with that game's ID as the room name
            socket.on('subscribeToGame', (gameID) => {
                console.log(`Socket ${socket.id} is subscribing to ${gameID}.`);
                (async () => {
                    // get the session ID from the socket
                    const sessionID = socket.data.sessionID;
                    if (sessionID === undefined) {
                        throw new Error(
                            'Not logged in. Unable to subscribe to game.',
                        );
                    }

                    // find the game state for this game
                    const game = (await redis.json.get(
                        RedisKeys.createGameKey(gameID),
                    )) as GameSerialized | null;
                    if (game === null) {
                        // TODO: need to handle this better
                        throw new Error(
                            `Failed to find game with ID ${gameID}.`,
                        );
                    }

                    // find the username based on the session data from the
                    // socket
                    const sessionRedisData = await redis.get(
                        RedisKeys.createSessionKey(sessionID),
                    );
                    if (sessionRedisData === null) {
                        throw new Error('Invalid session ID.');
                    }
                    const session = JSON.parse(sessionRedisData) as SessionData;
                    const username = session.username;
                    if (username === undefined) {
                        throw new Error('No user attached to session.');
                    }

                    // find the player designator assigned to the user
                    const playerDesignator = (() => {
                        if (
                            game.players[PlayerDesignator.PLAYER_A].username ===
                            username
                        ) {
                            return PlayerDesignator.PLAYER_A;
                        }
                        if (
                            game.players[PlayerDesignator.PLAYER_B].username ===
                            username
                        ) {
                            return PlayerDesignator.PLAYER_B;
                        }
                        return null;
                    })();
                    if (playerDesignator === null) {
                        throw new Error(
                            `User ${username} is not a part of game ${gameID}.`,
                        );
                    }

                    // room ID is the game ID + the player designator
                    const room = `${gameID}-${playerDesignator}`;

                    // join the room
                    await socket.join(room);

                    // send the user the initial game state
                    socket.emit(
                        'gameState',
                        GameOperations.obscureCards(game, playerDesignator),
                    );
                })().catch((error: unknown) => {
                    // TODO: need to handle this better
                    console.error(error);
                });
            });

            // log disconnects
            socket.on('disconnect', () => {
                console.log(`Client ${socket.id} disconnected.`);
            });
        });
    };

    public readonly broadcastGame = (game: GameSerialized) => {
        this.io
            ?.to(`${game.id}-${PlayerDesignator.PLAYER_A}`)
            .emit(
                'gameState',
                GameOperations.obscureCards(game, PlayerDesignator.PLAYER_A),
            );
        this.io
            ?.to(`${game.id}-${PlayerDesignator.PLAYER_B}`)
            .emit(
                'gameState',
                GameOperations.obscureCards(game, PlayerDesignator.PLAYER_B),
            );
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

        destroyRedis().catch(console.error);
    };
}

export const BackendServer = new SinkingIslandsBackend();
