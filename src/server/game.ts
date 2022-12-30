import type { Socket } from 'socket.io';
import type { CharacterSerialized, GameSerialized } from '../commonTypes';
import {
    IslandType,
    otherPlayerDesignator,
    PlayerDesignator,
} from '../commonTypes';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from '../socketEvents';
import { assertUnreachable, shuffleArray, upperSnakeToTitle } from '../util';
import type { CardPlacement } from './actionOrderTrack';
import { ActionOrderTrack } from './actionOrderTrack';
import { Card, CardType } from './card';
import { Character } from './character';
import { Island } from './island';
import type {
    FlyingFishMovement,
    HarpoonTarget,
    MovementSet,
    TortoiseTarget,
} from './player';
import { Player } from './player';

/**
 * Represents a game of Sinking Islands
 */
export class Game {
    // the id or name of the game
    private readonly id: string;

    // the island with the Rising Waters marker on it
    private nextIslandToSink = 1;

    // the player that plays first this turn
    private initiative: PlayerDesignator = PlayerDesignator.PLAYER_A;

    // representations of the 2 players
    private readonly playerA = new Player(PlayerDesignator.PLAYER_A);
    private readonly playerB = new Player(PlayerDesignator.PLAYER_B);

    // representation of the Action Order Track
    private readonly actionOrderTrack = new ActionOrderTrack();

    // message history for players to read
    private readonly messages: string[] = [];

    // representation of all the islands in the archipelago
    private islands: Island[] = shuffleArray([
        new Island(1, IslandType.NORMAL, true),
        new Island(2, IslandType.NORMAL, false),
        new Island(3, IslandType.NORMAL, false),
        new Island(4, IslandType.NORMAL, true),
        new Island(5, IslandType.NORMAL, false),
        new Island(6, IslandType.VOLCANO, false),
        new Island(7, IslandType.NORMAL, true),
        new Island(8, IslandType.NORMAL, false),
        new Island(9, IslandType.VOLCANO, false),
        new Island(10, IslandType.NORMAL, true),
        new Island(11, IslandType.SACRED, false),
        new Island(12, IslandType.VOLCANO, false),
        new Island(13, IslandType.NORMAL, true),
        new Island(14, IslandType.SACRED, false),
        new Island(15, IslandType.VOLCANO, false),
        new Island(16, IslandType.NORMAL, true),
    ]);

    public constructor(id: string) {
        this.writeMessage('Creating game');
        this.id = id;

        // create and randomize all the characters
        const characters = shuffleArray([
            new Character(PlayerDesignator.PLAYER_A, 20),
            new Character(PlayerDesignator.PLAYER_A, 20),
            new Character(PlayerDesignator.PLAYER_A, 20),
            new Character(PlayerDesignator.PLAYER_A, 20),
            new Character(PlayerDesignator.PLAYER_A, 30),
            new Character(PlayerDesignator.PLAYER_A, 30),
            new Character(PlayerDesignator.PLAYER_A, 30),
            new Character(PlayerDesignator.PLAYER_A, 40),
            new Character(PlayerDesignator.PLAYER_B, 20),
            new Character(PlayerDesignator.PLAYER_B, 20),
            new Character(PlayerDesignator.PLAYER_B, 20),
            new Character(PlayerDesignator.PLAYER_B, 20),
            new Character(PlayerDesignator.PLAYER_B, 30),
            new Character(PlayerDesignator.PLAYER_B, 30),
            new Character(PlayerDesignator.PLAYER_B, 30),
            new Character(PlayerDesignator.PLAYER_B, 40),
        ]);

        // add one character to each island
        characters.forEach((character, index) => {
            this.islands[index].addCharacter(character);
        });
    }

    /**
     * Adds a message to the game's message log.
     */
    private readonly writeMessage = (...messages: unknown[]) => {
        const message = messages.join(' ');
        this.messages.push(`${message}`);
        console.log(message);
        this.broadcastGameState();
    };

    /**
     * Connects the given socket to the given player.
     */
    public readonly connectSocket = (
        playerDesignator: PlayerDesignator,
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ) => {
        this.getPlayer(playerDesignator).connectSocket(socket);
    };

    /**
     * Returns true if the game is still waiting for a player to connect over a socket.
     */
    public readonly isWaitingForPlayers = () => {
        return (
            this.playerA.isWaitingForSocket() ||
            this.playerB.isWaitingForSocket()
        );
    };

    /**
     * Sends the current game state to both players.
     */
    private readonly broadcastGameState = () => {
        this.playerA.sendGameState(this.serialize(PlayerDesignator.PLAYER_A));
        this.playerB.sendGameState(this.serialize(PlayerDesignator.PLAYER_B));
    };

    /**
     * Returns the player that has lost, or undefined if no player has lost.
     */
    private readonly getLoser = () => {
        return [PlayerDesignator.PLAYER_A, PlayerDesignator.PLAYER_B].find(
            (player) => {
                return !this.islands.some((island) => {
                    return island.getCharacters().some((character) => {
                        return character.playerDesignator === player;
                    });
                });
            },
        );
    };

