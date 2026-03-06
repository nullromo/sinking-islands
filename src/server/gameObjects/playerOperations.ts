import type {
    CardSerialized,
    FaceDownCard,
    GameSerialized,
    PlayerDesignator,
    PlayerSerialized,
} from '../../info/commonTypes';
import { CardType } from '../../info/commonTypes';
import { shuffleArray } from '../../util/util';
import { fullObject } from '../util';
import { CardOperations } from './cardOperations';
import { GameOperations } from './gameOperations';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PlayerOperations {
    /**
     * Creates a new player.
     */
    export const create = (
        playerDesignator: PlayerDesignator,
    ): PlayerSerialized => {
        // initialize and shuffle the player's deck
        const deck: CardSerialized[] = shuffleArray([
            CardOperations.create(playerDesignator, CardType.CRAB),
            CardOperations.create(playerDesignator, CardType.CRAB),
            CardOperations.create(playerDesignator, CardType.CRAB),
            CardOperations.create(playerDesignator, CardType.FLYING_FISH),
            CardOperations.create(playerDesignator, CardType.FOG),
            CardOperations.create(playerDesignator, CardType.FOG),
            CardOperations.create(playerDesignator, CardType.HARPOON),
            CardOperations.create(playerDesignator, CardType.HARPOON),
            CardOperations.create(playerDesignator, CardType.INDISCRETION),
            CardOperations.create(playerDesignator, CardType.MEDITATION),
            CardOperations.create(playerDesignator, CardType.MOVEMENT),
            CardOperations.create(playerDesignator, CardType.MOVEMENT),
            CardOperations.create(playerDesignator, CardType.MOVEMENT),
            CardOperations.create(playerDesignator, CardType.MOVEMENT),
            CardOperations.create(playerDesignator, CardType.MOVEMENT),
            CardOperations.create(playerDesignator, CardType.MOVEMENT),
            CardOperations.create(playerDesignator, CardType.NET),
            CardOperations.create(playerDesignator, CardType.PILINGS),
            CardOperations.create(playerDesignator, CardType.PRAYER),
            CardOperations.create(playerDesignator, CardType.TIDAL_SURGE),
            CardOperations.create(playerDesignator, CardType.TIDAL_SURGE),
            CardOperations.create(playerDesignator, CardType.TIDAL_WAVE),
            CardOperations.create(playerDesignator, CardType.TORTOISE),
            CardOperations.create(playerDesignator, CardType.VOLCANIC_ERUPTION),
            CardOperations.create(playerDesignator, CardType.WEAKNESS),
        ]);

        return {
            deck,
            discardPile: [],
            hand: deck.splice(0, 6),
            indiscretion: false,
            netIsland: NaN,
            pilingsIsland: NaN,
            playerDesignator,
            setAsideCards: [],
            username: null,
            weakness: false,
        };
    };

    /**
     * Returns true if this player has a card matching the given card in their
     * hand.
     */
    export const checkCardsInHand = (
        player: PlayerSerialized,
        cards: CardSerialized[],
    ) => {
        // all the cards in the list must be in the player's hand
        for (const card of cards) {
            // find the number of cards in the hand that match this card
            const numberOfMatchingCardsInHand = player.hand.filter(
                (handCard) => {
                    return (
                        handCard.cardType === card.cardType &&
                        handCard.playerDesignator === card.playerDesignator
                    );
                },
            ).length;

            // if there were no matching cards, then this card choice is not in
            // the player's hand
            if (numberOfMatchingCardsInHand === 0) {
                return false;
            }

            // find the number of cards in the card set that refer to this type
            // of card
            const numberOfMatchingGivenCards = cards.filter((chosenCard) => {
                return (
                    chosenCard.cardType === card.cardType &&
                    chosenCard.playerDesignator === card.playerDesignator
                );
            }).length;

            // if there are not enough cards in the player's hand for all the
            // times the card was selected, then the given cards are not in the
            // player's hand
            if (numberOfMatchingGivenCards > numberOfMatchingCardsInHand) {
                return false;
            }
        }

        // none of the cards returned false, so they are all in the player's
        // hand
        return true;
    };

    /**
     * Removes the given card from the player's hand.
     */
    export const removeCardFromHand = (
        player: PlayerSerialized,
        cardToRemove: CardSerialized,
    ) => {
        const index = player.hand.findIndex((card) => {
            return card.cardType === cardToRemove.cardType;
        });
        if (index >= 0) {
            player.hand.splice(index, 1);
        } else {
            throw new Error(
                `There is no card matching ${fullObject(
                    cardToRemove,
                )} in this player's hand (${fullObject(player)}).`,
            );
        }
    };

    /**
     * Adds a card to this player's discard pile.
     */
    export const discardCard = (
        player: PlayerSerialized,
        card: CardSerialized | FaceDownCard,
    ) => {
        if (card.cardType === null) {
            throw new Error('Cannot discard a face-down card.');
        }
        if (card.playerDesignator !== player.playerDesignator) {
            throw new Error('Tried to discard a card into the wrong pile.');
        }
        player.discardPile.push(card);
    };

    /**
     * Adds a card to this player's set aside cards.
     */
    export const setAside = (
        player: PlayerSerialized,
        card: CardSerialized,
    ) => {
        if (card.playerDesignator !== player.playerDesignator) {
            throw new Error('Tried to set aside a card into the wrong pile.');
        }
        player.setAsideCards.push(card);
    };

    /**
     * Reclaims a set aside card.
     */
    export const reclaim = (player: PlayerSerialized, cardType: CardType) => {
        // remove the matching card from the set aside cards list
        player.setAsideCards = player.setAsideCards.filter((card) => {
            return card.cardType !== cardType;
        });

        // add the card to the discard pile
        player.discardPile.push(
            CardOperations.create(player.playerDesignator, cardType),
        );
    };

    /**
     * Shuffles the player's discard pile into their deck.
     */
    export const reshuffle = (
        game: GameSerialized,
        player: PlayerSerialized,
    ) => {
        GameOperations.log(
            game,
            `Reshuffling player ${player.playerDesignator}'s deck.`,
        );
        player.deck = shuffleArray([...player.deck, ...player.discardPile]);
        player.discardPile = [];
    };

    /**
     * Causes this player to draw the given number of cards.
     */
    export const draw = (
        game: GameSerialized,
        player: PlayerSerialized,
        cards: number,
    ) => {
        let toDraw = cards;

        // draw cards while cards still need to be drawn
        while (toDraw > 0) {
            // if the deck is empty, reshuffle
            if (player.deck.length <= 0) {
                if (player.discardPile.length > 0) {
                    reshuffle(game, player);
                } else {
                    // if the discard pile is also empty, just be done with it
                    return;
                }
            }

            // draw one card
            toDraw -= 1;
            player.hand.push(player.deck.pop() as CardSerialized);
        }
        GameOperations.log(
            game,
            `${player.playerDesignator} draws ${cards} card${cards === 1 ? '' : 's'}.`,
        );
    };
}
