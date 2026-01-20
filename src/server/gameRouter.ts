import express from 'express';
import { EndpointUtils } from '../endpointUtils';
import { Endpoints } from '../endpoints';
import { requireSession } from './requireSession';
import { Game } from './game';
import { getRedis } from './redisConnector';

const createGame = async (username: string | undefined) => {
    if (username === undefined) {
        throw new Error('Creating a game requires a username.');
    }

    // create a new game
    const game = new Game();

    // connect to redis
    const redis = await getRedis();

    const message = 'Game created.';
    console.log(message);
    return { message };
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
