import type { IslandSerialized } from './commonTypes';
import type { ConvertedMovementSet } from './convertActionData';

/**
 * Returns the number of movement points that it takes to get from one
 * island to another.
 */
const countSpacesBetweenIslands = (
    islands: IslandSerialized[],
    fromIslandNumber: number,
    toIslandNumber: number,
) => {
    // find the indices of the islands
    const fromIndex = islands.findIndex((island) => {
        return island.islandNumber === fromIslandNumber;
    });
    const toIndex = islands.findIndex((island) => {
        return island.islandNumber === toIslandNumber;
    });

    // if either island is not found, then just assume the distance is 0
    if (fromIndex === -1 || toIndex === -1) {
        return 0;
    }

    // use the minimum distance between the two islands
    return Math.min(
        Math.abs(fromIndex - toIndex + islands.length) % islands.length,
        Math.abs(fromIndex - toIndex - islands.length) % islands.length,
    );
};

export const computeMovementSteps = (
    islands: IslandSerialized[],
    convertedMovementSet: ConvertedMovementSet,
) => {
    return convertedMovementSet.reduce((total, convertedMovement) => {
        return (
            total +
            countSpacesBetweenIslands(
                islands,
                convertedMovement.fromIsland.islandNumber,
                convertedMovement.toIsland.islandNumber,
            )
        );
    }, 0);
};
