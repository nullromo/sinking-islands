import http from 'http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { PlayerDesignator } from '../commonTypes';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from '../socketEvents';
import { Game } from './game';

const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
        origin: '*',
    },
});

const whitelist = [
    'http://localhost:3000',
    'http://192.168.0.16:3000',
    'http://10.0.0.163:3000',
    'http://192.168.42.2:3000',
    'http://135.180.0.49:3000',
];
app.use(
    cors({
        credentials: true,
        origin: (origin, callback) => {
            if (origin && whitelist.includes(origin)) {
                console.log(`CORS is accepting ${origin} as a valid origin.`);
                callback(null, true);
            } else {
                callback(
                    new Error(
                        `Origin (${origin}) not whitelisted by CORS policy.`,
                    ),
                );
            }
        },
    }),
);

app.use(express.urlencoded({ extended: false }));

server.listen(5151, () => {
    console.log('Listening');
});

const games: Partial<Record<string, Game>> = {};

io.on('connection', (socket) => {
    console.log(
        `Client ${socket.id} connected from ${socket.handshake.address}`,
    );

    socket.on('createGame', () => {
        console.log(`Game created for socket ID ${socket.id}`);
        const game = new Game(socket.id);
        games[socket.id] = game;
        game.connectSocket(PlayerDesignator.PLAYER_A, socket);
        socket.emit('gameState', game.serialize(PlayerDesignator.PLAYER_A));
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
        socket.emit('gameState', game.serialize(PlayerDesignator.PLAYER_B));

        game.play().catch(console.error);
    });

    // log disconnects
    socket.on('disconnect', () => {
        console.log(`Client ${socket.id} disconnected.`);
    });
});
