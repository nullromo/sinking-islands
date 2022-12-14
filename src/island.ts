import { Character } from './character';

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
    public readonly largeCapacity: boolean;

    // list of characters present on the island
    private readonly characters: Character[] = [];

    public constructor(
        islandNumber: number,
        islandType: IslandType,
        largeCapacity: boolean,
    ) {
        this.islandNumber = islandNumber;
        this.islandType = islandType;
        this.largeCapacity = largeCapacity;
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
