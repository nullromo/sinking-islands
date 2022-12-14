import { Card, CardType } from './card';
import { shuffleArray } from './util';

/**
 * Unique IDs for each player.
 */
export enum PlayerDesignator {
    PLAYER_A = 'A',
    PLAYER_B = 'B',
}

/**
 * Represents a player.
 */
export class Player {
    // the player ID
    public readonly playerDesignator: PlayerDesignator;

    // the player's cards, separated into their appropriate zones
    private readonly deck: Card[];
    private readonly hand: Card[];
    private readonly discardPile: Card[] = [];
    private readonly setAsideCards: Card[] = [];

    public constructor(playerDesignator: PlayerDesignator) {
        this.playerDesignator = playerDesignator;

        // initialize and shuffle the player's deck
        this.deck = shuffleArray([
            new Card(this.playerDesignator, CardType.CRAB),
            new Card(this.playerDesignator, CardType.CRAB),
            new Card(this.playerDesignator, CardType.CRAB),
            new Card(this.playerDesignator, CardType.FLYING_FISH),
            new Card(this.playerDesignator, CardType.FOG),
            new Card(this.playerDesignator, CardType.FOG),
            new Card(this.playerDesignator, CardType.HARPOON),
            new Card(this.playerDesignator, CardType.HARPOON),
            new Card(this.playerDesignator, CardType.INDESCRETION),
            new Card(this.playerDesignator, CardType.MEDITATION),
            new Card(this.playerDesignator, CardType.MOVEMENT),
            new Card(this.playerDesignator, CardType.MOVEMENT),
            new Card(this.playerDesignator, CardType.MOVEMENT),
            new Card(this.playerDesignator, CardType.MOVEMENT),
            new Card(this.playerDesignator, CardType.MOVEMENT),
            new Card(this.playerDesignator, CardType.MOVEMENT),
            new Card(this.playerDesignator, CardType.NET),
            new Card(this.playerDesignator, CardType.PILINGS),
            new Card(this.playerDesignator, CardType.PRAYER),
            new Card(this.playerDesignator, CardType.TIDAL_SURGE),
            new Card(this.playerDesignator, CardType.TIDAL_SURGE),
            new Card(this.playerDesignator, CardType.TIDAL_WAVE),
            new Card(this.playerDesignator, CardType.TORTOISE),
            new Card(this.playerDesignator, CardType.VOLCANIC_ERUPTION),
            new Card(this.playerDesignator, CardType.WEAKNESS),
        ]);

        // draw the first 6 cards into the player's hand
        this.hand = this.deck.splice(0, 6);
    }

    /**
     * Returns a string representation of the player.
     */
    public readonly dump = () => {
        return `${this.playerDesignator}:k[${this.deck.map((card) => {
            return card.cardType;
        })}]h[${this.hand.map((card) => {
            return card.cardType;
        })}]d[${this.discardPile.map((card) => {
            return card.cardType;
        })}]s[${this.setAsideCards.map((card) => {
            return card.cardType;
        })}]`;
    };
}