    /**
     * Executes the main game loop.
     */
    public readonly play = async () => {
        this.writeMessage('Starting game');
        let loser: PlayerDesignator | null = null;

        this.broadcastGameState();

        try {
            loser = await this.runMainGameLoop();
        } catch (error: unknown) {
            console.error(error);
        }

        if (!loser) {
            // if there is no loser, then the game is a draw
            this.writeMessage(
                'Could not determine a winner. The game is a draw.',
            );
        } else {
            // the winner is the player that didn't lose
            const winner = otherPlayerDesignator(loser);
            this.writeMessage(`Game over. The winner is ${winner}.`);
        }
        this.broadcastGameState();
    };

    /**
     * Runs the loop that constitutes the main game flow.
     */
    private readonly runMainGameLoop = async () => {
        let roundCounter = 1;
        console.log('Starting game loop');
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
        while (true) {
            this.writeMessage('Begin round number', roundCounter);
            roundCounter += 1;
            this.broadcastGameState();

            // check if there is a loser and break if there is
            const loser = this.getLoser();
            if (loser) {
                return loser;
            }

            // determine player order
            const initiativePlayer = this.getPlayer(this.initiative);
            const otherPlayer =
                initiativePlayer === this.playerA ? this.playerB : this.playerA;

            // function that takes a turn for 1 player
            const takeTurn = async (player: Player) => {
                // get card placement from player
                const cardPlacement = await (async () => {
                    // keep trying until a valid card placement is given
                    let cardPlacement: CardPlacement | null = null;
                    console.log('Starting card placement loop');
                    while (
                        !cardPlacement ||
                        !this.checkCardPlacementLegal(
                            player.playerDesignator,
                            cardPlacement,
                        )
                    ) {
                        this.writeMessage(
                            'Requesting card placement from',
                            player.playerDesignator,
                        );
                        // eslint-disable-next-line no-await-in-loop
                        cardPlacement = await player.requestCardPlacement();
                        console.log('Got', cardPlacement);
                    }
                    return cardPlacement;
                })();

                // assign cards to action track
                this.actionOrderTrack.assignPlacement(
                    cardPlacement,
                    player.indescretion,
                );

                // remove the cards from the player's hand
                Object.values(cardPlacement).forEach((card) => {
                    player.removeCardFromHand(Card.deserialize(card));
                });

                // remove indescretion's effect from the player
                player.indescretion = false;

                this.broadcastGameState();
            };

            // players take their turns
            // eslint-disable-next-line no-await-in-loop
            await takeTurn(initiativePlayer);
            // eslint-disable-next-line no-await-in-loop
            await takeTurn(otherPlayer);

            // resolve the actions, catching any thrown PlayerDesignators
            try {
                // eslint-disable-next-line no-await-in-loop
                await this.resolveActionTrack();
            } catch (error: unknown) {
                // if a PlayerDesignator was thrown, then that's the loser
                if (
                    error === PlayerDesignator.PLAYER_A ||
                    error === PlayerDesignator.PLAYER_B
                ) {
                    return error;
                }

                // otherwise, it's a real error
                throw error;
            }

            // weakness wears off
            this.playerA.weakness = false;
            this.playerB.weakness = false;

            // reset the face up card list
            this.actionOrderTrack.resetFaceUpCards();

            // players reclaim their set aside cards due to sunken tokens or
            // characters
            [this.playerA, this.playerB].forEach((player) => {
                // reclaim net card
                if (player.netIsland === this.nextIslandToSink) {
                    player.reclaim(CardType.NET);
                }

                // reclaim pilings card
                if (player.pilingsIsland === this.nextIslandToSink) {
                    player.reclaim(CardType.PILINGS);
                }

                // reclaim tortoise card
                if (
                    this.findIsland(this.nextIslandToSink)
                        ?.getCharacters()
                        .some((character) => {
                            return (
                                character.playerDesignator ===
                                    player.playerDesignator &&
                                character.tortoise
                            );
                        })
                ) {
                    player.reclaim(CardType.TORTOISE);
                }
            });

            // sink the lowest island
            this.islands = this.islands.filter((island) => {
                return island.islandNumber !== this.nextIslandToSink;
            });

            // if there are no islands left, then the game is a draw
            if (this.islands.length < 1) {
                return null;
            }

            // advance the rising waters marker
            console.log('Starting rising water loop');
            while (!this.findIsland(this.nextIslandToSink)) {
                this.nextIslandToSink = (this.nextIslandToSink % 16) + 1;
            }

            // swap the initiative
            this.initiative = otherPlayerDesignator(this.initiative);

            // players draw new cards
            this.playerA.draw(3);
            this.playerB.draw(3);

            this.broadcastGameState();
        }
    };

    /**
     * Given a player designator, returns the corresponding player.
     */
    private readonly getPlayer = (playerDesignator: PlayerDesignator) => {
        if (playerDesignator === PlayerDesignator.PLAYER_A) {
            return this.playerA;
        }
        return this.playerB;
    };

    /**
     * Attempts to find an island matching the given island number.
     */
    private readonly findIsland = (islandNumber: number) => {
        return this.islands.find((island) => {
            return island.islandNumber === islandNumber;
        });
    };

