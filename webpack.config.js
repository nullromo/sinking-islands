const path = require('path');

module.exports = [
    {
        entry: './src/server/serverLauncher.ts',
        output: {
            filename: 'backend-built.js',
            path: path.resolve(__dirname, 'dist'),
        },
        target: 'node',
        module: {
            rules: [
                {
                    test: /\.tsx?/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: { compilerOptions: { noEmit: false } },
                        },
                    ],
                },
            ],
        },
        resolve: { extensions: ['.tsx', '.ts', '.js'], mainFields: ['main'] },
        mode: 'production',
        externals: { externalsPresets: { node: true } },
        optimization: { minimize: true },
    },
];
