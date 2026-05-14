import { assertUnreachable } from '../util/util';
import type { GameState } from './gameState';

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
type PlayerGamePieceSerialized = {
    // the identifier of the player
    playerDesignator: PlayerDesignator;
};

/**
 * Represents a character.
 */
export type CharacterSerialized = PlayerGamePieceSerialized & {
    // the character's battle strength
    strength: number;
    // the character's tortoise status
    tortoise: boolean;
};

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
export type CardSerialized = PlayerGamePieceSerialized & {
    // the type of the card
    cardType: CardType;
};

export type FaceDownCard = Omit<CardSerialized, 'cardType'> & {
    cardType: null;
};

export type ActionOrderTrackSerialized = {
    cardSlots: Array<CardSerialized | FaceDownCard | null>;
    faceUpCards: number[];
};

export type PlayerSerialized = {
    playerDesignator: PlayerDesignator;
    deck: CardSerialized[];
    hand: CardSerialized[];
    discardPile: CardSerialized[];
    setAsideCards: CardSerialized[];
    netIsland: number;
    pilingsIsland: number;
    indiscretion: boolean;
    weakness: boolean;
    username: string | null;
};

export type GameSerialized = {
    actionOrderTrack: ActionOrderTrackSerialized;
    activeCardIndex: number | null;
    gameState: GameState;
    id: string;
    initiative: PlayerDesignator;
    islands: IslandSerialized[];
    messages: string[];
    nextIslandToSink: number;
    players: {
        [PlayerDesignator.PLAYER_A]: PlayerSerialized;
        [PlayerDesignator.PLAYER_B]: PlayerSerialized;
    };
    roundsCompleted: number;
    waitingForPlayer: PlayerDesignator;
};

/**
 * Represents a player's choice on where to put their cards.
 */
export type CardPlacement = Record<number, CardSerialized>;

export type FlyingFishMovement = {
    character: CharacterSerialized;
    fromIslandNumber: number;
    toIslandNumber: number;
};

export type TargetCharacter = {
    character: CharacterSerialized;
    islandNumber: number;
};

export type NormalMovement = FlyingFishMovement;

export type MovementSet = NormalMovement[];

/**
 * Unique IDs for each different action card.
 */
export enum CardType {
    CRAB = 'CRAB',
    FLYING_FISH = 'FLYING_FISH',
    FOG = 'FOG',
    HARPOON = 'HARPOON',
    INDISCRETION = 'INDISCRETION',
    MEDITATION = 'MEDITATION',
    MOVEMENT = 'MOVEMENT',
    NET = 'NET',
    PILINGS = 'PILINGS',
    PRAYER = 'PRAYER',
    TIDAL_SURGE = 'TIDAL_SURGE',
    TIDAL_WAVE = 'TIDAL_WAVE',
    TORTOISE = 'TORTOISE',
    VOLCANIC_ERUPTION = 'VOLCANIC_ERUPTION',
    WEAKNESS = 'WEAKNESS',
}

/**
 * Converts a card type to a user-friendly string.
 */
export const cardTypeToString = (cardType: CardType) => {
    switch (cardType) {
        case CardType.CRAB:
            return 'Crab';
        case CardType.FLYING_FISH:
            return 'Flying Fish';
        case CardType.FOG:
            return 'Fog';
        case CardType.HARPOON:
            return 'Harpoon';
        case CardType.INDISCRETION:
            return 'Indiscretion';
        case CardType.MEDITATION:
            return 'Meditation';
        case CardType.MOVEMENT:
            return 'Movement';
        case CardType.NET:
            return 'Net';
        case CardType.PILINGS:
            return 'Pilings';
        case CardType.PRAYER:
            return 'Prayer';
        case CardType.TIDAL_SURGE:
            return 'Tidal Surge';
        case CardType.TIDAL_WAVE:
            return 'Tidal Wave';
        case CardType.TORTOISE:
            return 'Tortoise';
        case CardType.VOLCANIC_ERUPTION:
            return 'Volcanic Eruption';
        case CardType.WEAKNESS:
            return 'Weakness';
        default:
            return assertUnreachable(cardType);
    }
};