    /**
     * Returns true if the given flying fish movement is legal.
     */
    private readonly checkFlyingFishMovementLegal = (
        flyingFishMovement: FlyingFishMovement,
    ) => {
        // the flying fish can't move to a netted island
        if (
            flyingFishMovement.toIslandNumber === this.playerA.netIsland ||
            flyingFishMovement.toIslandNumber === this.playerB.netIsland
        ) {
            return false;
        }

        const toIsland = this.findIsland(flyingFishMovement.toIslandNumber);

        // can't move to an island that already sank
        if (!toIsland) {
            return false;
        }

        // can't move to an island that is at full capacity
        if (
            toIsland.smallCapacity &&
            toIsland.islandNumber !== this.playerA.pilingsIsland &&
            toIsland.islandNumber !== this.playerB.pilingsIsland &&
            toIsland.getCharacters().length > 0
        ) {
            return false;
        }

        // can't move a character that is not there
        if (
            !this.findIsland(
                flyingFishMovement.fromIslandNumber,
            )?.findCharacter(flyingFishMovement.character)
        ) {
            return false;
        }

        // all checks passed
        return true;
    };

    /**
     * Returns the number of movement points that it takes to get from one
     * island to another.
     */
    private readonly countSpacesBetweenIslands = (
        fromIslandNumber: number,
        toIslandNumber: number,
    ) => {
        const fromIndex = this.islands.findIndex((island) => {
            return island.islandNumber === fromIslandNumber;
        });
        const toIndex = this.islands.findIndex((island) => {
            return island.islandNumber === toIslandNumber;
        });
        return Math.min(
            Math.abs(fromIndex - toIndex + this.islands.length) %
                this.islands.length,
            Math.abs(fromIndex - toIndex - this.islands.length) %
                this.islands.length,
        );
    };

    /**
     * Returns true if the given movement set is legal.
     */
    private readonly checkMovementSetLegal = (
        playerDesignator: PlayerDesignator,
        movementSet: MovementSet,
    ) => {
        // there must be at least one movement
        if (movementSet.length < 1) {
            return false;
        }

        // check all movements
        for (const movement of movementSet) {
            // the player must move their own character
            if (movement.character.playerDesignator !== playerDesignator) {
                return false;
            }

            // the movement must be a legal flying fish movement
            if (!this.checkFlyingFishMovementLegal(movement)) {
                return false;
            }

            // movements cannot start and end on the same island
            if (movement.fromIslandNumber === movement.toIslandNumber) {
                return false;
            }
        }

        // each movement must be for a different character
        for (const movement of movementSet) {
            // find the number of potential characters on the from island that
            // this movement could refer to
            const numberOfMatchingCharacters = (
                this.findIsland(movement.fromIslandNumber) as Island
            )
                .getCharacters()
                .filter((character) => {
                    return character.equals(movement.character);
                }).length;

            // find the number of movements in the movement set that refer to
            // this type of character on this from island
            const numberOfMovesUsingThisTypeOfCharacter = movementSet.filter(
                (otherMovement) => {
                    return (
                        Character.deserialize(otherMovement.character).equals(
                            movement.character,
                        ) &&
                        otherMovement.fromIslandNumber ===
                            movement.fromIslandNumber
                    );
                },
            ).length;

            // if there are not enough of the type of character in question on
            // the from island in question, then at least two of the movements
            // in the movement set are trying to refer to the same character
            if (
                numberOfMovesUsingThisTypeOfCharacter >
                numberOfMatchingCharacters
            ) {
                return false;
            }
        }

        // the total movement must be at least 1 and no more than 3
        const totalMovement = movementSet.reduce((total, movement) => {
            return (
                total +
                this.countSpacesBetweenIslands(
                    movement.fromIslandNumber,
                    movement.toIslandNumber,
                )
            );
        }, 0);
        if (totalMovement < 1 || totalMovement > 3) {
            return false;
        }

        // all checks passed
        return true;
    };

    /**
     * Returns the two islands next to this island in an array. If there are
     * only 2 islands in the game, returns only 1 item. If there is only 1
     * island, returns an empty array.
     */
    private readonly getAdjacentIslands = (islandNumber: number) => {
        if (this.islands.length <= 1) {
            return [];
        }
        const islandIndex = this.islands.findIndex((island) => {
            return island.islandNumber === islandNumber;
        });
        if (islandIndex < 0) {
            throw new Error(`Invalid island number: ${islandNumber}.`);
        }
        if (this.islands.length < 3) {
            return [this.islands[(islandIndex + 1) % 2]];
        }
        return [
            this.islands[
                (islandIndex + this.islands.length - 1) % this.islands.length
            ],
            this.islands[(islandIndex + 1) % this.islands.length],
        ];
    };

    /**
     * Returns the set of islands that are within a range of 3 from the given
     * island number.
     */
    private readonly getIslandsWithinMovementRange = (island: Island) => {
        const withinOne = this.getAdjacentIslands(island.islandNumber);
        const withinTwo = withinOne.reduce((islands, thisIsland) => {
            return [
                ...islands,
                ...this.getAdjacentIslands(thisIsland.islandNumber),
            ];
        }, withinOne);
        const withinThree = withinTwo.reduce((islands, thisIsland) => {
            return [
                ...islands,
                ...this.getAdjacentIslands(thisIsland.islandNumber),
            ];
        }, withinTwo);
        return [
            ...new Set(
                withinThree.filter((otherIsland) => {
                    return otherIsland.islandNumber !== island.islandNumber;
                }),
            ),
        ];
    };

