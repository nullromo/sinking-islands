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

    game.players[PlayerDesignator.PLAYER_A].hand[0].cardType = CardType.HARPOON;
    game.players[PlayerDesignator.PLAYER_B].hand[0].cardType = CardType.HARPOON;

    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.HARPOON,
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
                cardType: CardType.HARPOON,
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

test('Harpoon actions can be taken', () => {
    // take harpoon action
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.HARPOON_TARGET,
        data: {
            character: {
                playerDesignator: PlayerDesignator.PLAYER_A,
                strength: 20,
                tortoise: false,
            },
            islandNumber: 8,
        },
    });

    // make sure character died
    expect(game.islands[0].characters.length).toBe(0);

    // the active card index should have changed
    expect(game.activeCardIndex).toEqual(1);

    // the cards should have been discarded
    expect(
        game.players[PlayerDesignator.PLAYER_B].discardPile.some((card) => {
            return card.cardType === CardType.HARPOON;
        }),
    ).toBe(true);

    // the game state should have updated
    expect(game.gameState).toEqual(GameState.AWAIT_HARPOON_TARGET);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});

test('Players cannot harpoon their own characters', () => {
    // attempt to harpoon self
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.HARPOON_TARGET,
            data: {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_B,
                    strength: 40,
                    tortoise: false,
                },
                islandNumber: 2,
            },
        });
    }).toThrow();
});

test('Players cannot harpoon characters that do not exist', () => {
    // attempt to harpoon non-existent character
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.HARPOON_TARGET,
            data: {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_A,
                    strength: 30,
                    tortoise: false,
                },
                islandNumber: 8,
            },
        });
    }).toThrow();
});

test('Players cannot harpoon characters that are out of range', () => {
    // attempt to harpoon out-of-range character
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.HARPOON_TARGET,
            data: {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_A,
                    strength: 30,
                    tortoise: false,
                },
                islandNumber: 14,
            },
        });
    }).toThrow();
});

test('Players cannot harpoon a tortoise', () => {
    // make a character into a tortoise
    game.islands[0].characters[0].tortoise = true;

    // try to harpoon that character
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.HARPOON_TARGET,
            data: {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_A,
                    strength: 20,
                    tortoise: true,
                },
                islandNumber: 8,
            },
        });
    }).toThrow();
});
