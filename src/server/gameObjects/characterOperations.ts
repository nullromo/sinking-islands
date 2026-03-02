import type { CharacterSerialized, PlayerDesignator } from '../../commonTypes';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CharacterOperations {
    /**
     * Creates a new character.
     */
    export const create = (
        playerDesignator: PlayerDesignator,
        strength: number,
    ): CharacterSerialized => {
        return { playerDesignator, strength, tortoise: false };
    };

    /**
     * Tells if two characters are equal to each other.
     */
    export const equals = (
        character: CharacterSerialized,
        other?: CharacterSerialized | null,
    ): boolean => {
        return (
            character.playerDesignator === other?.playerDesignator &&
            character.strength === other.strength &&
            character.tortoise === other.tortoise
        );
    };
}
