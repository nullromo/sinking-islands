import type { GameSerialized } from '../../info/commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';

export const checkTidalSurgeTargetLegal = (
    game: GameSerialized,
    tidalSurgeTarget: number,
) => {
    if (
        !GameOperations.getAdjacentIslands(game, game.nextIslandToSink).some(
            (island) => {
                return island.islandNumber === tidalSurgeTarget;
            },
        )
    ) {
        throw new Error('Cannot tidal surge to a non-adjacent island.');
    }
};

export const handleTidalSurge = (
    game: GameSerialized,
    tidalSurgeTarget: number,
) => {
    checkTidalSurgeTargetLegal(game, tidalSurgeTarget);

    // move the rising waters marker
    GameOperations.log(game, `The tide surges to island ${tidalSurgeTarget}.`);
    game.nextIslandToSink = tidalSurgeTarget;
};
