import { beforeEach, expect, test } from '@jest/globals';
import type { GameSerialized } from '../../commonTypes';
import { CardType, PlayerDesignator } from '../../commonTypes';
import { GameActionType } from '../../gameActionTypes';
import { GameState } from '../../gameState';
import { GameFlowOperations } from '../../server/gameFlowOperations';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { setUpRandom } from '../setUpRandom';

const setUpGame = () => {
    setUpRandom();
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');

    game.players[PlayerDesignator.PLAYER_A].hand[0].cardType = CardType.FOG;

    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
                cardType: CardType.FOG,
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
                cardType: CardType.FLYING_FISH,
                playerDesignator: PlayerDesignator.PLAYER_A,
            },
            2: {
                cardType: CardType.FOG,
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

test('Fog actions can be taken', () => {
    // take fog action
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.FOG_TARGET,
        data: 2,
    });

    // a card should have been fogged
    expect(game.actionOrderTrack.cardSlots[2]).toEqual(null);

    // the active card index should have changed
    expect(game.activeCardIndex).toEqual(1);

    // the cards should have been discarded
    expect(
        game.players[PlayerDesignator.PLAYER_A].discardPile.some((card) => {
            return card.cardType === CardType.FOG;
        }),
    ).toBe(true);
    expect(
        game.players[PlayerDesignator.PLAYER_B].discardPile.some((card) => {
            return card.cardType === CardType.FOG;
        }),
    ).toBe(true);

    // the game state should have updated
    expect(game.gameState).toEqual(GameState.AWAIT_FLYING_FISH_MOVEMENT);
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);
});

test('Players cannot select illegal fog slots', () => {
    // using slots outside the track should fail
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.FOG_TARGET,
            data: -1,
        });
    }).toThrow();
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.FOG_TARGET,
            data: 6,
        });
    }).toThrow();

    // a fog cannot target itself
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.FOG_TARGET,
            data: 0,
        });
    }).toThrow();

    // fog card 4 and advance to the next fog
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.FOG_TARGET,
        data: 4,
    });

    // take the next action so we can get to the next fog
    GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
        action: GameActionType.FLYING_FISH_MOVEMENT,
        data: {
            character: {
                playerDesignator: PlayerDesignator.PLAYER_A,
                strength: 20,
                tortoise: false,
            },
            fromIslandNumber: 7,
            toIslandNumber: 5,
        },
    });

    // now try to fog the empty slot
    expect(() => {
        GameFlowOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
            action: GameActionType.FOG_TARGET,
            data: 4,
        });
    }).toThrow();
});
