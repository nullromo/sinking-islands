import { PlayerGamePiece, PlayerDesignator } from './player';

export class Character extends PlayerGamePiece {
    public readonly strength: number;

    public tortoise = false;

    public constructor(playerDesignator: PlayerDesignator, strength: number) {
        super(playerDesignator);
        this.strength = strength;
    }

    public readonly dump = () => {
        return `[${this.playerDesignator}${this.strength}${
            this.tortoise ? '@' : ''
        }]`;
    };
}
