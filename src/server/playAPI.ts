import type { GameSerialized } from '../info/commonTypes';
import { PlayerDesignator } from '../info/commonTypes';
import type { GameAction } from '../info/gameActionTypes';
import { GameFlowOperations } from './gameFlowOperations';
import { getRedis } from './redisConnector';
import { RedisKeys } from './redisKeys';
import { BackendServer } from './server';
import { fullObject } from './util';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PlayAPI {
    export const takeGameAction = async (
        username: string | undefined,
        gameID: string | undefined,
        gameAction: GameAction | undefined,
    ) => {
        // validate arguments
        if (username === undefined) {
            throw new Error('Taking a game action requires a username.');
        }
        if (gameID === undefined) {
            throw new Error('Taking a game action requires a game ID.');
        }
        if (gameAction === undefined) {
            throw new Error('Taking a game action requires game action data.');
        }

        // connect to redis
        const redis = await getRedis();

        // create redis key for the game
        const key = RedisKeys.createGameKey(gameID);

        // find the game in redis
        const game = (await redis.json.get(key)) as GameSerialized | null;
        if (game === null) {
            throw new Error(`A game with ID '${gameID}' does not exist.`);
        }

        // determine which player the user is
        const playerDesignator = (() => {
            if (game.players[PlayerDesignator.PLAYER_A].username === username) {
                return PlayerDesignator.PLAYER_A;
            }
            if (game.players[PlayerDesignator.PLAYER_B].username === username) {
                return PlayerDesignator.PLAYER_B;
            }
            throw new Error(
                `User '${username}' is not a player in game '${gameID}'.`,
            );
        })();

        console.log(
            `${playerDesignator} (${username}) is taking the action '${fullObject(gameAction)}' on game '${gameID}'.`,
        );

        // take the game action on the game
        GameFlowOperations.takeGameAction(game, playerDesignator, gameAction);

        // store the result in redis
        await redis.json.set(key, '$', game);

        // send the updated game to all connected clients
        BackendServer.broadcastGame(game);

        // return the resulting game
        return game;
    };
}
