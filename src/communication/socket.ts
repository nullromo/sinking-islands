import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL =
    process.env.NODE_ENV === 'production'
        ? undefined
        : `http://localhost:${import.meta.env.VITE_FRONTEND_PORT ?? 4000}`;

export const socket = io(URL, { autoConnect: false, withCredentials: true });
