import type { Socket } from 'socket.io';
import type {
    CardSerialized,
    CharacterSerialized,
    GameSerialized,
    PlayerDesignator,
} from '../commonTypes';
import { otherPlayerDesignator } from '../commonTypes';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from '../socketEvents';
import { sampleArray, shuffleArray } from '../util';
import type { CardPlacement } from './actionOrderTrack';
import { Card, CardType } from './card';
import { Character } from './character';
import { fullObject } from './util';
import { CheckResult } from './checkResult';

const randomIslandNumber = () => {
    return Math.floor(Math.random() * 16) + 1;
};

export type FlyingFishMovement = {
    character: CharacterSerialized;
    fromIslandNumber: number;
    toIslandNumber: number;
};

export type HarpoonTarget = {
    character: CharacterSerialized;
    islandNumber: number;
};

type NormalMovement = FlyingFishMovement;

export type MovementSet = NormalMovement[];

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
    public netIsland = NaN;
    public pilingsIsland = NaN;

    // specifier for whether or not the player is under indescretion
    public indescretion = false;

    // specifier for whether or not the player is afflicted with weakness
    public weakness = false;

    private socket: Socket<ClientToServerEvents, ServerToClientEvents> | null =
        null;

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
     * Connects the given socket to this player.
     */
    public readonly connectSocket = (
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ) => {
        if (this.socket === null) {
            this.socket = socket;
        } else {
            throw new Error('Socket already connected to this player.');
        }
    };

    /**
     * Returns true if a socket has not been connected yet.
     */
    public readonly isWaitingForSocket = () => {
        return !this.socket;
    };

    /**
     * Sends the given game state to this player.
     */
    public readonly sendGameState = (gameState: GameSerialized) => {
        this.socket?.emit('gameState', gameState);
    };

    /**
     * Returns a list of cards in this player's hand.
     */
    public readonly getHand = () => {
        return this.hand.map((card) => {
            return card.serialize();
        });
    };

    /**
     * Returns true if this player has a card matching the given card in their
     * hand.
     */
    public readonly checkCardsInHand = (cards: CardSerialized[]) => {
        // all the cards in the list must be in the player's hand
        for (const card of cards) {
            // find the number of cards in the hand that match this card
            const numberOfMatchingCardsInHand = this.hand.filter((handCard) => {
                return (
                    handCard.cardType === card.cardType &&
                    handCard.playerDesignator === card.playerDesignator
                );
            }).length;

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
    public readonly removeCardFromHand = (cardToRemove: Card) => {
        const index = this.hand.findIndex((card) => {
            return card.cardType === cardToRemove.cardType;
        });
        if (index >= 0) {
            this.hand.splice(index, 1);
        } else {
            throw new Error(
                `There is no card matching ${fullObject(
                    cardToRemove,
                )} in this player's hand (${fullObject(this)}).`,
            );
        }
    };

    //TODO figure something like this out to shorten the code
    //private readonly x = async <
    //E extends Exclude<keyof ClientToServerEvents, 'createGame'>,
    //R extends Parameters<ClientToServerEvents[E]>[0],
    //>(
    //requestEvent: keyof ServerToClientEvents,
    //responseEvent: E,
    //rand: () => R,
    //) => {
    //return new Promise<R>((resolve) => {
    //if (this.socket) {
    //this.socket.once(responseEvent, (value: R) => {
    //resolve(value);
    //});
    //this.socket.emit(requestEvent);
    //} else {
    //resolve(rand());
    //}
    //});
    //};

    /**
     * Returns a card placement choice given the available slots.
     */
    public readonly requestCardPlacement = async (): Promise<CardPlacement> => {
        return new Promise<CardPlacement>((resolve) => {
            if (this.socket) {
                this.socket.once('responseCardPlacement', (cardPlacement) => {
                    resolve(cardPlacement);
                });
                this.socket.emit('requestCardPlacement');
            } else {
                resolve({
                    [sampleArray([0, 1])]: this.hand[0],
                    [sampleArray([2, 3])]: this.hand[1],
                    [sampleArray([4, 5])]: this.hand[2],
                });
            }
        });
    };

    /**
     * Returns a flying fish movement.
     */
    public readonly requestFlyingFishMovement =
        async (): Promise<FlyingFishMovement> => {
            return new Promise<FlyingFishMovement>((resolve) => {
                if (this.socket) {
                    this.socket.once(
                        'responseFlyingFishMovement',
                        (flyingFishMovement) => {
                            resolve(flyingFishMovement);
                        },
                    );
                    this.socket.emit('requestFlyingFishMovement');
                } else {
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
                    resolve(movement);
                }
            });
        };

    /**
     * Returns a fog target.
     */
    public readonly requestFogTarget = async () => {
        return new Promise<number>((resolve) => {
            if (this.socket) {
                this.socket.once('responseFogTarget', (fogTarget) => {
                    resolve(fogTarget);
                });
                this.socket.emit('requestFogTarget');
            } else {
                resolve(Math.floor(Math.random() * 6));
            }
        });
    };

    /**
     * Returns a harpoon target.
     */
    public readonly requestHarpoonTarget = async (): Promise<HarpoonTarget> => {
        return new Promise<HarpoonTarget>((resolve) => {
            if (this.socket) {
                this.socket.once('responseHarpoonTarget', (harpoonTarget) => {
                    resolve(harpoonTarget);
                });
                this.socket.emit('requestHarpoonTarget');
            } else {
                resolve({
                    character: new Character(
                        otherPlayerDesignator(this.playerDesignator),
                        sampleArray([20, 30, 40]),
                    ),
                    islandNumber: randomIslandNumber(),
                });
            }
        });
    };

    /**
     * Returns a movement set.
     */
    public readonly requestMovementSet = async (): Promise<MovementSet> => {
        return new Promise<MovementSet>((resolve) => {
            if (this.socket) {
                this.socket.once('responseMovementSet', (movementSet) => {
                    resolve(movementSet);
                });
                this.socket.emit('requestMovementSet');
            } else {
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
                resolve(movementSet);
            }
        });
    };

    /**
     * Returns a net target.
     */
    public readonly requestNetTarget = async () => {
        return new Promise<number>((resolve) => {
            if (this.socket) {
                this.socket.once('responseNetTarget', (netTarget) => {
                    resolve(netTarget);
                });
                this.socket.emit('requestNetTarget');
            } else {
                resolve(randomIslandNumber());
            }
        });
    };

    /**
     * Returns a pilings target.
     */
    public readonly requestPilingsTarget = async () => {
        return new Promise<number>((resolve) => {
            if (this.socket) {
                this.socket.once('responsePilingsTarget', (pilingsTarget) => {
                    resolve(pilingsTarget);
                });
                this.socket.emit('requestPilingsTarget');
            } else {
                resolve(randomIslandNumber());
            }
        });
    };

    /**
     * Returns a tidal surge target.
     */
    public readonly requestTidalSurgeTarget = async () => {
        return new Promise<number>((resolve) => {
            if (this.socket) {
                this.socket.once(
                    'responseTidalSurgeTarget',
                    (tidalSurgeTarget) => {
                        resolve(tidalSurgeTarget);
                    },
                );
                this.socket.emit('requestTidalSurgeTarget');
            } else {
                resolve(randomIslandNumber());
            }
        });
    };

    /**
     * Returns a tidal wave target.
     */
    public readonly requestTidalWaveTarget = async () => {
        return new Promise<number>((resolve) => {
            if (this.socket) {
                this.socket.once(
                    'responseTidalWaveTarget',
                    (tidalWaveTarget) => {
                        resolve(tidalWaveTarget);
                    },
                );
                this.socket.emit('requestTidalWaveTarget');
            } else {
                resolve(randomIslandNumber());
            }
        });
    };

    /**
     * Returns a tortoise target.
     */
    public readonly requestTortoiseTarget =
        async (): Promise<TortoiseTarget> => {
            return new Promise<TortoiseTarget>((resolve) => {
                if (this.socket) {
                    this.socket.once(
                        'responseTortoiseTarget',
                        (tortoiseTarget) => {
                            resolve(tortoiseTarget);
                        },
                    );
                    this.socket.emit('requestTortoiseTarget');
                } else {
                    resolve({
                        character: new Character(
                            this.playerDesignator,
                            sampleArray([20, 30, 40]),
                        ),
                        islandNumber: randomIslandNumber(),
                    });
                }
            });
        };

    /**
     * Returns a volcanic eruption target.
     */
    public readonly requestVolcanicEruptionTarget = async () => {
        return new Promise<number>((resolve) => {
            if (this.socket) {
                this.socket.once(
                    'responseVolcanicEruptionTarget',
                    (volcanicEruptionTarget) => {
                        resolve(volcanicEruptionTarget);
                    },
                );
                this.socket.emit('requestVolcanicEruptionTarget');
            } else {
                resolve(randomIslandNumber());
            }
        });
    };

    /**
     * Returns the strength of a character that should flee.
     */
    public readonly requestFleeChoice = async () => {
        return new Promise<CharacterSerialized>((resolve) => {
            if (this.socket) {
                this.socket.once('responseFleeChoice', (fleeChoice) => {
                    resolve(fleeChoice);
                });
                this.socket.emit('requestFleeChoice');
            } else {
                const character = new Character(
                    this.playerDesignator,
                    sampleArray([20, 30, 40]),
                );
                if (Math.random() > 0.5) {
                    character.tortoise = true;
                }
                resolve(character);
            }
        });
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

    public readonly updateStatus = (status: CheckResult) => {
        if (this.socket) {
            this.socket.emit('updateStatus', status);
        }
    };
}
