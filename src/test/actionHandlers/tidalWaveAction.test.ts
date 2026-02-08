import { beforeEach, expect, test } from '@jest/globals';
import type { GameSerialized } from '../../commonTypes';
import { CardType, PlayerDesignator } from '../../commonTypes';
import { GameActionType } from '../../gameActionTypes';
import { GameState } from '../../gameState';
import { GameFlowOperations } from '../../server/gameFlowOperations';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { setUpRandom } from '../setUpRandom';

const setUpGame = () => {
    setUpRandom();
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');

    game.players[PlayerDesignator.PLAYER_B].hand[0].cardType =
        CardType.TIDAL_WAVE;

    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.TIDAL_WAVE,
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
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
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

test('Tidal wave actions can be taken', () => {
    // take tidal surge action
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.TIDAL_WAVE_TARGET,
        data: 6,
    });

    // expect the rising waters marker to have moved
    expect(game.nextIslandToSink).toBe(6);

    // the active card index should have changed
    expect(game.activeCardIndex).toEqual(1);

    // the card should have been discarded
    expect(
        game.players[PlayerDesignator.PLAYER_B].discardPile.some((card) => {
            return card.cardType === CardType.TIDAL_WAVE;
        }),
    ).toBe(true);

    // the game state should have updated
    expect(game.gameState).toEqual(GameState.AWAIT_MOVEMENT_SET);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});

test('Cannot tidal wave to a non-existent island', () => {
    // try to tidal wave to a missing island
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.TIDAL_WAVE_TARGET,
            data: 20,
        });
    }).toThrow();
});
