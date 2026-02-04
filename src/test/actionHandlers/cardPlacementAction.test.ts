import { beforeEach, expect, test } from '@jest/globals';
import { PlayerDesignator } from '../../commonTypes';
import type { CardPlacementAction } from '../../gameActionTypes';
import { GameActionType } from '../../gameActionTypes';
import { GameState } from '../../gameState';
import { CardType } from '../../server/gameObjects/card';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { setUpRandom } from '../setUpRandom';

beforeEach(() => {
    setUpRandom();
});

const setUpGame = () => {
    const game = GameOperations.create();
    GameOperations.assignUserToGame(game, 'testuser');
    GameOperations.assignUserToGame(game, 'otheruser');
    return game;
};

const basicCardPlacementDataB = (): CardPlacementAction => {
    return {
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
    };
};

const basicCardPlacementDataA = (): CardPlacementAction => {
    return {
        action: GameActionType.CARD_PLACEMENT,
        data: {
            0: {
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
    };
};

test('Cards can be placed', () => {
    // set up a game
    const game = setUpGame();

    // take a card placement action
    GameOperations.takeGameAction(
        game,
        PlayerDesignator.PLAYER_B,
        basicCardPlacementDataB(),
    );

    // expect there to be three cards placed
    expect(
        game.actionOrderTrack.cardSlots.reduce((count, item) => {
            return count + (item === null ? 0 : 1);
        }, 0),
    ).toEqual(3);
});

test('The game ends up in the right state after card placement', () => {
    // set up a game
    const game = setUpGame();

    // take a card placement action
    GameOperations.takeGameAction(
        game,
        PlayerDesignator.PLAYER_B,
        basicCardPlacementDataB(),
    );

    // expect it to be the next player's turn
    expect(game.waitingForPlayer).toEqual(PlayerDesignator.PLAYER_A);

    // expect the active card index to be null
    expect(game.activeCardIndex).toEqual(null);

    // expect the game state to be waiting for more cards to be placed
    expect(game.gameState).toEqual(GameState.AWAIT_CARD_PLACEMENT);
});

test('Players cannot play cards twice', () => {
    // set up a game
    const game = setUpGame();

    // take a card placement action
    GameOperations.takeGameAction(
        game,
        PlayerDesignator.PLAYER_B,
        basicCardPlacementDataB(),
    );

    // take the same action again and it should fail
    expect(() => {
        GameOperations.takeGameAction(
            game,
            PlayerDesignator.PLAYER_B,
            basicCardPlacementDataB(),
        );
    }).toThrow();

    // the other player places cards
    GameOperations.takeGameAction(
        game,
        PlayerDesignator.PLAYER_A,
        basicCardPlacementDataA(),
    );

    // the first player still cannot place cards again
    expect(() => {
        GameOperations.takeGameAction(
            game,
            PlayerDesignator.PLAYER_B,
            basicCardPlacementDataB(),
        );
    }).toThrow();

    // the second player also cannot place cards
    expect(() => {
        GameOperations.takeGameAction(
            game,
            PlayerDesignator.PLAYER_A,
            basicCardPlacementDataA(),
        );
    }).toThrow();
});

test('Players can only play their own cards', () => {
    // set up a game
    const game = setUpGame();

    // take a card placement action with the wrong cards
    expect(() => {
        GameOperations.takeGameAction(
            game,
            PlayerDesignator.PLAYER_B,
            basicCardPlacementDataA(),
        );
    }).toThrow();
});

test('Players must play exactly 3 cards', () => {
    // set up a game
    const game = setUpGame();

    // play only 1 card
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.CARD_PLACEMENT,
            data: {
                0: {
                    cardType: CardType.MOVEMENT,
                    playerDesignator: PlayerDesignator.PLAYER_B,
                },
            },
        });
    }).toThrow();

    // play 4 cards
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
            action: GameActionType.CARD_PLACEMENT,
            data: {
                0: {
                    cardType: CardType.MOVEMENT,
                    playerDesignator: PlayerDesignator.PLAYER_B,
                },
                1: {
                    cardType: CardType.MOVEMENT,
                    playerDesignator: PlayerDesignator.PLAYER_B,
                },
                2: {
                    cardType: CardType.MOVEMENT,
                    playerDesignator: PlayerDesignator.PLAYER_B,
                },
                3: {
                    cardType: CardType.MOVEMENT,
                    playerDesignator: PlayerDesignator.PLAYER_B,
                },
            },
        });
    }).toThrow();
});

test('Players must play cards that exist in their hands', () => {
    // set up a game
    const game = setUpGame();

    // modify template data
    const data = basicCardPlacementDataB();
    data.data[1].cardType = CardType.FLYING_FISH;

    // playing should fail
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, data);
    }).toThrow();
});

test('Players cannot play two cards in the same area', () => {
    // set up a game
    const game = setUpGame();

    // modify template data
    const data = basicCardPlacementDataB();
    data.data[0] = data.data[3];
    delete data.data[3];

    // playing should fail
    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, data);
    }).toThrow();
});

test('Cards must be placed in empty slots', () => {
    // set up a game
    const game = setUpGame();

    // take a card placement action
    GameOperations.takeGameAction(
        game,
        PlayerDesignator.PLAYER_B,
        basicCardPlacementDataB(),
    );

    // modify template data
    const data = basicCardPlacementDataA();
    data.data[1] = data.data[0];
    delete data.data[0];

    expect(() => {
        GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, data);
    }).toThrow();
});
