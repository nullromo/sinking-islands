module.exports = {
    apps: [
        {
            name: 'backend',
            script: '/sinking-islands/dist/backend-built.js',
            cwd: '/sinking-islands',
            //node_args: '--use-largepages=silent --max-old-space-size=2048 --expose-gc',
            args: '--color',
            env: { PM2: 'true' },
            watch: false,
            log_date_format: 'YYYY-MM-DD-HH:mm:ss.SSS',
            no_treekill: true,
        },
    ],
};
