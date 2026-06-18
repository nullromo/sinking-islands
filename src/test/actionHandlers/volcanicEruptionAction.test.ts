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

test('Characters flee from lava flows to adjacent safe islands', () => {
    // Target volcano island 6 for eruption
    const volcanoNumber = 6;
    const lavaFlowIslands = GameOperations.getAdjacentIslands(
        game,
        volcanoNumber,
    );
    expect(lavaFlowIslands.length).toBe(2);

    const [leftIsland, rightIsland] = lavaFlowIslands;

    // Find safe islands (adjacent to lava flow islands, but not the volcano itself)
    const leftSafeIsland = GameOperations.getAdjacentIslands(
        game,
        leftIsland.islandNumber,
    ).find((island) => {
        return island.islandNumber !== volcanoNumber;
    });
    const rightSafeIsland = GameOperations.getAdjacentIslands(
        game,
        rightIsland.islandNumber,
    ).find((island) => {
        return island.islandNumber !== volcanoNumber;
    });

    expect(leftSafeIsland).toBeDefined();
    expect(rightSafeIsland).toBeDefined();

    if (leftSafeIsland && rightSafeIsland) {
        // Ensure safe islands have large capacity so fleeing is successful
        leftSafeIsland.smallCapacity = false;
        rightSafeIsland.smallCapacity = false;

        // Clear existing characters on all affected/safe islands for clean tracking
        leftIsland.characters = [];
        rightIsland.characters = [];
        leftSafeIsland.characters = [];
        rightSafeIsland.characters = [];

        // Put a character on the left lava flow island
        const charA = {
            playerDesignator: PlayerDesignator.PLAYER_A,
            strength: 2,
            tortoise: false,
        };
        leftIsland.characters.push(charA);

        // Put a character on the right lava flow island
        const charB = {
            playerDesignator: PlayerDesignator.PLAYER_B,
            strength: 3,
            tortoise: false,
        };
        rightIsland.characters.push(charB);

        // Execute volcanic eruption
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.VOLCANIC_ERUPTION_TARGET,
            data: volcanoNumber,
        });

        // Verify that the characters fled to their respective safe islands
        expect(leftSafeIsland.characters).toContainEqual(charA);
        expect(rightSafeIsland.characters).toContainEqual(charB);

        // Verify that the lava flow islands no longer contain these characters
        expect(leftIsland.characters.length).toBe(0);
        expect(rightIsland.characters.length).toBe(0);
    }
});
