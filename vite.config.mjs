import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from '@nabla/vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
//import richSvg from 'vite-plugin-react-rich-svg';

export const BACKEND_PORT = process.env.BACKEND_PORT ?? 5151;
export const FRONTEND_PORT = process.env.FRONTEND_PORT ?? 4000;

export default defineConfig(() => {
    const proxyTarget = `http://127.0.0.1:${BACKEND_PORT}`;
    return {
        // eslint-disable-next-line no-undef
        build: { outDir: process.env.VITE_BUILD_PATH ?? 'build' },
        plugins: [
            react(),
            eslint(),
            nodePolyfills({ include: ['util'] }),
            //richSvg(),
        ],
        server: {
            port: FRONTEND_PORT,
            proxy: {
                '/backend': { changeOrigin: true, target: proxyTarget },
                '/socket.io': {
                    changeOrigin: true,
                    target: proxyTarget,
                    ws: true,
                },
            },
        },
    };
});
