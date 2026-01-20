import type { CardSerialized, PlayerDesignator } from '../../commonTypes';
import { assertUnreachable } from '../../util';
import { PlayerGamePiece } from './playerGamePiece';

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
            return 'indiscretion';
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

/**
 * Represents an action card.
 */
export class Card extends PlayerGamePiece {
    // the card ID
    public readonly cardType: CardType;

    public constructor(playerDesignator: PlayerDesignator, cardType: CardType) {
        super(playerDesignator);
        this.cardType = cardType;
    }

    public readonly serialize = (): CardSerialized => {
        return {
            cardType: this.cardType,
            playerDesignator: this.playerDesignator,
        };
    };

    public static readonly deserialize = (cardSerialized: CardSerialized) => {
        return new Card(
            cardSerialized.playerDesignator,
            cardSerialized.cardType,
        );
    };
}
