import type {
    FlyingFishMovement,
    GameSerialized,
    PlayerDesignator,
} from '../../info/commonTypes';
import type { ConvertedMovement } from '../../info/convertActionData';
import { convertMovementToIslands } from '../../info/convertActionData';
import { GameOperations } from '../gameObjects/gameOperations';
import { IslandOperations } from '../gameObjects/islandOperations';

const checkFlyingFishLegal = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    convertedMovement: ConvertedMovement,
) => {
    // the player must move their own character
    if (convertedMovement.character.playerDesignator !== playerDesignator) {
        throw new Error("Cannot move a character that isn't yours.");
    }

    // can't move to an island that is at full capacity
    if (GameOperations.islandIsFull(game, convertedMovement.toIsland)) {
        throw new Error('Cannot move to an island that is full.');
    }

    // can't move a character that is not there
    if (
        !IslandOperations.findCharacter(
            convertedMovement.fromIsland,
            convertedMovement.character,
        )
    ) {
        throw new Error("Cannot move a character that isn't there.");
    }
};

export const handleFlyingFish = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    flyingFishMovement: FlyingFishMovement,
) => {
    const convertedMovement = convertMovementToIslands(
        game,
        flyingFishMovement,
    );
    checkFlyingFishLegal(game, playerDesignator, convertedMovement);

    // move the character
    GameOperations.moveCharacter(
        game,
        flyingFishMovement.character,
        convertedMovement.fromIsland,
        convertedMovement.toIsland,
        'flies',
    );
};
