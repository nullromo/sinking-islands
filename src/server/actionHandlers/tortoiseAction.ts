import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
    PlayerDesignator,
} from '../../commonTypes';
import { convertTargetCharacterToIslands } from '../../convertActionData';
import { CharacterOperations } from '../gameObjects/characterOperations';
import { IslandOperations } from '../gameObjects/islandOperations';
import type { TargetCharacter } from '../gameObjects/player';

const checkTortoiseTargetLegal = (
    playerDesignator: PlayerDesignator,
    convertedTarget: {
        targetIsland: IslandSerialized;
        character: CharacterSerialized;
    },
) => {
    // the player must target their own character
    if (convertedTarget.character.playerDesignator !== playerDesignator) {
        throw new Error("Cannot target a character that isn't yours.");
    }

    // the character must exist
    if (
        !convertedTarget.targetIsland.characters.some((character) => {
            return CharacterOperations.equals(
                character,
                convertedTarget.character,
            );
        })
    ) {
        throw new Error('Cannot tortoise a character that does not exist.');
    }
};

export const handleTortoise = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    tortoiseTarget: TargetCharacter,
) => {
    const convertedTarget = convertTargetCharacterToIslands(
        game,
        tortoiseTarget,
    );
    checkTortoiseTargetLegal(playerDesignator, convertedTarget);

    // make the target a tortoise
    console.log(
        `Player ${tortoiseTarget.character.playerDesignator}'s ${tortoiseTarget.character.strength}-strength character on island ${tortoiseTarget.islandNumber} turns into a tortoise.`,
    );
    (
        IslandOperations.findCharacter(
            convertedTarget.targetIsland,
            tortoiseTarget.character,
        ) as CharacterSerialized
    ).tortoise = true;
};
