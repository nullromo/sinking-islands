import { beforeEach, expect, test } from '@jest/globals';
import type { GameSerialized } from '../../commonTypes';
import { PlayerDesignator } from '../../commonTypes';
import { GameActionType } from '../../gameActionTypes';
import { GameState } from '../../gameState';
import { CardType } from '../../server/gameObjects/card';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { setUpRandom } from '../setUpRandom';

const setUpGame = () => {
    setUpRandom();
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');

    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.MOVEMENT,
                playerDesignator: PlayerDesignator.PLAYER_B,
            },
            3: {
                cardType: CardType.HARPOON,
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

test('Movement actions can be taken', () => {
    // take movement action
    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.MOVEMENT_SET,
        data: [
            {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_B,
                    strength: 40,
                    tortoise: false,
                },
                fromIslandNumber: 2,
                toIslandNumber: 8,
            },
            {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_B,
                    strength: 20,
                    tortoise: false,
                },
                fromIslandNumber: 16,
                toIslandNumber: 5,
            },
        ],
    });

    // expect characters to have moved
    expect(game.islands[0].characters.length).toEqual(2);
    expect(game.islands[1].characters.length).toEqual(0);
    expect(game.islands[11].characters.length).toEqual(2);
    expect(game.islands[13].characters.length).toEqual(0);

    // the active card index should have changed
    expect(game.activeCardIndex).toEqual(1);

    // the cards should have been discarded
    expect(
        game.players[PlayerDesignator.PLAYER_B].discardPile.some((card) => {
            return card.cardType === CardType.MOVEMENT;
        }),
    ).toBe(true);

    // the game state should have updated
    expect(game.gameState).toEqual(GameState.AWAIT_MOVEMENT_SET);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});

test('Players cannot fail to move', () => {
    // try to not move
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [],
        });
    }).toThrow();
});

test('Players cannot move the wrong characters', () => {
    // try to move the wrong character
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_A,
                        strength: 20,
                        tortoise: false,
                    },
                    fromIslandNumber: 8,
                    toIslandNumber: 2,
                },
            ],
        });
    }).toThrow();
});

test('Players cannot move characters that are not present', () => {
    // try to move a non-existent character
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 30,
                        tortoise: false,
                    },
                    fromIslandNumber: 8,
                    toIslandNumber: 2,
                },
            ],
        });
    }).toThrow();
});

test('Players cannot move to or from a netted island', () => {
    // net an island
    game.players[PlayerDesignator.PLAYER_A].netIsland = 8;

    // try to move to the netted island
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 40,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 8,
                },
            ],
        });
    }).toThrow();

    // net another island
    game.players[PlayerDesignator.PLAYER_A].netIsland = 2;

    // try to move from the netted island
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 40,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 8,
                },
            ],
        });
    }).toThrow();
});

test('Movements cannot be made to the same island', () => {
    // take illegal movement action
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 40,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 2,
                },
            ],
        });
    }).toThrow();
});

test('Cannot overfill an island', () => {
    // move to a small island
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 20,
                        tortoise: false,
                    },
                    fromIslandNumber: 16,
                    toIslandNumber: 4,
                },
            ],
        });
    }).toThrow();

    // put pilings on that island
    game.players[PlayerDesignator.PLAYER_A].pilingsIsland = 4;

    // try the movement again
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 20,
                        tortoise: false,
                    },
                    fromIslandNumber: 16,
                    toIslandNumber: 4,
                },
            ],
        });
    }).not.toThrow();
});

test('Cannot submit two movements for the same character', () => {
    // try to move the same character twice
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 40,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 8,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 40,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 8,
                },
            ],
        });
    }).toThrow();
});

test('Only three movement points can be used', () => {
    // use too many movements
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 40,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 8,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 20,
                        tortoise: false,
                    },
                    fromIslandNumber: 16,
                    toIslandNumber: 5,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 30,
                        tortoise: false,
                    },
                    fromIslandNumber: 1,
                    toIslandNumber: 12,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 20,
                        tortoise: false,
                    },
                    fromIslandNumber: 15,
                    toIslandNumber: 3,
                },
            ],
        });
    }).toThrow();

    // use too many points in one movement
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 40,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 15,
                },
            ],
        });
    }).toThrow();

    // use too many points in multiple movements
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 40,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 11,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 20,
                        tortoise: false,
                    },
                    fromIslandNumber: 16,
                    toIslandNumber: 5,
                },
            ],
        });
    }).toThrow();
});
