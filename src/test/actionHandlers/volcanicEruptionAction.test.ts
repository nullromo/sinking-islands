import { beforeEach, expect, test } from '@jest/globals';
import type { GameSerialized } from '../../info/commonTypes';
import { CardType, PlayerDesignator } from '../../info/commonTypes';
import { GameActionType } from '../../info/gameActionTypes';
import { GameState } from '../../info/gameState';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { setUpRandom } from '../setUpRandom';
import { GameFlowOperations } from '../../server/gameFlowOperations';

const setUpGame = () => {
    setUpRandom();
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');

    game.players[PlayerDesignator.PLAYER_B].hand[0].cardType =
        CardType.VOLCANIC_ERUPTION;

    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.VOLCANIC_ERUPTION,
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

test('Volcanic eruption actions can be taken', () => {
    // take volcanic eruption action
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.VOLCANIC_ERUPTION_TARGET,
        data: 6,
    });

    // the island should no longer exist
    expect(
        game.islands.find((island) => {
            return island.islandNumber === 6;
        }),
    ).toBe(undefined);

    // the active card index should have changed
    expect(game.activeCardIndex).toEqual(1);

    // the card should have been discarded
    expect(
        game.players[PlayerDesignator.PLAYER_B].discardPile.some((card) => {
            return card.cardType === CardType.VOLCANIC_ERUPTION;
        }),
    ).toBe(true);

    // the game state should have updated
    expect(game.gameState).toEqual(GameState.AWAIT_MOVEMENT_SET);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});

test('Cannot erupt a non-volcano', () => {
    // take volcanic eruption action on a normal island
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.VOLCANIC_ERUPTION_TARGET,
            data: 7,
        });
    }).toThrow();

    // take volcanic eruption action on a non-existent island
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.VOLCANIC_ERUPTION_TARGET,
            data: 70,
        });
    }).toThrow();
});
