import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from '@nabla/vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
//import richSvg from 'vite-plugin-react-rich-svg';

export default defineConfig(() => {
    const proxyTarget = 'http://127.0.0.1:5151';
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
            port: 3000,
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
