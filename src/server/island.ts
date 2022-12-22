import type {
    CharacterSerialized,
    IslandSerialized,
    PlayerDesignator,
} from '../commonTypes';
import { Character } from './character';
import { fullObject } from './util';

/**
 * Unique IDs for each type of island.
 */
export enum IslandType {
    NORMAL = 'NORMAL',
    SACRED = 'SACRED',
    VOLCANO = 'VOLCANO',
}

/**
 * Represents an island.
 */
export class Island {
    // the island's number, type, and capacity
    public readonly islandNumber: number;
    public readonly islandType: IslandType;
    public readonly smallCapacity: boolean;

    // list of characters present on the island
    private characters: Character[] = [];

    public constructor(
        islandNumber: number,
        islandType: IslandType,
        smallCapacity: boolean,
    ) {
        this.islandNumber = islandNumber;
        this.islandType = islandType;
        this.smallCapacity = smallCapacity;
    }

    /**
     * Returns the list of characters.
     */
    public readonly getCharacters = () => {
        return [...this.characters];
    };

    /**
     * Adds the given character to the island.
     */
    public readonly addCharacter = (character: CharacterSerialized) => {
        this.characters.push(Character.deserialize(character));
    };

    /**
     * Attempts to find a character on this island.
     */
    public readonly findCharacter = (characterToFind: CharacterSerialized) => {
        return this.characters.find((character) => {
            return character.equals(characterToFind);
        });
    };

    /**
     * Removes a character matching the given character from the island.
     */
    public readonly removeCharacter = (
        characterToRemove: CharacterSerialized,
    ) => {
        const index = this.characters.findIndex((character) => {
            return character.equals(characterToRemove);
        });
        if (index >= 0) {
            this.characters.splice(index, 1);
        } else {
            throw new Error(
                `There is no character matching ${fullObject(
                    characterToRemove,
                )} on this island (${fullObject(this)}).`,
            );
        }
    };

    /**
     * Removes all the characters of the given player.
     */
    public readonly removeCharactersOfPlayer = (
        playerDesignator: PlayerDesignator,
    ) => {
        this.characters = this.characters.filter((character) => {
            return character.playerDesignator !== playerDesignator;
        });
    };

    public readonly serialize = (): IslandSerialized => {
        return {
            characters: this.characters.map((character) => {
                return character.serialize();
            }),
            islandNumber: this.islandNumber,
            islandType: this.islandType,
            smallCapacity: this.smallCapacity,
        };
    };
}
