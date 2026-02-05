import { beforeEach, test } from '@jest/globals';
import type { GameSerialized } from '../../commonTypes';
import { PlayerDesignator } from '../../commonTypes';
import { GameActionType } from '../../gameActionTypes';
import { CardType } from '../../server/gameObjects/card';
import { GameOperations } from '../../server/gameObjects/gameOperations';
import { fullObject } from '../../server/util';
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
            playerDesignator: PlayerDesignator.PLAYER_B,
            strength: 20,
            tortoise: false,
        },
        fromIslandNumber: 1,
        toIslandNumber: 1,
    };
};

test('Flying fish actions can be taken', () => {
    //console.log(fullObject(game));

    // take flying fish action
    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_B, {
        action: GameActionType.FLYING_FISH_MOVEMENT,
        data: basicFlyingFishData(),
    });
});
