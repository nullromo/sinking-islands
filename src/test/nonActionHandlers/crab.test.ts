import { beforeEach, expect, test } from '@jest/globals';
import type { GameSerialized } from '../../info/commonTypes';
import { CardType, PlayerDesignator } from '../../info/commonTypes';
import { GameActionType } from '../../info/gameActionTypes';
import { GameFlowOperations } from '../../server/gameFlowOperations';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { CharacterOperations } from '../../server/gameObjects/characterOperations';
import { IslandOperations } from '../../server/gameObjects/islandOperations';
import { setUpRandom } from '../setUpRandom';

const setUpGame = () => {
    setUpRandom();
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');

    // Ensure Player A has WEAKNESS in hand and Player B has CRAB in hand
    game.players[PlayerDesignator.PLAYER_A].hand[0].cardType =
        CardType.WEAKNESS;
    game.players[PlayerDesignator.PLAYER_B].hand[0].cardType = CardType.CRAB;

    return game;
};

let game: GameSerialized;

beforeEach(() => {
    game = setUpGame();
});

test('Crab combat: when the crab player has lower strength than the opponent, nobody dies', () => {
    // Set up island 5:
    // Player B has 10 characters.
    // Under weakness, Player B's characters will have strength 1 each, summing to 10.
    // Player A has 3 characters of strength 4.
    // Since Player A is not weakened, their strength is 3 * 4 = 12.
    const island5 = game.islands.find((island) => {
        return island.islandNumber === 5;
    });
    expect(island5).toBeDefined();
    if (island5) {
        island5.characters = [];

        // Player B - 10 characters (strength 2 normally, but will be weakened)
        for (let i = 0; i < 10; i += 1) {
            IslandOperations.addCharacter(
                island5,
                CharacterOperations.create(PlayerDesignator.PLAYER_B, 2),
            );
        }

        // Player A - 3 characters of strength 4
        for (let i = 0; i < 3; i += 1) {
            IslandOperations.addCharacter(
                island5,
                CharacterOperations.create(PlayerDesignator.PLAYER_A, 4),
            );
        }
    }

    // Place cards:
    // Slot 0: Player A plays WEAKNESS (afflicts Player B with weakness).
    // Slot 1: Player B plays CRAB.
    // Slot 2: Player B plays MOVEMENT (to fill placement track).
    // Slot 3: Player A plays MOVEMENT.
    // Slot 4: Player B plays MOVEMENT.
    // Slot 5: Player A plays MOVEMENT.
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            1: {
                cardType: CardType.CRAB,
                playerDesignator: PlayerDesignator.PLAYER_B,
            },
            3: {
                cardType: CardType.MOVEMENT,
                playerDesignator: PlayerDesignator.PLAYER_B,
            },
            5: {
                cardType: CardType.MOVEMENT,
                playerDesignator: PlayerDesignator.PLAYER_B,
            },
        },
    });

    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.WEAKNESS,
                playerDesignator: PlayerDesignator.PLAYER_A,
            },
            2: {
                cardType: CardType.MOVEMENT,
                playerDesignator: PlayerDesignator.PLAYER_A,
            },
            4: {
                cardType: CardType.MOVEMENT,
                playerDesignator: PlayerDesignator.PLAYER_A,
            },
        },
    });

    // At this point:
    // Slot 0 (WEAKNESS by A) has resolved, afflicting Player B with weakness.
    expect(game.players[PlayerDesignator.PLAYER_B].weakness).toBe(true);

    // Slot 1 (CRAB by B) is now resolving. Since B is the CRAB player, B needs to execute it.
    // But since Crab is a non-action card, it resolves automatically when game resolved slot 1!
    // Wait, why did the game stop at slot 1?
    // Let's check: CRAB is a non-action card, so when placement completes, the game:
    // 1. Resolves slot 0 (WEAKNESS) -> continueResolving = true.
    // 2. Resolves slot 1 (CRAB) -> continueResolving = true.
    // 3. Resolves slot 2 (MOVEMENT by A) -> requires MOVEMENT_SET action from Player A.
    // So the game should be in state AWAIT_MOVEMENT_SET waiting for Player A.
    // Since both WEAKNESS and CRAB have already resolved automatically, we can inspect island 5 immediately!
    expect(island5?.characters.length).toBe(13); // 10 from Player B, 3 from Player A

    // Ensure all 10 of Player B's characters and all 3 of Player A's characters survived
    const playerBCount = island5?.characters.filter((c) => {
        return c.playerDesignator === PlayerDesignator.PLAYER_B;
    }).length;
    const playerACount = island5?.characters.filter((c) => {
        return c.playerDesignator === PlayerDesignator.PLAYER_A;
    }).length;

    expect(playerBCount).toBe(10);
    expect(playerACount).toBe(3);
});
