import type { GameState } from './gameState';
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
    cardSlots: Array<Partial<CardSerialized> | null>;
    faceUpCards: number[];
};

export type GameSerialized = {
    actionOrderTrack: ActionOrderTrackSerialized;
    activeCardIndex: number | null;
    gameState: GameState;
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
