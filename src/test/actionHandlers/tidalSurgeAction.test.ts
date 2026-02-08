import { beforeEach, expect, test } from '@jest/globals';
import type { GameSerialized } from '../../commonTypes';
import { PlayerDesignator } from '../../commonTypes';
import { GameActionType } from '../../gameActionTypes';
import { GameState } from '../../gameState';
import { CardType } from '../../server/gameObjects/card';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { setUpRandom } from '../setUpRandom';
import { fullObject } from '../../server/util';

const setUpGame = () => {
    setUpRandom();
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');

    game.players[PlayerDesignator.PLAYER_B].hand[0].cardType =
        CardType.TIDAL_SURGE;

    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.TIDAL_SURGE,
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
    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            1: {
                cardType: CardType.MOVEMENT,
                playerDesignator: PlayerDesignator.PLAYER_A,
            },
            2: {
                cardType: CardType.MOVEMENT,
                playerDesignator: PlayerDesignator.PLAYER_A,
            },
            4: {
                cardType: CardType.CRAB,
                playerDesignator: PlayerDesignator.PLAYER_A,
            },
        },
    });
    return game;
};

let game: GameSerialized;

beforeEach(() => {
    game = setUpGame();
});

test('Tidal surge actions can be taken', () => {
    // take tidal surge action
    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.TIDAL_SURGE_TARGET,
        data: 6,
    });

    // expect the rising waters marker to have moved
    expect(game.nextIslandToSink).toBe(6);

    // the active card index should have changed
    expect(game.activeCardIndex).toEqual(1);

    // the card should have been discarded
    expect(
        game.players[PlayerDesignator.PLAYER_B].discardPile.some((card) => {
            return card.cardType === CardType.TIDAL_SURGE;
        }),
    ).toBe(true);

    // the game state should have updated
    expect(game.gameState).toEqual(GameState.AWAIT_MOVEMENT_SET);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});

test('Cannot tidal surge to a non-adjacent island', () => {
    // try to tidal surge far
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.TIDAL_SURGE_TARGET,
            data: 2,
        });
    }).toThrow();
});
