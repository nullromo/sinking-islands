import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
    PlayerDesignator,
} from '../../commonTypes';
import { convertTargetCharacterToIslands } from '../../convertActionData';
import { CharacterOperations } from '../gameObjects/characterOperations';
import { GameOperations } from '../gameObjects/gameOperations';
import { IslandOperations } from '../gameObjects/islandOperations';
import type { TargetCharacter } from '../gameObjects/player';

export const checkHarpoonTargetLegal = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    convertedTarget: {
        targetIsland: IslandSerialized;
        character: CharacterSerialized;
    },
) => {
    // if the target is a tortoise, it's not valid
    if (convertedTarget.character.tortoise) {
        throw new Error('Cannot harpoon a tortoise.');
    }

    // the player cannot shoot their own characters
    if (playerDesignator === convertedTarget.character.playerDesignator) {
        throw new Error('Cannot harpoon your own character.');
    }

    // if there are no characters matching the target on the target island,
    // then it is not valid
    if (
        !convertedTarget.targetIsland.characters.some((character) => {
            return CharacterOperations.equals(
                character,
                convertedTarget.character,
            );
        })
    ) {
        throw new Error('Cannot harpoon a character that does not exist.');
    }

    // find the adjacent islands and make sure there is an enemy of the
    // target in range
    if (
        !GameOperations.getAdjacentIslands(
            game,
            convertedTarget.targetIsland.islandNumber,
        ).some((island) => {
            return island.characters.some((character) => {
                return character.playerDesignator === playerDesignator;
            });
        })
    ) {
        throw new Error(
            'Cannot harpoon a character that is out of harpoon range.',
        );
    }
};

export const handleHarpoon = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    harpoonTarget: TargetCharacter,
) => {
    const convertedTarget = convertTargetCharacterToIslands(
        game,
        harpoonTarget,
    );
    checkHarpoonTargetLegal(game, playerDesignator, convertedTarget);

    // kill the target
    console.log(
        `Player ${harpoonTarget.character.playerDesignator}'s ${harpoonTarget.character.strength}-strength character on island ${harpoonTarget.islandNumber} is harpooned.`,
    );
    IslandOperations.removeCharacter(
        convertedTarget.targetIsland,
        harpoonTarget.character,
    );
};
