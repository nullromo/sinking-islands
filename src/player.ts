import { Card } from './card';

export enum PlayerDesignator {
    PLAYER_A = 'A',
    PLAYER_B = 'B',
}

export class PlayerGamePiece {
    public readonly playerDesignator: PlayerDesignator;

    public constructor(playerDesignator: PlayerDesignator) {
        this.playerDesignator = playerDesignator;
    }
}

export class Player {
    public readonly playerDesignator: PlayerDesignator;

    private readonly deck: Card[] = [];
    private readonly hand: Card[] = [];
    private readonly discardPile: Card[] = [];
    private readonly setAsideCards: Card[] = [];

    public constructor(playerDesignator: PlayerDesignator) {
        this.playerDesignator = playerDesignator;
    }
}
