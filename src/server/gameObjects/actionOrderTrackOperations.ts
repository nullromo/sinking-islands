import type {
    ActionOrderTrackSerialized,
    CardPlacement,
    CardSerialized,
    GameSerialized,
    PlayerDesignator,
} from '../../info/commonTypes';
import { GameOperations } from './gameOperations';

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
     * Returns true if the given fog target is legal.
     */
    export const checkFogTargetLegal = (
        game: GameSerialized,
        slot: number,
        fogTarget: number,
    ) => {
        // if there is no card, that card cannot be fogged
        if (game.actionOrderTrack.cardSlots[fogTarget] === null) {
            GameOperations.log(game, 'Cannot fog a card that does not exist');
            return false;
        }

        // a fog cannot fog itself
        if (slot === fogTarget) {
            GameOperations.log(game, 'A fog cannot fog itself');
            return false;
        }

        // all checks passed
        return true;
    };

    /**
     * Places a card on the track.
     */
    export const placeCard = (
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
        indiscretion: boolean,
    ) => {
        Object.entries(cardPlacement).forEach(([slot, card]) => {
            placeCard(actionOrderTrack, Number(slot), card);
            if (indiscretion) {
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
