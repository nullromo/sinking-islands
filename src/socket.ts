import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL =
    process.env.NODE_ENV === 'production'
        ? undefined
        : `http://localhost:${process.env.BACKEND_PORT ?? import.meta.env.VITE_BACKEND_PORT ?? 5151}`;

export const socket = io(URL, { autoConnect: false });
