import type { IslandSerialized } from './commonTypes';
import type { MovementSet } from './server/player';

/**
 * Returns the number of movement points that it takes to get from one
 * island to another.
 */
const countSpacesBetweenIslands = (
    islands: IslandSerialized[],
    fromIslandNumber: number,
    toIslandNumber: number,
) => {
    const fromIndex = islands.findIndex((island) => {
        return island.islandNumber === fromIslandNumber;
    });
    const toIndex = islands.findIndex((island) => {
        return island.islandNumber === toIslandNumber;
    });
    return Math.min(
        Math.abs(fromIndex - toIndex + islands.length) % islands.length,
        Math.abs(fromIndex - toIndex - islands.length) % islands.length,
    );
};

export const computeMovementSteps = (
    islands: IslandSerialized[],
    movementSet: MovementSet,
) => {
    return movementSet.reduce((total, movement) => {
        return (
            total +
            countSpacesBetweenIslands(
                islands,
                movement.fromIslandNumber,
                movement.toIslandNumber,
            )
        );
    }, 0);
};
