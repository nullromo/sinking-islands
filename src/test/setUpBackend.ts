import { BackendServer } from '../server/server';

export const setUpBackend = async () => {
    return BackendServer.start(true);
};

export const tearDownBackend = () => {
    BackendServer.stop();
};
