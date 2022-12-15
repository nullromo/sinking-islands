import { Character } from './character';
import { PlayerDesignator } from './player';

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
    public readonly addCharacter = (character: Character) => {
        this.characters.push(character);
    };

    /**
     * Attempts to find a character on this island.
     */
    public readonly findCharacter = (characterToFind: Character) => {
        return this.characters.find((character) => {
            return character.dump() === characterToFind.dump();
        });
    };

    /**
     * Removes a character matching the given character from the island.
     */
    public readonly removeCharacter = (characterToRemove: Character) => {
        const index = this.characters.findIndex((character) => {
            return character.dump() === characterToRemove.dump();
        });
        if (index >= 0) {
            this.characters.splice(index, 1);
        } else {
            throw new Error(
                `There is no character matching ${characterToRemove.dump()} on this island (${this.dump()}).`,
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

    /**
     * Returns a string representation of the island.
     */
    public readonly dump = () => {
        return `${this.islandNumber}:${this.characters
            .map((character) => {
                return character.dump();
            })
            .join(',')}`;
    };
}
