import { beforeEach, expect, test } from '@jest/globals';
import type { GameSerialized } from '../../info/commonTypes';
import { CardType, PlayerDesignator } from '../../info/commonTypes';
import { GameActionType } from '../../info/gameActionTypes';
import { GameState } from '../../info/gameState';
import { GameFlowOperations } from '../../server/gameFlowOperations';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { setUpRandom } from '../setUpRandom';

const setUpGame = () => {
    setUpRandom();
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');

    game.players[PlayerDesignator.PLAYER_B].hand[0].cardType =
        CardType.TORTOISE;

    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.TORTOISE,
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

test('Tortoise actions can be taken', () => {
    // take tortoise action
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.TORTOISE_TARGET,
        data: {
            character: {
                playerDesignator: PlayerDesignator.PLAYER_B,
                strength: 40,
                tortoise: false,
            },
            islandNumber: 2,
        },
    });

    // expect character to be a tortoise
    expect(game.islands[1].characters[0].tortoise).toBe(true);

    // the active card index should have changed
    expect(game.activeCardIndex).toEqual(1);

    // the card should have been set aside
    expect(
        game.players[PlayerDesignator.PLAYER_B].setAsideCards.some((card) => {
            return card.cardType === CardType.TORTOISE;
        }),
    ).toBe(true);
    expect(game.players[PlayerDesignator.PLAYER_B].discardPile.length).toBe(0);

    // the game state should have updated
    expect(game.gameState).toEqual(GameState.AWAIT_MOVEMENT_SET);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});

test('Players can only tortoise their own characters', () => {
    // try to tortoise the wrong character
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.TORTOISE_TARGET,
            data: {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_A,
                    strength: 20,
                    tortoise: false,
                },
                islandNumber: 8,
            },
        });
    }).toThrow();
});

test('Cannot tortoise a non-existent character', () => {
    // try to tortoise a missing character
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.TORTOISE_TARGET,
            data: {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_B,
                    strength: 30,
                    tortoise: false,
                },
                islandNumber: 8,
            },
        });
    }).toThrow();
});
