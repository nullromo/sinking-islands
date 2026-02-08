import { beforeEach, expect, test } from '@jest/globals';
import type { GameSerialized } from '../../commonTypes';
import { PlayerDesignator } from '../../commonTypes';
import { GameActionType } from '../../gameActionTypes';
import { GameState } from '../../gameState';
import { GameFlowOperations } from '../../server/gameFlowOperations';
import { CardType } from '../../server/gameObjects/card';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { setUpRandom } from '../setUpRandom';

const setUpGame = () => {
    setUpRandom();
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');

    game.players[PlayerDesignator.PLAYER_A].hand[0].cardType = CardType.NET;
    game.players[PlayerDesignator.PLAYER_B].hand[0].cardType = CardType.NET;

    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.NET,
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
                cardType: CardType.NET,
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

test('Net actions can be taken', () => {
    // take net action
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.NET_TARGET,
        data: 2,
    });

    // expect the island to be netted
    expect(GameOperations.islandIsNetted(game, 2)).toBe(true);
    expect(game.players[PlayerDesignator.PLAYER_B].netIsland).toBe(2);

    // the active card index should have changed
    expect(game.activeCardIndex).toEqual(1);

    // the card should have been discarded
    expect(
        game.players[PlayerDesignator.PLAYER_B].setAsideCards.some((card) => {
            return card.cardType === CardType.NET;
        }),
    ).toBe(true);
    expect(game.players[PlayerDesignator.PLAYER_B].discardPile.length).toBe(0);

    // the game state should have updated
    expect(game.gameState).toEqual(GameState.AWAIT_NET_TARGET);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});

test('Can only net islands that exist', () => {
    // delete an island
    game.islands = game.islands.slice(1);

    // try to net a non-existent island
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.NET_TARGET,
            data: 8,
        });
    }).toThrow();

    // try to net an out-of-range island
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.NET_TARGET,
            data: 80,
        });
    }).toThrow();
});

test('Cannot net an already-netted island', () => {
    // net an island
    game.players[PlayerDesignator.PLAYER_A].netIsland = 10;

    // try to net the same island
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.NET_TARGET,
            data: 10,
        });
    }).toThrow();
});
