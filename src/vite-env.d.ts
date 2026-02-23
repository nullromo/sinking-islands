/// <reference types="vite/client" />

declare module '*.png';

interface ViteTypeOptions {
    strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
    readonly VITE_BACKEND_PORT?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
