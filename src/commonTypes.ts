import type { CardType } from './server/card';
import type { IslandType } from './server/island';

/**
 * Unique IDs for each player.
 */
export enum PlayerDesignator {
    PLAYER_A = 'A',
    PLAYER_B = 'B',
}

/**
 * Given a player designator, returns the other one.
 */
export const otherPlayerDesignator = (playerDesignator: PlayerDesignator) => {
    return playerDesignator === PlayerDesignator.PLAYER_A
        ? PlayerDesignator.PLAYER_B
        : PlayerDesignator.PLAYER_A;
};

export type PlayerGamePieceSerialized = {
    playerDesignator: PlayerDesignator;
};

export interface CharacterSerialized extends PlayerGamePieceSerialized {
    strength: number;
    tortoise: boolean;
}

export type IslandSerialized = {
    islandNumber: number;
    islandType: IslandType;
    smallCapacity: boolean;
    characters: CharacterSerialized[];
};

export interface CardSerialized extends PlayerGamePieceSerialized {
    cardType: CardType;
}

export type ActionOrderTrackSerialized = {
    cardSlots: Array<CardSerialized | null>;
    faceUpCards: number[];
};

export type GameSerialized = {
    actionOrderTrack: ActionOrderTrackSerialized;
    id: string;
    initiative: PlayerDesignator;
    islands: IslandSerialized[];
    nextIslandToSink: number;
    you: PlayerDesignator;
    yourHand: CardSerialized[];
};
