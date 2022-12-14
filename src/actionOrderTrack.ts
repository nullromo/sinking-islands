import { Card, CardType } from './card';
import { CardPlacement } from './player';
import { assertUnreachable } from './util';

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

    public readonly resetSlot = (slot: number) => {
        if (slot < 0 || slot > 5) {
            throw new Error('Invalid slot number to reset.');
        }
        this.cardSlots[slot] = null;
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
