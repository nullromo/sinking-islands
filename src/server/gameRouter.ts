import express from 'express';
import { EndpointUtils } from '../endpointUtils';
import { Endpoints } from '../endpoints';
import { requireSession } from './requireSession';
import { Game } from './game';
import { getRedis } from './redisConnector';

const createGame = async (username: string) => {
    // create a new game
    const game = new Game();

    // connect to redis
    const redis = await getRedis();
};

export const gameRouter = (() => {
    const router = express.Router();

    router.use(requireSession);

    EndpointUtils.registerEndpoint(
        router,
        Endpoints.CreateGame,
        async (request) => {
            return createGame(request.session.username);
        },
    );

    return router;
})();
