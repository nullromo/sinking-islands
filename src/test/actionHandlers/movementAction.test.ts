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

    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
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

test('Movement actions can be taken', () => {
    // take movement action
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.MOVEMENT_SET,
        data: [
            {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_B,
                    strength: 4,
                    tortoise: false,
                },
                fromIslandNumber: 2,
                toIslandNumber: 8,
            },
            {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_B,
                    strength: 2,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [],
        });
    }).toThrow();
});

test('Players cannot move the wrong characters', () => {
    // try to move the wrong character
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_A,
                        strength: 2,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 3,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 4,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 4,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 4,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 2,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 2,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 4,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 8,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 4,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 4,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 8,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 2,
                        tortoise: false,
                    },
                    fromIslandNumber: 16,
                    toIslandNumber: 5,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 3,
                        tortoise: false,
                    },
                    fromIslandNumber: 1,
                    toIslandNumber: 12,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 2,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 4,
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
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.MOVEMENT_SET,
            data: [
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 4,
                        tortoise: false,
                    },
                    fromIslandNumber: 2,
                    toIslandNumber: 11,
                },
                {
                    character: {
                        playerDesignator: PlayerDesignator.PLAYER_B,
                        strength: 2,
                        tortoise: false,
                    },
                    fromIslandNumber: 16,
                    toIslandNumber: 5,
                },
            ],
        });
    }).toThrow();
});

test('Skipping movement action when no legal movements are possible (e.g. netted)', () => {
    setUpRandom();
    const testGame = GameOperations.create();
    testGame.initiative = PlayerDesignator.PLAYER_B;

    GameOperations.assignUserToGame(testGame, 'testuser');
    GameOperations.assignUserToGame(testGame, 'otheruser');

    // Remove all Player B characters from all islands
    testGame.islands.forEach((island) => {
        island.characters = island.characters.filter((character) => {
            return character.playerDesignator !== PlayerDesignator.PLAYER_B;
        });
    });

    // Put one Player B character on island 2
    const targetIsland = testGame.islands.find((island) => {
        return island.islandNumber === 2;
    });
    if (!targetIsland) {
        throw new Error('Island 2 not found');
    }
    targetIsland.characters.push({
        playerDesignator: PlayerDesignator.PLAYER_B,
        strength: 2,
        tortoise: false,
    });

    // Player A has island 2 netted
    testGame.players[PlayerDesignator.PLAYER_A].netIsland = 2;

    // Player B places cards
    GameFlowOperations.takeGameAction(testGame, PlayerDesignator.PLAYER_B, {
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

    // Player A places cards. This will trigger resolveNextCard.
    GameFlowOperations.takeGameAction(testGame, PlayerDesignator.PLAYER_A, {
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

    // Since Player B has no legal movements, Player B's movement card (index 0)
    // should have been skipped, advancing activeCardIndex to 1 (Player A's movement card).
    expect(testGame.activeCardIndex).toEqual(1);
    expect(testGame.gameState).toEqual(GameState.AWAIT_MOVEMENT_SET);
    expect(testGame.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});

test('Skipping movement action when all islands are small capacity and occupied', () => {
    setUpRandom();
    const testGame = GameOperations.create();
    testGame.initiative = PlayerDesignator.PLAYER_B;

    GameOperations.assignUserToGame(testGame, 'testuser');
    GameOperations.assignUserToGame(testGame, 'otheruser');

    // Make all islands small capacity, and occupy them
    testGame.islands.forEach((island, index) => {
        island.smallCapacity = true;

        // Clear existing characters
        island.characters = [];

        // Put exactly 1 character on each island
        if (index === 0) {
            // Player B has exactly 1 character on the first island
            island.characters.push({
                playerDesignator: PlayerDesignator.PLAYER_B,
                strength: 2,
                tortoise: false,
            });
        } else {
            // Player A has 1 character on all other islands
            island.characters.push({
                playerDesignator: PlayerDesignator.PLAYER_A,
                strength: 2,
                tortoise: false,
            });
        }
    });

    // Make sure Player A has no pilings island to avoid changing capacity
    testGame.players[PlayerDesignator.PLAYER_A].pilingsIsland = NaN;
    testGame.players[PlayerDesignator.PLAYER_B].pilingsIsland = NaN;

    // Player B places cards
    GameFlowOperations.takeGameAction(testGame, PlayerDesignator.PLAYER_B, {
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

    // Player A places cards. This will trigger resolveNextCard.
    GameFlowOperations.takeGameAction(testGame, PlayerDesignator.PLAYER_A, {
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

    // Player B has no legal movements since all islands are full small capacity islands
    // and Player B only has 1 character (so B cannot swap/rotate with B's own characters).
    // The activeCardIndex should advance to 1 (Player A's movement card).
    expect(testGame.activeCardIndex).toEqual(1);
    expect(testGame.gameState).toEqual(GameState.AWAIT_MOVEMENT_SET);
    expect(testGame.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});
