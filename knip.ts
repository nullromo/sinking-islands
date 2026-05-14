import type { KnipConfig } from 'knip';

const config: KnipConfig = {
    ignoreBinaries: ['ts-node-dev'],
    ignore: [
        'sinking-islands-ecosystem.config.js',
        'src/util/util.ts',
        'src/util/maps.ts',
    ],
    ignoreDependencies: [
        '@eslint/eslintrc',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        '@typescript-eslint/type-utils',
        '@typescript-eslint/typescript-estree',
        '@typescript-eslint/utils',
        'babel-jest',
        'ts-node',
    ],
};

export default config;
