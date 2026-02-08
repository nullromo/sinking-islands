import type { GameSerialized } from '../commonTypes';
import { PlayerDesignator } from '../commonTypes';
import type { GameAction } from '../gameActionTypes';
import { GameFlowOperations } from './gameFlowOperations';
import { getRedis } from './redisConnector';
import { RedisKeys } from './redisKeys';
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

        GameFlowOperations.takeGameAction(game, playerDesignator, gameAction);

        return game;
    };
}
