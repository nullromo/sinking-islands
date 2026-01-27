import { BackendServer } from './server';

BackendServer.start(false);

setTimeout(() => {
    console.log('Stopping');
    BackendServer.stop();
}, 1000);
