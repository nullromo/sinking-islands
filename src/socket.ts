import { io } from 'socket.io-client';
import { BACKEND_PORT } from './ports';

// "undefined" means the URL will be computed from the `window.location` object
const URL =
    process.env.NODE_ENV === 'production'
        ? undefined
        : `http://localhost:${BACKEND_PORT}`;

export const socket = io(URL, { autoConnect: false });
