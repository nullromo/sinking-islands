import type { GameSerialized } from './commonTypes';
import { GameOperations } from './server/gameObjects/gameOperations';
import type { FlyingFishMovement } from './server/gameObjects/player';

export const convertFlyingFishMovementToIslands = (
    game: GameSerialized,
    flyingFishMovement: FlyingFishMovement,
) => {
    // find the island the character is moving from
    const fromIsland = GameOperations.findIsland(
        game,
        flyingFishMovement.fromIslandNumber,
    );

    // find the island the character is moving to
    const toIsland = GameOperations.findIsland(
        game,
        flyingFishMovement.toIslandNumber,
    );

    // can't move to an island that already sank
    if (!toIsland) {
        throw new Error("Cannot move to an island that doesn't exist.");
    }
    // can't move from an island that doesn't exist
    if (!fromIsland) {
        throw new Error("Cannot move from an island that doesn't exist.");
    }

    return { character: flyingFishMovement.character, fromIsland, toIsland };
};
