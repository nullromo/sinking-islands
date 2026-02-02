import { beforeAll, expect, test } from '@jest/globals';
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

    expect(
        game.actionOrderTrack.cardSlots.reduce((count, item) => {
            return count + (item === null ? 0 : 1);
        }, 0),
    ).toEqual(3);
});
