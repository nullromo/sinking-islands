import type {
    ActionOrderTrackSerialized,
    CardPlacement,
    CardSerialized,
    PlayerDesignator,
} from '../../info/commonTypes';
import { IndiscretionStatus } from '../../info/commonTypes';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ActionOrderTrackOperations {
    /**
     * Creates a new action order track.
     */
    export const create = (): ActionOrderTrackSerialized => {
        return {
            cardSlots: Array<CardSerialized | null>(6).fill(null),
            faceUpCards: [],
        };
    };

    /**
     * Clears a slot and returns the card that used to be in it.
     */
    export const resetSlot = (
        actionOrderTrack: ActionOrderTrackSerialized,
        slot: number,
    ) => {
        if (slot < 0 || slot > 5) {
            throw new Error('Invalid slot number to reset.');
        }
        const oldCard = actionOrderTrack.cardSlots[slot];
        actionOrderTrack.cardSlots[slot] = null;
        return oldCard;
    };

    /**
     * Returns a list of the unused indices in the card track.
     */
    export const getAvailableSlots = (
        actionOrderTrack: ActionOrderTrackSerialized,
    ) => {
        return actionOrderTrack.cardSlots.reduce<number[]>(
            (indices, card, index) => {
                if (card === null) {
                    return [...indices, index];
                }
                return indices;
            },
            [],
        );
    };

    /**
     * Returns true if the given player has cards on the track.
     */
    export const playerHasPlayed = (
        actionOrderTrack: ActionOrderTrackSerialized,
        playerDesignator: PlayerDesignator,
    ) => {
        return actionOrderTrack.cardSlots.some((card) => {
            return card?.playerDesignator === playerDesignator;
        });
    };

    /**
     * Places a card on the track.
     */
    const placeCard = (
        actionOrderTrack: ActionOrderTrackSerialized,
        slot: number,
        card: CardSerialized,
    ) => {
        actionOrderTrack.cardSlots[slot] = card;
    };

    /**
     * Given a card placement, fills in the card slots accordingly.
     */
    export const assignPlacement = (
        actionOrderTrack: ActionOrderTrackSerialized,
        cardPlacement: CardPlacement,
        indiscretion: IndiscretionStatus,
    ) => {
        Object.entries(cardPlacement).forEach(([slot, card]) => {
            placeCard(actionOrderTrack, Number(slot), card);
            if (indiscretion === IndiscretionStatus.ASSIGNED) {
                actionOrderTrack.faceUpCards.push(Number(slot));
            }
        });
    };

    /**
     * Resets the list of face up cards.
     */
    export const resetFaceUpCards = (
        actionOrderTrack: ActionOrderTrackSerialized,
    ) => {
        actionOrderTrack.faceUpCards = [];
    };
}
