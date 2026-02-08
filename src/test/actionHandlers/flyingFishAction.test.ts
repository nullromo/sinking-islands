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
    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.FLYING_FISH,
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

const basicFlyingFishData = () => {
    return {
        character: {
            playerDesignator: PlayerDesignator.PLAYER_A,
            strength: 20,
            tortoise: false,
        },
        fromIslandNumber: 7,
        toIslandNumber: 5,
    };
};

test('Flying fish actions can be taken', () => {
    // take flying fish action
    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
        action: GameActionType.FLYING_FISH_MOVEMENT,
        data: basicFlyingFishData(),
    });

    // the character should have moved
    const island5 = game.islands.find((island) => {
        return island.islandNumber === 5;
    });
    const island7 = game.islands.find((island) => {
        return island.islandNumber === 7;
    });
    expect(island5?.characters.length).toEqual(2);
    expect(island7?.characters.length).toEqual(0);

    // the active card index should have changed
    expect(game.activeCardIndex).toEqual(1);

    // the card should have been discarded
    expect(
        game.players[PlayerDesignator.PLAYER_A].discardPile.some((card) => {
            return card.cardType === CardType.FLYING_FISH;
        }),
    ).toBe(true);

    // the game state should have updated
    expect(game.gameState).toEqual(GameState.AWAIT_MOVEMENT_SET);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_B);
});

test('Players must flying fish their own characters', () => {
    // modify data
    const data = basicFlyingFishData();
    data.character.playerDesignator = PlayerDesignator.PLAYER_B;

    // cannot perform movement
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
            action: GameActionType.FLYING_FISH_MOVEMENT,
            data,
        });
    }).toThrow();
});

test('Players cannot move to full islands', () => {
    // modify data
    const data = basicFlyingFishData();
    data.toIslandNumber = 13;

    // cannot perform movement
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
            action: GameActionType.FLYING_FISH_MOVEMENT,
            data,
        });
    }).toThrow();
});

test('Players cannot move a character that is not present', () => {
    // modify data
    const data = basicFlyingFishData();
    data.character.strength = 40;

    // cannot perform movement
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
            action: GameActionType.FLYING_FISH_MOVEMENT,
            data,
        });
    }).toThrow();
});
