import { beforeAll, test } from '@jest/globals';
import { GameOperations } from '../server/gameObjects/gameOperations';
import { setUpRandom } from './setUpRandom';
import { PlayerDesignator } from '../commonTypes';
import { GameActionType } from '../gameActionTypes';
import { CardType } from '../server/gameObjects/card';

beforeAll(() => {
    setUpRandom();
});

test('Game actions can be taken', () => {
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');

    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            1: {
                cardType: CardType.MOVEMENT,
                playerDesignator: PlayerDesignator.PLAYER_B,
            },
            3: {
                cardType: CardType.MOVEMENT,
                playerDesignator: PlayerDesignator.PLAYER_B,
            },
            5: {
                cardType: CardType.CRAB,
                playerDesignator: PlayerDesignator.PLAYER_B,
            },
        },
    });
});
