import { beforeAll, test } from '@jest/globals';
import { GameOperations } from '../server/gameObjects/gameOperations';
import { setUpRandom } from './setUpRandom';
import { PlayerDesignator } from '../commonTypes';
import { GameActionType } from '../gameActionTypes';

beforeAll(() => {
    setUpRandom();
});

test('Game actions can be taken', () => {
    const game = GameOperations.create();

    GameOperations.takeGameAction(game, PlayerDesignator.PLAYER_A, {
        action: GameActionType.NET_TARGET,
        data: 0,
    });
});
