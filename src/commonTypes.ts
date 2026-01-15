import type { CardType } from './server/gameObjects/card';

/**
 * Unique IDs for each type of island.
 */
export enum IslandType {
    NORMAL = 'Normal',
    SACRED = 'Sacred',
    VOLCANO = 'Volcano',
}

/**
 * Unique IDs for each player.
 */
export enum PlayerDesignator {
    PLAYER_A = 'Player A',
    PLAYER_B = 'Player B',
}

/**
 * Given a player designator, returns the other one.
 */
export const otherPlayerDesignator = (playerDesignator: PlayerDesignator) => {
    return playerDesignator === PlayerDesignator.PLAYER_A
        ? PlayerDesignator.PLAYER_B
        : PlayerDesignator.PLAYER_A;
};

/**
 * Represents a game piece owned by a player.
 */
export type PlayerGamePieceSerialized = {
    // the identifier of the player
    playerDesignator: PlayerDesignator;
};

/**
 * Represents a character.
 */
export interface CharacterSerialized extends PlayerGamePieceSerialized {
    // the character's battle strength
    strength: number;
    // the character's tortoise status
    tortoise: boolean;
}

/**
 * Represents an island.
 */
export type IslandSerialized = {
    // the island's number
    islandNumber: number;
    // the island's type
    islandType: IslandType;
    // the island's capacity
    smallCapacity: boolean;
    // list of characters present on the island
    characters: CharacterSerialized[];
};

/**
 * Represents an action card.
 */
export interface CardSerialized extends PlayerGamePieceSerialized {
    // the type of the card
    cardType: CardType;
}

export type ActionOrderTrackSerialized = {
    cardSlots: Array<Partial<CardSerialized> | null>;
    faceUpCards: number[];
};

export type GameSerialized = {
    actionOrderTrack: ActionOrderTrackSerialized;
    activeCardIndex: number | null;
    id: string;
    indescretion: {
        [PlayerDesignator.PLAYER_A]: boolean;
        [PlayerDesignator.PLAYER_B]: boolean;
    };
    initiative: PlayerDesignator;
    islandModifiers: {
        playerANet: number;
        playerAPilings: number;
        playerBNet: number;
        playerBPilings: number;
    };
    islands: IslandSerialized[];
    messages: string[];
    nextIslandToSink: number;
    opponentDeckSize: number;
    opponentDiscardPile: CardSerialized[];
    opponentHandSize: number;
    you: PlayerDesignator;
    yourDeckSize: number;
    yourDiscardPile: CardSerialized[];
    yourHand: CardSerialized[];
};
