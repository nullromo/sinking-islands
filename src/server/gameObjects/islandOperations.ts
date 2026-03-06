import type {
    CharacterSerialized,
    IslandSerialized,
    IslandType,
    PlayerDesignator,
} from '../../info/commonTypes';
import { fullObject } from '../util';
import { CharacterOperations } from './characterOperations';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace IslandOperations {
    export const create = (
        islandNumber: number,
        islandType: IslandType,
        smallCapacity: boolean,
    ): IslandSerialized => {
        return { characters: [], islandNumber, islandType, smallCapacity };
    };

    /**
     * Adds the given character to the island.
     */
    export const addCharacter = (
        island: IslandSerialized,
        character: CharacterSerialized,
    ) => {
        island.characters.push(character);
    };

    /**
     * Attempts to find a character on this island.
     */
    export const findCharacter = (
        island: IslandSerialized,
        characterToFind: CharacterSerialized,
    ) => {
        return island.characters.find((character) => {
            return CharacterOperations.equals(character, characterToFind);
        });
    };

    /**
     * Removes a character matching the given character from the island.
     */
    export const removeCharacter = (
        island: IslandSerialized,
        characterToRemove: CharacterSerialized,
    ) => {
        const index = island.characters.findIndex((character) => {
            return CharacterOperations.equals(character, characterToRemove);
        });
        if (index >= 0) {
            island.characters.splice(index, 1);
        } else {
            throw new Error(
                `There is no character matching ${fullObject(
                    characterToRemove,
                )} on this island (${fullObject(island)}).`,
            );
        }
    };

    /**
     * Removes all the characters of the given player.
     */
    export const removeCharactersOfPlayer = (
        island: IslandSerialized,
        playerDesignator: PlayerDesignator,
    ) => {
        island.characters = island.characters.filter((character) => {
            return character.playerDesignator !== playerDesignator;
        });
    };
}
