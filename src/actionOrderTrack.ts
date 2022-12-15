import { Card } from './card';
import { PlayerDesignator } from './player';

/**
 * Represents a player's choice on where to put their cards.
 */
export type CardPlacement = Record<number, Card>;

/**
 * Represents the action order track.
 */
export class ActionOrderTrack {
    // representation of the card track
    private cardSlots: Array<Card | null> = [
        null,
        null,
        null,
        null,
        null,
        null,
    ];

    /**
     * Returns the list of card slots.
     */
    public readonly getCardSlots = () => {
        return this.cardSlots;
    };

    /**
     * Clears a slot and returns the card that used to be in it.
     */
    public readonly resetSlot = (slot: number) => {
        if (slot < 0 || slot > 5) {
            throw new Error('Invalid slot number to reset.');
        }
        const oldCard = this.cardSlots[slot];
        this.cardSlots[slot] = null;
        return oldCard;
    };

    /**
     * Returns a list of the unused indices in the card track.
     */
    public readonly getAvailableSlots = () => {
        return this.cardSlots.reduce((indices, card, index) => {
            if (card === null) {
                return [...indices, index];
            }
            return indices;
        }, [] as number[]);
    };

    /**
     * Returns true if the given card placement is legal.
     */
    public readonly checkCardPlacementLegal = (
        playerDesignator: PlayerDesignator,
        cardPlacement: CardPlacement,
    ) => {
        // player must not already have cards on the track
        if (
            this.cardSlots.some((card) => {
                return card && card.playerDesignator === playerDesignator;
            })
        ) {
            return false;
        }

        // all cards must be owned by the player placing them
        if (
            Object.values(cardPlacement).some((card) => {
                return card.playerDesignator !== playerDesignator;
            })
        ) {
            return false;
        }

        // they must place 3 cards
        if (Object.entries(cardPlacement).length !== 3) {
            return false;
        }

        // find which slots the player wants to place in
        const slots = Object.keys(cardPlacement).map((slot) => {
            return Number(slot);
        });

        // they can't put 2 cards in the same area
        if (
            (slots.includes(0) && slots.includes(1)) ||
            (slots.includes(2) && slots.includes(3)) ||
            (slots.includes(4) && slots.includes(5))
        ) {
            return false;
        }

        // all slots used must be available
        const availableSlots = this.getAvailableSlots();
        if (
            slots.some((slot) => {
                return !availableSlots.includes(slot);
            })
        ) {
            return false;
        }

        // all checks passed
        return true;
    };

    /**
     * Returns true if the given fog target is legal.
     */
    public readonly checkFogTargetLegal = (slot: number, fogTarget: number) => {
        // if there is no card, that card cannot be fogged
        if (this.cardSlots[fogTarget] === null) {
            return false;
        }

        // a fog cannot fog itself
        if (slot === fogTarget) {
            return false;
        }

        // all checks passed
        return true;
    };

    /**
     * Places a card on the track.
     */
    private readonly placeCard = (slot: number, card: Card) => {
        this.cardSlots[slot] = card;
    };

    /**
     * Given a card placement, fills in the card slots accordingly.
     */
    public readonly assignPlacement = (cardPlacement: CardPlacement) => {
        Object.entries(cardPlacement).forEach(([slot, card]) => {
            this.placeCard(Number(slot), card);
        });
    };

    /**
     * Returns a string representation of the track.
     */
    public readonly dump = () => {
        return `[${this.cardSlots.map((card) => {
            return card ? `${card.cardType}_${card.playerDesignator}` : '_';
        })}]`;
    };
}