    /**
     * Returns true if the given card placement is legal.
     */
    public readonly checkCardPlacementLegal = (
        playerDesignator: PlayerDesignator,
        cardPlacement: CardPlacement,
    ) => {
        // player must not already have cards on the track
        if (this.actionOrderTrack.playerHasPlayed(playerDesignator)) {
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

        // all chosen cards must be in the player's hand
        if (
            !this.getPlayer(playerDesignator).checkCardsInHand(
                Object.values(cardPlacement),
            )
        ) {
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
        const availableSlots = this.actionOrderTrack.getAvailableSlots();
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
     * Returns true if the given harpoon target is legal.
     */
    private readonly checkHarpoonTargetLegal = (
        playerDesignator: PlayerDesignator,
        harpoonTarget: HarpoonTarget,
    ) => {
        // if the target is a tortoise, it's not valid
        if (harpoonTarget.character.tortoise) {
            return false;
        }

        // the player cannot shoot their own characters
        if (playerDesignator === harpoonTarget.character.playerDesignator) {
            return false;
        }

        // find the island being targeted
        const targetIsland = this.findIsland(harpoonTarget.islandNumber);

        // if the island does not exist, the target is not valid
        if (!targetIsland) {
            return false;
        }

        // if there are no characters matching the target on the target island,
        // then it is not valid
        if (
            !targetIsland.getCharacters().some((character) => {
                return character.equals(harpoonTarget.character);
            })
        ) {
            return false;
        }

        // find the adjacent islands and make sure there is an enemy of the
        // target in range
        if (
            !this.getAdjacentIslands(harpoonTarget.islandNumber).some(
                (island) => {
                    return island.getCharacters().some((character) => {
                        return character.playerDesignator === playerDesignator;
                    });
                },
            )
        ) {
            return false;
        }

        // all checks passed
        return true;
    };

    /**
     * Resolves the played cards in order. Throws the PlayerDesignator of the
     * player that lost if a player loses during resolution.
     */
    private readonly resolveActionTrack = async () => {
        for (const [slot, card] of this.actionOrderTrack
            .getCardSlots()
            .entries()) {
            if (card === null) {
                this.writeMessage('The card in slot', slot, 'was fogged.');
                continue;
            }
            // find the player that played the card
            const player = this.getPlayer(card.playerDesignator);

            // execute the card's actions
            // eslint-disable-next-line no-await-in-loop
            await this.resolveCardEffect(card, player, slot);

            // move the card to the appropriate zone
            this.actionOrderTrack.resetSlot(slot);
            if (
                card.cardType === CardType.PILINGS ||
                card.cardType === CardType.NET ||
                card.cardType === CardType.TORTOISE
            ) {
                player.setAside(card);
            } else {
                player.discardCard(card);
            }

            this.broadcastGameState();

            // check to see if the game is over
            const loser = this.getLoser();
            if (loser) {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw loser;
            }
        }
    };

    /**
     * Resolves the effects of a card played by a player in a slot.
     */
    private readonly resolveCardEffect = async (
        card: Card,
        player: Player,
        slot: number,
    ) => {
        this.writeMessage(
            `Executing slot ${slot + 1}: ${
                player.playerDesignator
            }'s ${upperSnakeToTitle(card.cardType)}`,
        );
        const opponent = otherPlayerDesignator(player.playerDesignator);
        switch (card.cardType) {
            case CardType.CRAB:
                // handle fights on all the islands
                this.islands.forEach((island) => {
                    // compute the strength of each player
                    const { playerStrength, opponentStrength } = island
                        .getCharacters()
                        .reduce(
                            (totals, character) => {
                                return {
                                    opponentStrength:
                                        totals.opponentStrength +
                                        (character.playerDesignator ===
                                        card.playerDesignator
                                            ? 0
                                            : this.getPlayer(opponent).weakness
                                            ? 10
                                            : character.strength),
                                    playerStrength:
                                        totals.playerStrength +
                                        (character.playerDesignator ===
                                        card.playerDesignator
                                            ? player.weakness
                                                ? 10
                                                : character.strength
                                            : 0),
                                };
                            },
                            { opponentStrength: 0, playerStrength: 0 },
                        );

                    // kill necessary characters
                    if (playerStrength > opponentStrength) {
                        this.writeMessage(
                            `Player ${opponent}'s characters are crabbed on island ${island.islandNumber}.`,
                        );

                        // if a tortoise died, reclaim the appropriate card
                        if (
                            island.getCharacters().some((character) => {
                                return (
                                    character.playerDesignator === opponent &&
                                    character.tortoise
                                );
                            })
                        ) {
                            this.getPlayer(opponent).reclaim(CardType.TORTOISE);
                        }

                        // remove the dead characters
                        island.removeCharactersOfPlayer(opponent);
                    }
                });
                break;
            case CardType.FLYING_FISH:
                // if there are no legal islands to move to, the flying
                // fish has no effect. This can only occur if all islands
                // are netted or are at full capacity
                if (
                    (this.islands.length === 2 &&
                        this.playerA.netIsland &&
                        this.playerB.netIsland &&
                        this.playerA.netIsland !== this.playerB.netIsland) ||
                    (this.islands.length === 1 &&
                        (this.playerA.netIsland || this.playerB.netIsland)) ||
                    !this.islands.some((island) => {
                        return (
                            !island.smallCapacity ||
                            island.islandNumber ===
                                this.playerA.pilingsIsland ||
                            island.islandNumber ===
                                this.playerB.pilingsIsland ||
                            island.getCharacters().length <= 0
                        );
                    })
                ) {
                    this.writeMessage(
                        'There is nowhere for a flying fish to fly.',
                    );
                    break;
                }

                // try to get a movement until a valid one is given
                let flyingFishMovement: FlyingFishMovement | null = null;
                console.log('Starting flying fish loop');
                while (
                    !flyingFishMovement ||
                    !this.checkFlyingFishMovementLegal(flyingFishMovement)
                ) {
                    this.writeMessage(
                        'Requesting flying fish movement from',
                        player.playerDesignator,
                    );
                    flyingFishMovement =
                        // eslint-disable-next-line no-await-in-loop
                        await player.requestFlyingFishMovement();
                    console.log('Got', flyingFishMovement);
                }

                // move the character
                this.writeMessage(
                    `Player ${
                        flyingFishMovement.character.playerDesignator
                    }'s ${flyingFishMovement.character.strength}-strength ${
                        flyingFishMovement.character.tortoise
                            ? 'tortoise'
                            : 'character'
                    }`,
                    'flies from island',
                    flyingFishMovement.fromIslandNumber,
                    'to island',
                    flyingFishMovement.toIslandNumber,
                );
                this.findIsland(
                    flyingFishMovement.fromIslandNumber,
                )?.removeCharacter(flyingFishMovement.character);
                this.findIsland(
                    flyingFishMovement.toIslandNumber,
                )?.addCharacter(flyingFishMovement.character);

                // remove tortoise and reclaim card if necessary
                if (flyingFishMovement.character.tortoise) {
                    flyingFishMovement.character.tortoise = false;
                    player.reclaim(CardType.TORTOISE);
                }
                break;
            case CardType.FOG:
                // if the fog has no targets then it has no effect
                if (
                    !this.actionOrderTrack
                        .getCardSlots()
                        .some((otherCard, otherSlot) => {
                            return otherCard !== null && otherSlot !== slot;
                        })
                ) {
                    this.writeMessage('There is no card to fog.');
                    break;
                }

                // try to get a fog target until a valid one is given
                let fogTarget: number | null = null;
                console.log('Starting fog loop');
                while (
                    !fogTarget ||
                    !this.actionOrderTrack.checkFogTargetLegal(slot, fogTarget)
                ) {
                    this.writeMessage(
                        'Requesting fog target from',
                        player.playerDesignator,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    fogTarget = await player.requestFogTarget();
                    console.log('Got', fogTarget);
                }

                // fog the target
                this.writeMessage('Fogging slot', fogTarget);
                const foggedCard = this.actionOrderTrack.resetSlot(fogTarget);
                if (foggedCard) {
                    this.getPlayer(foggedCard.playerDesignator).discardCard(
                        foggedCard,
                    );
                }
                break;
            case CardType.HARPOON:
                // if there are no legal harpoon targets, then the harpoon
                // has no effect. NOTE: there may be a better way to do
                // this, but brute force here isn't really that much
                // computation
                if (
                    !this.islands
                        .reduce<HarpoonTarget[]>((allCharacters, island) => {
                            return [
                                ...allCharacters,
                                ...island.getCharacters().map((character) => {
                                    return {
                                        character,
                                        islandNumber: island.islandNumber,
                                    };
                                }),
                            ];
                        }, [])
                        .some((harpoonTarget) => {
                            return this.checkHarpoonTargetLegal(
                                player.playerDesignator,
                                harpoonTarget,
                            );
                        })
                ) {
                    this.writeMessage(
                        `There are no valid harpoon targets for player ${player.playerDesignator}.`,
                    );
                    break;
                }

                let harpoonTarget: HarpoonTarget | null = null;
                console.log('Starting harpoon loop');
                while (
                    !harpoonTarget ||
                    !this.checkHarpoonTargetLegal(
                        player.playerDesignator,
                        harpoonTarget,
                    )
                ) {
                    this.writeMessage(
                        'Requesting harpoon target from',
                        player.playerDesignator,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    harpoonTarget = await player.requestHarpoonTarget();
                    console.log('Got', harpoonTarget);
                }

                // kill the target
                this.writeMessage(
                    `Player ${harpoonTarget.character.playerDesignator}'s ${harpoonTarget.character.strength}-strength character on island ${harpoonTarget.islandNumber} is harpooned.`,
                );
                this.findIsland(harpoonTarget.islandNumber)?.removeCharacter(
                    harpoonTarget.character,
                );
                break;
            case CardType.INDESCRETION:
                this.writeMessage(
                    `Player ${otherPlayerDesignator(
                        player.playerDesignator,
                    )} is put under the effects of indescretion.`,
                );
                this.getPlayer(
                    otherPlayerDesignator(player.playerDesignator),
                ).indescretion = true;
                break;
            case CardType.MEDITATION:
                this.writeMessage(
                    `Player ${player.playerDesignator} meditates.`,
                );
                player.reshuffle();
                break;
            case CardType.MOVEMENT:
                // if there are no valid moves to make, then the movement does
                // nothing
                if (
                    !this.islands.some((island) => {
                        return (
                            island.getCharacters().some((character) => {
                                return (
                                    character.playerDesignator ===
                                    player.playerDesignator
                                );
                            }) &&
                            this.getIslandsWithinMovementRange(island).some(
                                (otherIsland) => {
                                    return (
                                        (!otherIsland.smallCapacity ||
                                            otherIsland.getCharacters()
                                                .length <= 0 ||
                                            otherIsland.islandNumber ===
                                                this.playerA.pilingsIsland ||
                                            otherIsland.islandNumber ===
                                                this.playerB.pilingsIsland) &&
                                        otherIsland.islandNumber !==
                                            this.playerA.netIsland &&
                                        otherIsland.islandNumber !==
                                            this.playerB.netIsland
                                    );
                                },
                            )
                        );
                    })
                ) {
                    this.writeMessage(
                        `No movements are possible for player ${player.playerDesignator}.`,
                    );
                    break;
                }

                // try to get a movement set until a valid one is given
                let movementSet: MovementSet | null = null;
                console.log('Starting movement loop');
                while (
                    !movementSet ||
                    !this.checkMovementSetLegal(
                        player.playerDesignator,
                        movementSet,
                    )
                ) {
                    this.writeMessage(
                        'Requesting movement set from',
                        player.playerDesignator,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    movementSet = await player.requestMovementSet();
                    console.log('Got', movementSet);
                }

                // make the moves
                movementSet.forEach((movement) => {
                    this.writeMessage(
                        `Player ${player.playerDesignator} moves their ${
                            movement.character.strength
                        }-strength ${
                            movement.character.tortoise
                                ? 'tortoise'
                                : 'character'
                        } from island ${movement.fromIslandNumber} to island ${
                            movement.toIslandNumber
                        }.`,
                    );
                    this.findIsland(movement.fromIslandNumber)?.removeCharacter(
                        movement.character,
                    );
                    this.findIsland(movement.toIslandNumber)?.addCharacter(
                        movement.character,
                    );
                });
                break;
            case CardType.NET:
                // try to get a net target until a valid one is given
                let netTarget: number | null = null;
                console.log('Starting net loop');
                while (!netTarget || !this.findIsland(netTarget)) {
                    this.writeMessage(
                        'Requesting net target from',
                        player.playerDesignator,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    netTarget = await player.requestNetTarget();
                    console.log('Got', netTarget);
                }

                // place the net
                this.writeMessage(
                    `Player ${player.playerDesignator} casts a net over island ${netTarget}.`,
                );
                player.netIsland = netTarget;
                break;
            case CardType.PILINGS:
                // if there are no legal pilings targets, then the card does
                // nothing
                if (
                    !this.islands.some((island) => {
                        return (
                            island.smallCapacity &&
                            island.islandNumber !==
                                this.getPlayer(opponent).pilingsIsland
                        );
                    })
                ) {
                    this.writeMessage(
                        'There are no islands that can support pilings.',
                    );
                    break;
                }

                // try to get a pilngs target until a valid one is given
                let pilingsTarget: number | null = null;
                console.log('Starting pilings loop');
                while (
                    !pilingsTarget ||
                    !this.findIsland(pilingsTarget)?.smallCapacity ||
                    pilingsTarget === this.getPlayer(opponent).pilingsIsland
                ) {
                    this.writeMessage(
                        'Requesting pilings target from',
                        player.playerDesignator,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    pilingsTarget = await player.requestPilingsTarget();
                    console.log('Got', pilingsTarget);
                }

                // place the net
                this.writeMessage(
                    `Player ${player.playerDesignator} constructs pilings on island ${pilingsTarget}.`,
                );
                player.pilingsIsland = pilingsTarget;
                break;
            case CardType.PRAYER:
                // determine the prayer value
                const cardsToDraw = this.islands
                    .filter((island) => {
                        return island.islandType === IslandType.SACRED;
                    })
                    .reduce((total, island) => {
                        return (
                            total +
                            island.getCharacters().filter((character) => {
                                return (
                                    character.playerDesignator ===
                                    player.playerDesignator
                                );
                            }).length
                        );
                    }, 0);

                // draw the cards
                this.writeMessage(
                    `Player ${
                        player.playerDesignator
                    } prays for ${cardsToDraw} card${
                        cardsToDraw === 1 ? '' : 's'
                    }.`,
                );
                player.draw(cardsToDraw);
                break;
            case CardType.TIDAL_SURGE:
                // if there are no legal tidal surge targets, then the card
                // does nothing
                if (this.islands.length <= 1) {
                    this.writeMessage('The tide cannot surge.');
                    break;
                }

                // try to get a tidal surge target until a valid one is given
                let tidalSurgeTarget: number | null = null;
                console.log('Starting tidal surge loop');
                while (
                    !tidalSurgeTarget ||
                    !this.getAdjacentIslands(this.nextIslandToSink).some(
                        // eslint-disable-next-line @typescript-eslint/no-loop-func
                        (island) => {
                            return island.islandNumber === tidalSurgeTarget;
                        },
                    )
                ) {
                    this.writeMessage(
                        'Requesting tidal surge target from',
                        player.playerDesignator,
                    );
                    // eslint-disable-next-line no-await-in-loop, require-atomic-updates
                    tidalSurgeTarget = await player.requestTidalSurgeTarget();
                    console.log('Got', tidalSurgeTarget);
                }

                // move the rising waters marker
                this.writeMessage(
                    `The tide surges to island ${tidalSurgeTarget}.`,
                );
                this.nextIslandToSink = tidalSurgeTarget;
                break;
            case CardType.TIDAL_WAVE:
                // try to get a tidal wave target until a valid one is given
                let tidalWaveTarget: number | null = null;
                console.log('Starting tidal wave loop');
                while (!tidalWaveTarget || !this.findIsland(tidalWaveTarget)) {
                    this.writeMessage(
                        'Requesting tidal wave target from',
                        player.playerDesignator,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    tidalWaveTarget = await player.requestTidalWaveTarget();
                    console.log('Got', tidalWaveTarget);
                }

                // move the rising waters marker
                this.writeMessage(
                    `A tidal wave moves upon island ${tidalWaveTarget}.`,
                );
                this.nextIslandToSink = tidalWaveTarget;
                break;
            case CardType.TORTOISE:
                // try to get a tortoise target until a valid one is given
                let tortoiseTarget: TortoiseTarget | null = null;
                console.log('Starting tortoise loop');
                while (
                    !tortoiseTarget ||
                    tortoiseTarget.character.playerDesignator !==
                        player.playerDesignator ||
                    !this.findIsland(tortoiseTarget.islandNumber)
                        ?.getCharacters()
                        // eslint-disable-next-line @typescript-eslint/no-loop-func
                        .some((character) => {
                            return character.equals(tortoiseTarget?.character);
                        })
                ) {
                    this.writeMessage(
                        'Requesting tortoise target from',
                        player.playerDesignator,
                    );
                    // eslint-disable-next-line no-await-in-loop, require-atomic-updates
                    tortoiseTarget = await player.requestTortoiseTarget();
                    console.log('Got', tortoiseTarget);
                }

                // make the target a tortoise
                this.writeMessage(
                    `Player ${tortoiseTarget.character.playerDesignator}'s ${tortoiseTarget.character.strength}-strength character on island ${tortoiseTarget.islandNumber} turns into a tortoise.`,
                );
                (
                    (
                        this.findIsland(tortoiseTarget.islandNumber) as Island
                    ).findCharacter(
                        tortoiseTarget.character,
                    ) as CharacterSerialized
                ).tortoise = true;
                break;
            case CardType.VOLCANIC_ERUPTION:
                // if there are no volcanoes, the card does nothing
                if (
                    !this.islands.some((island) => {
                        return island.islandType === IslandType.VOLCANO;
                    })
                ) {
                    this.writeMessage('There are no volcanoes left.');
                    break;
                }

                // try to get a volcanic eruption target until a valid one is
                // given
                let volcanicEruptionTarget: number | null = null;
                console.log('Starting volcanic eruption loop');
                while (
                    !volcanicEruptionTarget ||
                    this.findIsland(volcanicEruptionTarget)?.islandType !==
                        IslandType.VOLCANO
                ) {
                    this.writeMessage(
                        'Requesting volcanic eruption target from',
                        player.playerDesignator,
                    );
                    // eslint-disable-next-line require-atomic-updates
                    volcanicEruptionTarget =
                        // eslint-disable-next-line no-await-in-loop
                        await player.requestVolcanicEruptionTarget();
                    console.log('Got', volcanicEruptionTarget);
                }

                // erupt the volcano
                this.writeMessage(`Island ${volcanicEruptionTarget} erupts.`);

                // find islands affected by lava flows
                const lavaFlowIslands = this.getAdjacentIslands(
                    volcanicEruptionTarget,
                );

                // handle lava flow fleeing
                for (const lavaFlowIsland of lavaFlowIslands) {
                    // find the safe island to flee to
                    const safeIsland = (() => {
                        const safeIslandList = this.getAdjacentIslands(
                            lavaFlowIsland.islandNumber,
                        ).filter((island) => {
                            return (
                                island.islandNumber !== volcanicEruptionTarget
                            );
                        });
                        if (safeIslandList.length <= 0) {
                            return null;
                        }
                        if (safeIslandList.length > 1) {
                            throw new Error(
                                'There cannot be two safe islands for characters to flee to.',
                            );
                        }
                        return safeIslandList[0];
                    })();

                    // if there is no safe island, no fleeing occurs
                    if (!safeIsland) {
                        return;
                    }

                    // if the safe island is small and unoccupied and not
                    // netted and does not have pilines and the volcano
                    // erupter has a character on the lava flow island, let
                    // them choose a character to flee
                    if (
                        safeIsland.smallCapacity &&
                        safeIsland.getCharacters().length <= 0 &&
                        this.playerA.netIsland !== safeIsland.islandNumber &&
                        this.playerB.netIsland !== safeIsland.islandNumber &&
                        safeIsland.islandNumber !==
                            this.playerA.pilingsIsland &&
                        safeIsland.islandNumber !==
                            this.playerB.pilingsIsland &&
                        lavaFlowIsland.getCharacters().some((character) => {
                            return (
                                character.playerDesignator ===
                                player.playerDesignator
                            );
                        })
                    ) {
                        // try to get a flee choice until a valid one is
                        // given
                        let characterToFlee: CharacterSerialized | null = null;
                        console.log('Starting flee loop');
                        while (
                            !characterToFlee ||
                            characterToFlee.playerDesignator !==
                                player.playerDesignator ||
                            !lavaFlowIsland
                                .getCharacters()
                                // eslint-disable-next-line @typescript-eslint/no-loop-func
                                .some((character) => {
                                    return character.equals(characterToFlee);
                                })
                        ) {
                            this.writeMessage(
                                'Requesting flee choice from',
                                player.playerDesignator,
                            );
                            // eslint-disable-next-line no-await-in-loop, require-atomic-updates
                            characterToFlee = await player.requestFleeChoice();
                            console.log('Got', characterToFlee);
                        }

                        // move the chosen character
                        this.writeMessage(
                            `Player ${player.playerDesignator}'s ${
                                characterToFlee.strength
                            }-strength ${
                                characterToFlee.tortoise
                                    ? 'tortoise'
                                    : 'character'
                            } flees first.`,
                        );

                        // move the character
                        this.writeMessage(
                            `Player ${characterToFlee.playerDesignator}'s ${
                                characterToFlee.strength
                            }-strength ${
                                characterToFlee.tortoise
                                    ? 'tortoise'
                                    : 'character'
                            } flees from the lava flow.`,
                        );
                        lavaFlowIsland.removeCharacter(characterToFlee);
                        safeIsland.addCharacter(characterToFlee);

                        // reset tortoise and reclaim card if necessary
                        if (characterToFlee.tortoise) {
                            characterToFlee.tortoise = false;
                            player.reclaim(CardType.TORTOISE);
                        }
                    }

                    // everyone else gets a chance to flee
                    if (
                        (!safeIsland.smallCapacity ||
                            safeIsland.islandNumber ===
                                this.playerA.pilingsIsland ||
                            safeIsland.islandNumber ===
                                this.playerB.pilingsIsland) &&
                        safeIsland.islandNumber !== this.playerA.netIsland &&
                        safeIsland.islandNumber !== this.playerB.netIsland
                    ) {
                        // move all characters
                        lavaFlowIsland.getCharacters().forEach((character) => {
                            // move the character
                            this.writeMessage(
                                `Player ${character.playerDesignator}'s ${
                                    character.strength
                                }-strength ${
                                    character.tortoise
                                        ? 'tortoise'
                                        : 'character'
                                } flees from the lava flow.`,
                            );
                            lavaFlowIsland.removeCharacter(character);
                            safeIsland.addCharacter(character);

                            // reset tortoise and reclaim card if necessary
                            if (character.tortoise) {
                                character.tortoise = false;
                                this.getPlayer(
                                    character.playerDesignator,
                                ).reclaim(CardType.TORTOISE);
                            }
                        });
                    }
                }

                // now that everyone has fled, burn anyone who didn't flee
                lavaFlowIslands.forEach((lavaFlowIsland) => {
                    lavaFlowIsland.getCharacters().forEach((character) => {
                        // reset tortoise and reclaim card if necessary
                        if (character.tortoise) {
                            this.getPlayer(character.playerDesignator).reclaim(
                                CardType.TORTOISE,
                            );
                        }

                        // remove the character
                        this.writeMessage(
                            `Player ${character.playerDesignator}'s ${
                                character.strength
                            }-strength ${
                                character.tortoise ? 'tortoise' : 'character'
                            } burns to death in the lava flow.`,
                        );
                        lavaFlowIsland.removeCharacter(character);
                    });
                });

                // remove the volcano itself
                this.writeMessage(
                    `Island ${volcanicEruptionTarget} erupts and sinks.`,
                );
                this.islands = this.islands.filter((island) => {
                    return island.islandNumber !== volcanicEruptionTarget;
                });

                // if there are no islands left, then the game is a draw
                if (this.islands.length < 1) {
                    throw new Error(
                        'The last remaining island erupted and sank.',
                    );
                }

                // if the rising waters marker was on the volcano, move it to
                // the next island
                if (this.nextIslandToSink === volcanicEruptionTarget) {
                    console.log('Starting sink loop');
                    while (!this.findIsland(this.nextIslandToSink)) {
                        this.nextIslandToSink =
                            (this.nextIslandToSink % 16) + 1;
                    }
                }
                break;
            case CardType.WEAKNESS:
                this.writeMessage(
                    `Player ${player.playerDesignator}'s characters are afflicted with weakness.`,
                );
                this.getPlayer(opponent).weakness = true;
                break;
            default:
                assertUnreachable(card.cardType);
        }
    };

    public readonly serialize = (
        playerDesignator: PlayerDesignator,
    ): GameSerialized => {
        return {
            actionOrderTrack: this.actionOrderTrack.serialize(),
            id: this.id,
            initiative: this.initiative,
            islandModifiers: {
                playerANet: this.playerA.netIsland,
                playerAPilings: this.playerA.pilingsIsland,
                playerBNet: this.playerB.netIsland,
                playerBPilings: this.playerB.pilingsIsland,
            },
            islands: this.islands.map((island) => {
                return island.serialize();
            }),
            messages: this.messages,
            nextIslandToSink: this.nextIslandToSink,
            you: playerDesignator,
            yourHand: this.getPlayer(playerDesignator).getHand(),
        };
    };
}
