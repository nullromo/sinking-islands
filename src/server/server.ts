import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

app.use(express.urlencoded({ extended: false }));

server.listen(5151, () => {
    console.log('Listening');
});

io.on('connection', (socket) => {
    console.log(
        `Client ${socket.id} connected from ${socket.handshake.address}`,
    );

    // log disconnects
    socket.on('disconnect', () => {
        console.log(`Client ${socket.id} disconnected.`);
    });
});
