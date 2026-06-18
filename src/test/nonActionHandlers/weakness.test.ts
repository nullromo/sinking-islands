import { beforeEach, expect, test } from '@jest/globals';
import type { GameSerialized } from '../../info/commonTypes';
import { CardType, PlayerDesignator } from '../../info/commonTypes';
import { GameActionType } from '../../info/gameActionTypes';
import { GameState } from '../../info/gameState';
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

    // Ensure Player A starts with a Weakness card in hand
    game.players[PlayerDesignator.PLAYER_A].hand[0].cardType =
        CardType.WEAKNESS;

    return game;
};

let game: GameSerialized;

beforeEach(() => {
    game = setUpGame();
});

test('Weakness card resolves automatically, afflicting the opponent with weakness', () => {
    // Both players place their cards. Player A plays WEAKNESS in slot 0.
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            1: {
                cardType: CardType.MOVEMENT,
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
            0: {
                cardType: CardType.WEAKNESS,
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

    // Verify Player B is afflicted with weakness, while Player A is not
    expect(game.players[PlayerDesignator.PLAYER_B].weakness).toBe(true);
    expect(game.players[PlayerDesignator.PLAYER_A].weakness).toBe(false);

    // Verify correct log message
    const weaknessLog = game.messages.find((msg) => {
        return msg.includes('characters are afflicted with weakness');
    });
    expect(weaknessLog).toBeDefined();
    expect(weaknessLog).toContain(
        "Player Player B's characters are afflicted with weakness.",
    );

    // Verify game transitions to waiting for Player B's slot 1 movement
    expect(game.activeCardIndex).toEqual(1);
    expect(game.gameState).toEqual(GameState.AWAIT_MOVEMENT_SET);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_B);
});

test('Weakness correctly reduces character strength in Crab combat', () => {
    // Set up a controlled island state on island 5 with matching strength characters
    const island5 = game.islands.find((island) => {
        return island.islandNumber === 5;
    });
    expect(island5).toBeDefined();
    if (island5) {
        island5.characters = [];
        IslandOperations.addCharacter(
            island5,
            CharacterOperations.create(PlayerDesignator.PLAYER_A, 2),
        );
        IslandOperations.addCharacter(
            island5,
            CharacterOperations.create(PlayerDesignator.PLAYER_B, 2),
        );
    }

    // Place cards. Player A plays WEAKNESS in slot 0, and CRAB in slot 4.
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            1: {
                cardType: CardType.MOVEMENT,
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
            0: {
                cardType: CardType.WEAKNESS,
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

    expect(game.players[PlayerDesignator.PLAYER_B].weakness).toBe(true);

    // Execute slot 1: Player B's Movement
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

    // Execute slot 2: Player A's Movement
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
        action: GameActionType.MOVEMENT_SET,
        data: [
            {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_A,
                    strength: 2,
                    tortoise: false,
                },
                fromIslandNumber: 8,
                toIslandNumber: 11,
            },
        ],
    });

    // Execute slot 3: Player B's Movement.
    // Resolving this movement will automatically trigger the resolution of non-action cards in the following slots:
    // Slot 4: Player A's Crab combat (Player A strength 2 vs weakened Player B strength 1).
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.MOVEMENT_SET,
        data: [
            {
                character: {
                    playerDesignator: PlayerDesignator.PLAYER_B,
                    strength: 2,
                    tortoise: false,
                },
                fromIslandNumber: 9,
                toIslandNumber: 15,
            },
        ],
    });

    // Verify that Player B's character on island 5 was defeated in Crab combat due to being weakened
    expect(island5?.characters.length).toBe(1);
    expect(island5?.characters[0].playerDesignator).toBe(
        PlayerDesignator.PLAYER_A,
    );
});
