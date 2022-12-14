import { Card, CardType } from './card';
import { sampleArray, shuffleArray } from './util';

/**
 * Unique IDs for each player.
 */
export enum PlayerDesignator {
    PLAYER_A = 'A',
    PLAYER_B = 'B',
}

export type CardPlacement = Record<number, Card>;

/**
 * Represents a player.
 */
export class Player {
    // the player ID
    public readonly playerDesignator: PlayerDesignator;

    // the player's cards, separated into their appropriate zones
    private deck: Card[];
    private readonly hand: Card[];
    private discardPile: Card[] = [];
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
     * Returns a card placement choice given the available slots.
     */
    public readonly getCardPlacement = (
        availableSlots: number[],
    ): CardPlacement => {
        return {
            [sampleArray(
                availableSlots.filter((slot) => {
                    return slot < 2;
                }),
            )]: this.hand.pop() as Card,
            [sampleArray(
                availableSlots.filter((slot) => {
                    return slot > 1 && slot < 4;
                }),
            )]: this.hand.pop() as Card,
            [sampleArray(
                availableSlots.filter((slot) => {
                    return slot > 3 && slot < 6;
                }),
            )]: this.hand.pop() as Card,
        };
    };

    /**
     * Adds a card to this player's discard pile.
     */
    public readonly discardCard = (card: Card) => {
        if (card.playerDesignator !== this.playerDesignator) {
            throw new Error('Tried to discard a card into the wrong pile.');
        }
        this.discardPile.push(card);
    };

    /**
     * Adds a card to this player's set aside cards.
     */
    public readonly setAside = (card: Card) => {
        if (card.playerDesignator !== this.playerDesignator) {
            throw new Error('Tried to set aside a card into the wrong pile.');
        }
        this.setAsideCards.push(card);
    };

    /**
     * Causes this player to draw the given number of cards.
     */
    public readonly draw = (cards: number) => {
        let toDraw = cards;
        while (toDraw > 0) {
            if (this.deck.length <= 0) {
                this.deck = shuffleArray(this.discardPile);
                this.discardPile = [];
            }
            toDraw -= 1;
            this.hand.push(this.deck.pop() as Card);
        }
    };

    /**
     * Returns a string representation of the player.
     */
    public readonly dump = () => {
        return `${this.playerDesignator}:k${this.deck.length}[${this.deck.map(
            (card) => {
                return card.cardType;
            },
        )}]h${this.hand.length}[${this.hand.map((card) => {
            return card.cardType;
        })}]d${this.discardPile.length}[${this.discardPile.map((card) => {
            return card.cardType;
        })}]s${this.setAsideCards.length}[${this.setAsideCards.map((card) => {
            return card.cardType;
        })}]`;
    };
}
