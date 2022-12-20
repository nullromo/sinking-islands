import type { PlayerDesignator } from './player';

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
