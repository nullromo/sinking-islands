import { CardPlacement } from './actionOrderTrack';
import { Card, CardType } from './card';
import { Character } from './character';
import { sampleArray, shuffleArray } from './util';

const randomIslandNumber = () => {
    return Math.floor(Math.random() * 16) + 1;
};

/**
 * Unique IDs for each player.
 */
export enum PlayerDesignator {
    PLAYER_A = 'A',
    PLAYER_B = 'B',
}

/**
 * Given a player designator, returns the other one.
 */
export const otherPlayerDesignator = (playerDesignator: PlayerDesignator) => {
    return playerDesignator === PlayerDesignator.PLAYER_A
        ? PlayerDesignator.PLAYER_B
        : PlayerDesignator.PLAYER_A;
};

export type FlyingFishMovement = {
    character: Character;
    fromIslandNumber: number;
    toIslandNumber: number;
};

export type HarpoonTarget = {
    character: Character;
    islandNumber: number;
};

export type MovementSet = Array<{
    character: Character;
    fromIslandNumber: number;
    toIslandNumber: number;
}>;

export type TortoiseTarget = HarpoonTarget;

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
    private setAsideCards: Card[] = [];

    // specifiers for which islands have which player tokens on them
    public netIsland: number = NaN;
    public pilingsIsland: number = NaN;

    // specifier for whether or not the player is under indescretion
    public indescretion = false;

    // specifier for whether or not the player is afflicted with weakness
    public weakness = false;

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
     * Removes the given card from the player's hand.
     */
    public readonly removeCardFromHand = (cardToRemove: Card) => {
        const index = this.hand.findIndex((card) => {
            return card.cardType === cardToRemove.cardType;
        });
        if (index >= 0) {
            this.hand.splice(index, 1);
        } else {
            throw new Error(
                `There is no card matching ${cardToRemove} in this player's hand (${this.dump()}).`,
            );
        }
    };

    /**
     * Returns a card placement choice given the available slots.
     */
    public readonly getCardPlacement = (): CardPlacement => {
        return {
            [sampleArray([0, 1])]: this.hand[0],
            [sampleArray([2, 3])]: this.hand[1],
            [sampleArray([4, 5])]: this.hand[2],
        };
    };

    /**
     * Returns a flying fish movement.
     */
    public readonly getFlyingFishMovement = (): FlyingFishMovement => {
        const movement = {
            fromIslandNumber: randomIslandNumber(),
            toIslandNumber: randomIslandNumber(),
            character: new Character(
                this.playerDesignator,
                sampleArray([20, 30, 40]),
            ),
        };
        if (Math.random() > 0.5) {
            movement.character.tortoise = true;
        }
        return movement;
    };

    /**
     * Returns a fog target.
     */
    public readonly getFogTarget = () => {
        return Math.floor(Math.random() * 6);
    };

    /**
     * Returns a harpoon target.
     */
    public readonly getHarpoonTarget = (): HarpoonTarget => {
        return {
            islandNumber: randomIslandNumber(),
            character: new Character(
                otherPlayerDesignator(this.playerDesignator),
                sampleArray([20, 30, 40]),
            ),
        };
    };

    /**
     * Returns a movement set.
     */
    public readonly getMovementSet = (): MovementSet => {
        const movementSet: MovementSet = [];
        [...Array(Math.floor(Math.random() * 3)).keys()].forEach(() => {
            const movement = {
                character: new Character(
                    this.playerDesignator,
                    sampleArray([20, 30, 40]),
                ),
                fromIslandNumber: randomIslandNumber(),
                toIslandNumber: randomIslandNumber(),
            };
            if (Math.random() > 0.5) {
                movement.character.tortoise = true;
            }
            movementSet.push(movement);
        });
        return movementSet;
    };

    /**
     * Returns a net target.
     */
    public readonly getNetTarget = () => {
        return randomIslandNumber();
    };

    /**
     * Returns a pilings target.
     */
    public readonly getPilingsTarget = () => {
        return randomIslandNumber();
    };

    /**
     * Returns a tidal surge target.
     */
    public readonly getTidalSurgeTarget = () => {
        return randomIslandNumber();
    };

    /**
     * Returns a tidal wave target.
     */
    public readonly getTidalWaveTarget = () => {
        return randomIslandNumber();
    };

    /**
     * Returns a tortoise target.
     */
    public readonly getTortoiseTarget = (): TortoiseTarget => {
        return {
            islandNumber: randomIslandNumber(),
            character: new Character(
                this.playerDesignator,
                sampleArray([20, 30, 40]),
            ),
        };
    };

    /**
     * Returns a volcanic eruption target.
     */
    public readonly getVolcanicEruptionTarget = () => {
        return randomIslandNumber();
    };

    /**
     * Returns the strength of a character that should flee.
     */
    public readonly getFleeChoice = () => {
        const character = new Character(
            this.playerDesignator,
            sampleArray([20, 30, 40]),
        );
        if (Math.random() > 0.5) {
            character.tortoise = true;
        }
        return character;
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
     * Reclaims a set aside card.
     */
    public readonly reclaim = (cardType: CardType) => {
        // remove the matching card from the set aside cards list
        this.setAsideCards = this.setAsideCards.filter((card) => {
            return card.cardType !== cardType;
        });

        // add the card to the discard pile
        this.discardPile.push(new Card(this.playerDesignator, cardType));
    };

    /**
     * Shuffles the player's discard pile into their deck.
     */
    public readonly reshuffle = () => {
        console.log(`Reshuffling player ${this.playerDesignator}'s deck.`);
        this.deck = shuffleArray([...this.deck, ...this.discardPile]);
        this.discardPile = [];
    };

    /**
     * Causes this player to draw the given number of cards.
     */
    public readonly draw = (cards: number) => {
        let toDraw = cards;

        // draw cards while cards still need to be drawn
        console.log('Starting card draw loop');
        while (toDraw > 0) {
            // if the deck is empty, reshuffle
            if (this.deck.length <= 0) {
                if (this.discardCard.length > 0) {
                    this.reshuffle();
                } else {
                    // if the discard pile is also empty, just be done with it
                    return;
                }
            }

            // draw one card
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
