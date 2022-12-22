import type { CardSerialized, PlayerDesignator } from '../commonTypes';
import { PlayerGamePiece } from './playerGamePiece';

/**
 * Unique IDs for each different action card.
 */
export enum CardType {
    CRAB = 'CRAB',
    FLYING_FISH = 'FLYING_FISH',
    FOG = 'FOG',
    HARPOON = 'HARPOON',
    INDESCRETION = 'INDESCRETION',
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
