import type { CharacterSerialized, PlayerDesignator } from '../../commonTypes';
import { PlayerGamePiece } from './playerGamePiece';

/**
 * Represents a character.
 */
export class Character extends PlayerGamePiece {
    // the character's battle strength
    public readonly strength: number;

    // the character's tortoise status
    public tortoise = false;

    public constructor(playerDesignator: PlayerDesignator, strength: number) {
        super(playerDesignator);
        this.strength = strength;
    }

    public readonly equals = (other?: CharacterSerialized | null) => {
        return (
            other &&
            this.playerDesignator === other.playerDesignator &&
            this.strength === other.strength &&
            this.tortoise === other.tortoise
        );
    };

    public readonly serialize = (): CharacterSerialized => {
        return {
            playerDesignator: this.playerDesignator,
            strength: this.strength,
            tortoise: this.tortoise,
        };
    };

    public static readonly deserialize = (character: CharacterSerialized) => {
        const result = new Character(
            character.playerDesignator,
            character.strength,
        );
        result.tortoise = character.tortoise;
        return result;
    };
}
