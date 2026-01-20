import express from 'express';
import { EndpointUtils } from '../endpointUtils';
import { Endpoints } from '../endpoints';
import { GameOperations } from './gameObjects/gameOperations';
import { getRedis } from './redisConnector';
import { requireSession } from './requireSession';
import { RedisKeys } from './redisKeys';

const createGame = async (username: string | undefined) => {
    // validate arguments
    if (username === undefined) {
        throw new Error('Creating a game requires a username.');
    }

    // create a new game
    const game = GameOperations.create();

    // connect to redis
    const redis = await getRedis();

    // create redis key
    const key = RedisKeys.createGameKey(game.id);

    // add the game to redis
    await redis.json.set(key, '$', JSON.stringify(game));

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
