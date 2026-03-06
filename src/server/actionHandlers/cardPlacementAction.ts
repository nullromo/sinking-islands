import type {
    CardPlacement,
    GameSerialized,
    PlayerDesignator,
} from '../../info/commonTypes';
import { ActionOrderTrackOperations } from '../gameObjects/actionOrderTrackOperations';
import { PlayerOperations } from '../gameObjects/playerOperations';

const checkCardPlacementLegal = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    cardPlacement: CardPlacement,
) => {
    // player must not already have cards on the track
    if (
        ActionOrderTrackOperations.playerHasPlayed(
            game.actionOrderTrack,
            playerDesignator,
        )
    ) {
        throw new Error(
            'Cannot play cards when cards have already been played.',
        );
    }

    // all cards must be owned by the player placing them
    if (
        Object.values(cardPlacement).some((card) => {
            return card.playerDesignator !== playerDesignator;
        })
    ) {
        throw new Error("Cannot play another player's cards.");
    }

    // they must place 3 cards
    if (Object.entries(cardPlacement).length !== 3) {
        throw new Error('3 cards must be placed.');
    }

    // all chosen cards must be in the player's hand
    if (
        !PlayerOperations.checkCardsInHand(
            game.players[playerDesignator],
            Object.values(cardPlacement),
        )
    ) {
        throw new Error("Cards must be played from the player's hand.");
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
        throw new Error(
            'Two cards cannot be placed in the same area of the action order track.',
        );
    }

    // all slots used must be available
    const availableSlots = ActionOrderTrackOperations.getAvailableSlots(
        game.actionOrderTrack,
    );
    if (
        slots.some((slot) => {
            return !availableSlots.includes(slot);
        })
    ) {
        throw new Error('Cannot place a card on an unavailable slot.');
    }
};

export const handleCardPlacement = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    cardPlacement: CardPlacement,
) => {
    checkCardPlacementLegal(game, playerDesignator, cardPlacement);

    const player = game.players[playerDesignator];

    // assign cards to action track
    ActionOrderTrackOperations.assignPlacement(
        game.actionOrderTrack,
        cardPlacement,
        player.indiscretion,
    );

    // remove the cards from the player's hand
    Object.values(cardPlacement).forEach((card) => {
        PlayerOperations.removeCardFromHand(player, card);
    });

    // remove indiscretion's effect from the player
    player.indiscretion = false;
};
