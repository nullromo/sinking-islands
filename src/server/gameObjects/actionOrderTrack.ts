import type {
    ActionOrderTrackSerialized,
    CardSerialized,
    PlayerDesignator,
} from '../../commonTypes';
import { Card } from './card';

/**
 * Represents a player's choice on where to put their cards.
 */
export type CardPlacement = Record<number, CardSerialized>;

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

    // list of slot numbers with cards that were played face up
    private faceUpCards: number[] = [];

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
        return this.cardSlots.reduce<number[]>((indices, card, index) => {
            if (card === null) {
                return [...indices, index];
            }
            return indices;
        }, []);
    };

    /**
     * Returns true if the given player has cards on the track.
     */
    public readonly playerHasPlayed = (playerDesignator: PlayerDesignator) => {
        return this.cardSlots.some((card) => {
            return card && card.playerDesignator === playerDesignator;
        });
    };

    /**
     * Returns true if the given fog target is legal.
     */
    public readonly checkFogTargetLegal = (slot: number, fogTarget: number) => {
        // if there is no card, that card cannot be fogged
        if (this.cardSlots[fogTarget] === null) {
            console.log('Cannot fog a card that does not exist');
            return false;
        }

        // a fog cannot fog itself
        if (slot === fogTarget) {
            console.log('A fog cannot fog itself');
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
    public readonly assignPlacement = (
        cardPlacement: CardPlacement,
        indescretion: boolean,
    ) => {
        Object.entries(cardPlacement).forEach(([slot, card]) => {
            this.placeCard(Number(slot), Card.deserialize(card));
            if (indescretion) {
                this.faceUpCards.push(Number(slot));
            }
        });
    };

    /**
     * Resets the list of face up cards.
     */
    public readonly resetFaceUpCards = () => {
        this.faceUpCards = [];
    };

    public readonly serialize = (
        playerDesignator: PlayerDesignator,
        activeCardIndex: number | null,
    ): ActionOrderTrackSerialized => {
        return {
            cardSlots: this.cardSlots.map((card, slot) => {
                return card
                    ? this.faceUpCards.includes(slot) ||
                      card.playerDesignator === playerDesignator ||
                      slot === activeCardIndex
                        ? card.serialize()
                        : { playerDesignator: card.playerDesignator }
                    : null;
            }),
            faceUpCards: this.faceUpCards,
        };
    };
}
