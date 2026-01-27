import { BackendServer } from '../server/server';

export const setUpBackend = () => {
    BackendServer.start(true);
};

export const tearDownBackend = () => {
    BackendServer.stop();
};
