import { Card } from './card';

/**
 * Unique IDs for each player.
 */
export enum PlayerDesignator {
    PLAYER_A = 'A',
    PLAYER_B = 'B',
}

/**
 * Base class for game pieces that are owned by a player.
 */
export abstract class PlayerGamePiece {
    // the player who owns this piece
    public readonly playerDesignator: PlayerDesignator;

    public constructor(playerDesignator: PlayerDesignator) {
        this.playerDesignator = playerDesignator;
    }
}

/**
 * Represents a player.
 */
export class Player {
    // the player ID
    public readonly playerDesignator: PlayerDesignator;

    // the player's cards, separated into their appropriate zones
    private readonly deck: Card[] = [];
    private readonly hand: Card[] = [];
    private readonly discardPile: Card[] = [];
    private readonly setAsideCards: Card[] = [];

    public constructor(playerDesignator: PlayerDesignator) {
        this.playerDesignator = playerDesignator;
    }
}
