/// <reference types="vite/client" />

declare module '*.png';

interface ViteTypeOptions {
    strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
    readonly VITE_FRONTEND_PORT?: string;
    readonly VITE_BACKEND_PORT?: string;
    readonly VITE_COMMIT_HASH?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
