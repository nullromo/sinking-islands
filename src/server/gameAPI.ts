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

    export const getGamesForUser = async (username: string | undefined) => {
        // validate arguments
        if (username === undefined) {
            throw new Error("Getting a user's requires a username.");
        }

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

        // get list of games that the user is in
        const userGames = allGames.filter((game) => {
            return Object.values(game.players).some((player) => {
                return player.username === username;
            });
        });

        console.log(
            `User '${username}' is part of the following games: ${fullObject(
                userGames.map((game) => {
                    return game.id;
                }),
            )}`,
        );

        return userGames;
    };
}
