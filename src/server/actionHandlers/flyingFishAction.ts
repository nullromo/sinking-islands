import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
    PlayerDesignator,
} from '../../commonTypes';
import { convertFlyingFishMovementToIslands } from '../../convertActionData';
import { CardType } from '../gameObjects/card';
import { GameOperations } from '../gameObjects/gameOperations';
import { IslandOperations } from '../gameObjects/islandOperations';
import type { FlyingFishMovement } from '../gameObjects/player';
import { PlayerOperations } from '../gameObjects/playerOperations';

const checkFlyingFishLegal = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    convertedMovement: {
        character: CharacterSerialized;
        fromIsland: IslandSerialized;
        toIsland: IslandSerialized;
    },
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
    const convertedMovement = convertFlyingFishMovementToIslands(
        game,
        flyingFishMovement,
    );
    checkFlyingFishLegal(game, playerDesignator, convertedMovement);

    // move the character
    console.log(
        `Player ${
            flyingFishMovement.character.playerDesignator
        }'s ${flyingFishMovement.character.strength}-strength ${
            flyingFishMovement.character.tortoise ? 'tortoise' : 'character'
        } flies from island ${
            flyingFishMovement.fromIslandNumber
        } to island ${flyingFishMovement.toIslandNumber}.`,
    );
    IslandOperations.removeCharacter(
        convertedMovement.fromIsland,
        flyingFishMovement.character,
    );
    IslandOperations.addCharacter(
        convertedMovement.toIsland,
        flyingFishMovement.character,
    );

    // reset tortoise and reclaim card if necessary
    if (flyingFishMovement.character.tortoise) {
        flyingFishMovement.character.tortoise = false;
        PlayerOperations.reclaim(
            game.players[playerDesignator],
            CardType.TORTOISE,
        );
    }
};
