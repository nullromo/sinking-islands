import { PlayerDesignator } from './player';
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

    /**
     * Returns a string representation of the character.
     */
    public readonly dump = () => {
        return `[${this.playerDesignator}${this.strength}${
            this.tortoise ? '@' : ''
        }]`;
    };
}
