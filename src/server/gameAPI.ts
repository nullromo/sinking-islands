import type { GameSerialized } from '../commonTypes';
import { GameOperations } from './gameObjects/gameOperations';
import { getRedis } from './redisConnector';
import { RedisKeys } from './redisKeys';
import { fullObject } from './util';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GameAPI {
    export const createGame = async (username: string | undefined) => {
        // validate arguments
        if (username === undefined) {
            throw new Error('Creating a game requires a username.');
        }

        // create a new game
        const game = GameOperations.create();

        // assign the user to the game
        GameOperations.assignUserToGame(game, username);

        // connect to redis
        const redis = await getRedis();

        // create redis key
        const key = RedisKeys.createGameKey(game.id);

        // add the game to redis
        await redis.json.set(key, '$', game);

        console.log('Game created.');
        return game.id;
    };

    export const getGameList = async () => {
        // connect to redis
        const redis = await getRedis();

        // get all game keys
        const allGameKeys = await redis.keys(`${RedisKeys.createGameKey('')}*`);

        const allGames = (
            await Promise.all(
                allGameKeys.map(async (key) => {
                    return (await redis.json.get(key)) as GameSerialized | null;
                }),
            )
        ).filter((game) => {
            return game !== null;
        });

        console.log(
            `The following games exist: ${fullObject(
                allGames.map((game) => {
                    return game.id;
                }),
            )}`,
        );

        return allGames;
    };

    export const joinGame = async (
        gameID: string | undefined,
        username: string | undefined,
    ) => {
        // validate arguments
        if (gameID === undefined) {
            throw new Error('Joining a game requires a game ID.');
        }
        if (username === undefined) {
            throw new Error('Joining a game requires a username.');
        }

        // connect to redis
        const redis = await getRedis();

        // create redis key
        const key = RedisKeys.createGameKey(gameID);

        // get the game from redis
        const game = (await redis.json.get(key)) as GameSerialized | null;
        if (game === null) {
            throw new Error(`Could not find game with ID ${gameID}`);
        }

        // assign user to game
        GameOperations.assignUserToGame(game, username);

        // save game back to redis
        await redis.json.set(key, '$', game);

        const message = `User ${username} joined game ${gameID}.`;
        console.log(message);
        return { message };
    };
}
