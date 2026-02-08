import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
    NormalMovement,
    TargetCharacter,
} from './commonTypes';
import { GameOperations } from './server/gameObjects/gameOperations';

export type ConvertedMovement = {
    character: CharacterSerialized;
    fromIsland: IslandSerialized;
    toIsland: IslandSerialized;
};

export type ConvertedMovementSet = ConvertedMovement[];

export const convertMovementToIslands = (
    game: GameSerialized,
    movement: NormalMovement,
): ConvertedMovement => {
    // find the island the character is moving from
    const fromIsland = GameOperations.findIsland(
        game,
        movement.fromIslandNumber,
    );

    // find the island the character is moving to
    const toIsland = GameOperations.findIsland(game, movement.toIslandNumber);

    // can't move to an island that already sank
    if (!toIsland) {
        throw new Error("Cannot move to an island that doesn't exist.");
    }
    // can't move from an island that doesn't exist
    if (!fromIsland) {
        throw new Error("Cannot move from an island that doesn't exist.");
    }

    return { character: movement.character, fromIsland, toIsland };
};

export const convertTargetCharacterToIslands = (
    game: GameSerialized,
    targetCharacter: TargetCharacter,
) => {
    // find the island being targeted
    const targetIsland = GameOperations.findIsland(
        game,
        targetCharacter.islandNumber,
    );

    // if the island does not exist, the target is not valid
    if (!targetIsland) {
        throw new Error('Cannot harpoon on an island that does not exist.');
    }

    return { character: targetCharacter.character, targetIsland };
};
