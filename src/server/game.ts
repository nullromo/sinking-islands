import type { Socket } from 'socket.io';
import type { CharacterSerialized, GameSerialized } from '../commonTypes';
import {
    IslandType,
    otherPlayerDesignator,
    PlayerDesignator,
} from '../commonTypes';
import { computeMovementSteps } from '../computeMovementSteps';
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
import { CheckResult } from './checkResult';

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

    // next card to resolve (card that the game is waiting for input on)
    private activeCardIndex = 0;

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
        this.writeMessage('Creating game.');
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

        // determine starting player
        this.initiative = (
            this.islands.find((island) => {
                return island.islandNumber === 1;
            }) as Island
        ).getCharacters()[0].playerDesignator;
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
        this.writeMessage(`${playerDesignator} connected.`);
        if (this.isWaitingForPlayers()) {
            this.writeMessage(
                `Waiting for ${otherPlayerDesignator(playerDesignator)}.`,
            );
        }
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
        this.writeMessage('Starting game.');
        this.writeMessage(`The starting player is ${this.initiative}.`);
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
            this.writeMessage(`Begin round number ${roundCounter}.`);
            roundCounter += 1;
            this.broadcastGameState();

            // check if there is a loser and break if there is
            const loser = this.getLoser();
            if (loser) {
                return loser;
            }

            // reset the active card slot
            this.activeCardIndex = 0;

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
                    let checkResult: CheckResult = {
                        message: '',
                        success: false,
                    };
                    do {
                        this.writeMessage(
                            `Requesting card placement from ${player.playerDesignator}.`,
                        );
                        // eslint-disable-next-line no-await-in-loop
                        cardPlacement = await player.requestCardPlacement();
                        console.log('Got', cardPlacement);
                        checkResult = this.checkCardPlacementLegal(
                            player.playerDesignator,
                            cardPlacement,
                        );
                        console.log(checkResult.message);
                        player.updateStatus(checkResult);
                    } while (!checkResult.success);
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
            this.writeMessage(`Island ${this.nextIslandToSink} sinks.`);
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
     * Returns true if the island has a net on it.
     */
    private readonly islandIsNetted = (islandNumber: number) => {
        return (
            islandNumber === this.playerA.netIsland ||
            islandNumber === this.playerB.netIsland
        );
    };

    /**
     * Returns true if the island has pilings on it.
     */
    private readonly islandHasPilings = (islandNumber: number) => {
        return (
            islandNumber === this.playerA.pilingsIsland ||
            islandNumber === this.playerB.pilingsIsland
        );
    };

    /**
     * Returns true if the island cannot accept any more characters.
     */
    private readonly islandIsFull = (island: Island) => {
        return (
            this.islandIsNetted(island.islandNumber) ||
            (island.smallCapacity &&
                !this.islandHasPilings(island.islandNumber) &&
                island.getCharacters().length > 0)
        );
    };

    /**
     * Returns true if the given flying fish movement is legal.
     */
    private readonly checkFlyingFishMovementLegal = (
        playerDesignator: PlayerDesignator,
        flyingFishMovement: FlyingFishMovement,
    ): CheckResult => {
        // the player must move their own character
        if (
            flyingFishMovement.character.playerDesignator !== playerDesignator
        ) {
            return new CheckResult(
                false,
                "Cannot move a character that isn't yours.",
            );
        }

        const toIsland = this.findIsland(flyingFishMovement.toIslandNumber);

        // can't move to an island that already sank
        if (!toIsland) {
            return new CheckResult(
                false,
                "Cannot move to an island that doesn't exist",
            );
        }

        // can't move to an island that is at full capacity
        if (this.islandIsFull(toIsland)) {
            return new CheckResult(
                false,
                'Cannot move to an island that is full',
            );
        }

        // can't move a character that is not there
        if (
            !this.findIsland(
                flyingFishMovement.fromIslandNumber,
            )?.findCharacter(flyingFishMovement.character)
        ) {
            return new CheckResult(
                false,
                "Cannot move a character that isn't there",
            );
        }

        // all checks passed
        return new CheckResult(true, 'Flying fish movement is legal');
    };

    /**
     * Returns true if the given movement set is legal.
     */
    private readonly checkMovementSetLegal = (
        playerDesignator: PlayerDesignator,
        movementSet: MovementSet,
    ): CheckResult => {
        // there must be at least one movement
        if (movementSet.length < 1) {
            return new CheckResult(false, 'Must include at least 1 movement');
        }

        // check all movements
        for (const movement of movementSet) {
            // the player must move their own character
            if (movement.character.playerDesignator !== playerDesignator) {
                return new CheckResult(
                    false,
                    "Cannot move a character that isn't yours.",
                );
            }

            const toIsland = this.findIsland(movement.toIslandNumber);

            // can't move to an island that already sank
            if (!toIsland) {
                return new CheckResult(
                    false,
                    "Cannot move to an island that doesn't exist",
                );
            }

            // can't move a character that is not there
            if (
                !this.findIsland(movement.fromIslandNumber)?.findCharacter(
                    movement.character,
                )
            ) {
                return new CheckResult(
                    false,
                    "Cannot move a character that isn't there",
                );
            }

            // can't move to a netted island
            if (this.islandIsNetted(movement.toIslandNumber)) {
                return new CheckResult(false, 'Cannot move to a netted island');
            }

            // can't move off a netted island
            if (this.islandIsNetted(movement.fromIslandNumber)) {
                return new CheckResult(
                    false,
                    'Cannot move off a netted island',
                );
            }

            // movements cannot start and end on the same island
            if (movement.fromIslandNumber === movement.toIslandNumber) {
                return new CheckResult(
                    false,
                    'Cannot move from an island to the same island',
                );
            }
        }

        // the positioning of the characters after the movement must be legal
        for (const island of this.islands) {
            // if the island is not a small capacity island or if it has
            // pilings, then there won't be a problem
            if (
                !island.smallCapacity ||
                this.islandHasPilings(island.islandNumber)
            ) {
                continue;
            }

            // find out how many characters were added to the island
            const numberOfCharactersThatLeft = movementSet.reduce(
                (total, movement) => {
                    return (
                        total +
                        (movement.fromIslandNumber === island.islandNumber
                            ? 1
                            : 0)
                    );
                },
                0,
            );

            // find out how many characters were removed from the island
            const numberOfCharactersThatArrived = movementSet.reduce(
                (total, movement) => {
                    return (
                        total +
                        (movement.toIslandNumber === island.islandNumber
                            ? 1
                            : 0)
                    );
                },
                0,
            );

            // determine how many characters will be left on the island
            const numberOfCharactersAfterMovement =
                island.getCharacters().length +
                numberOfCharactersThatArrived -
                numberOfCharactersThatLeft;

            // make sure the number of characters left is legal. We already
            // know it's a small capacity island with no pilings, so the
            // character limit will always be 1 here
            if (numberOfCharactersAfterMovement > 1) {
                return new CheckResult(
                    false,
                    'Movement results in too many characters on an island',
                );
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
                return new CheckResult(
                    false,
                    'Two movements tried to move the same character',
                );
            }
        }

        // the total movement must be at least 1 and no more than 3
        const totalMovement = computeMovementSteps(
            this.getIslandsSerialized(),
            movementSet,
        );
        if (totalMovement < 1 || totalMovement > 3) {
            return new CheckResult(
                false,
                'Too many or not enough movement points spent',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Movement set is legal');
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
    ): CheckResult => {
        // player must not already have cards on the track
        if (this.actionOrderTrack.playerHasPlayed(playerDesignator)) {
            return new CheckResult(
                false,
                'Cannot play cards when cards have already been played',
            );
        }

        // all cards must be owned by the player placing them
        if (
            Object.values(cardPlacement).some((card) => {
                return card.playerDesignator !== playerDesignator;
            })
        ) {
            return new CheckResult(false, "Cannot play another player's cards");
        }

        // they must place 3 cards
        if (Object.entries(cardPlacement).length !== 3) {
            return new CheckResult(false, '3 cards must be placed');
        }

        // all chosen cards must be in the player's hand
        if (
            !this.getPlayer(playerDesignator).checkCardsInHand(
                Object.values(cardPlacement),
            )
        ) {
            return new CheckResult(
                false,
                "Cards must be played from the player's hand",
            );
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
            return new CheckResult(
                false,
                'Two cards cannot be placed in the same area of the action order track',
            );
        }

        // all slots used must be available
        const availableSlots = this.actionOrderTrack.getAvailableSlots();
        if (
            slots.some((slot) => {
                return !availableSlots.includes(slot);
            })
        ) {
            return new CheckResult(
                false,
                'Cannot place a card on an unavailable slot',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Card placement is legal');
    };

    /**
     * Returns true if the given harpoon target is legal.
     */
    private readonly checkHarpoonTargetLegal = (
        playerDesignator: PlayerDesignator,
        harpoonTarget: HarpoonTarget,
    ): CheckResult => {
        // if the target is a tortoise, it's not valid
        if (harpoonTarget.character.tortoise) {
            return new CheckResult(false, 'Cannot harpoon a tortoise');
        }

        // the player cannot shoot their own characters
        if (playerDesignator === harpoonTarget.character.playerDesignator) {
            return new CheckResult(false, 'Cannot harpoon your own character');
        }

        // find the island being targeted
        const targetIsland = this.findIsland(harpoonTarget.islandNumber);

        // if the island does not exist, the target is not valid
        if (!targetIsland) {
            return new CheckResult(
                false,
                'Cannot harpoon on an island that does not exist',
            );
        }

        // if there are no characters matching the target on the target island,
        // then it is not valid
        if (
            !targetIsland.getCharacters().some((character) => {
                return character.equals(harpoonTarget.character);
            })
        ) {
            return new CheckResult(
                false,
                'Cannot harpoon a character that does not exist',
            );
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
            return new CheckResult(
                false,
                'Cannot harpoon a character that is out of harpoon range',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Harpoon target is legal');
    };

    /**
     * Returns true if the given net target is legal.
     */
    private readonly checkNetTargetLegal = (netTarget: number): CheckResult => {
        // find the island
        const island = this.findIsland(netTarget);

        // the island must exist
        if (island === undefined) {
            return new CheckResult(
                false,
                'Cannot net an island that does not exist',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Net target is legal');
    };

    /**
     * Returns true if the given pilings target is legal.
     */
    private readonly checkPilingsTargetLegal = (
        playerDesignator: PlayerDesignator,
        pilingsTarget: number,
    ): CheckResult => {
        // find the island
        const island = this.findIsland(pilingsTarget);

        // the island must exist
        if (island === undefined) {
            return new CheckResult(
                false,
                'Cannot put pilings on an island that does not exist',
            );
        }

        // the island must have small capacity
        if (!island.smallCapacity) {
            return new CheckResult(
                false,
                'Cannot put pilings on a large capacity island',
            );
        }

        // the island must not already have pilings on it
        if (
            pilingsTarget ===
            this.getPlayer(otherPlayerDesignator(playerDesignator))
                .pilingsIsland
        ) {
            return new CheckResult(
                false,
                'Cannot put pilings on an island that already has pilings on it',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Pilings target is legal');
    };

    /**
     * Returns true if the given tidal surge target is legal.
     */
    private readonly checkTidalSurgeTargetLegal = (
        tidalSurgeTarget: number,
    ): CheckResult => {
        if (
            !this.getAdjacentIslands(this.nextIslandToSink).some(
                // eslint-disable-next-line @typescript-eslint/no-loop-func
                (island) => {
                    return island.islandNumber === tidalSurgeTarget;
                },
            )
        ) {
            return new CheckResult(
                false,
                'Cannot tidal surge to a non-adjacent island',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Tidal surge target is legal');
    };

    /**
     * Returns true if the given tidal wave target is legal.
     */
    private readonly checkTidalWaveTargetLegal = (
        tidalWaveTarget: number,
    ): CheckResult => {
        // find the island
        const island = this.findIsland(tidalWaveTarget);

        // the island must exist
        if (!island) {
            return new CheckResult(
                false,
                'Cannot tidal wave to an island that does not exist',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Tidal wave target is legal');
    };

    /**
     * Returns true if the given tortoise target is legal.
     */
    private readonly checkTortoiseTargetLegal = (
        playerDesignator: PlayerDesignator,
        tortoiseTarget: TortoiseTarget,
    ): CheckResult => {
        // the player must target their own character
        if (tortoiseTarget.character.playerDesignator !== playerDesignator) {
            return new CheckResult(
                false,
                "Cannot target a character that isn't yours",
            );
        }

        // find the island
        const island = this.findIsland(tortoiseTarget.islandNumber);

        // the island must exist
        if (!island) {
            return new CheckResult(
                false,
                'Cannot tortoise on an island that does not exist',
            );
        }

        // the character must exist
        if (
            !island.getCharacters().some((character) => {
                return character.equals(tortoiseTarget.character);
            })
        ) {
            return new CheckResult(
                false,
                'Cannot tortoise a character that does not exist',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Tortoise target is legal');
    };

    /**
     * Returns true if the given volcanic eruption target is legal.
     */
    private readonly checkVolcanicEruptionTargetLegal = (
        volcanicEruptionTarget: number,
    ): CheckResult => {
        // find the island
        const island = this.findIsland(volcanicEruptionTarget);

        // the island must exist
        if (!island) {
            return new CheckResult(
                false,
                'Cannot erupt an island that does not exist',
            );
        }

        // the island must be a volcano
        if (island.islandType !== IslandType.VOLCANO) {
            return new CheckResult(
                false,
                'Cannot erupt an island that is not a volcano',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Volcanic eruption target is legal');
    };

    /**
     * Returns true if the given flee choice is legal.
     */
    private readonly checkFleeChoiceLegal = (
        playerDesignator: PlayerDesignator,
        lavaFlowIsland: Island,
        characterToFlee: CharacterSerialized,
    ): CheckResult => {
        // the player must choose their own character
        if (characterToFlee.playerDesignator !== playerDesignator) {
            return new CheckResult(
                false,
                "Cannot choose a character that isn't yours",
            );
        }
        if (
            !lavaFlowIsland.getCharacters().some((character) => {
                return character.equals(characterToFlee);
            })
        ) {
            return new CheckResult(
                false,
                'Cannot choose a character that does not exist',
            );
        }

        // all checks passed
        return new CheckResult(true, 'Flee choice is legal');
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
                this.writeMessage('The card in slot', slot + 1, 'was fogged.');
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

            // advance the active card index
            this.activeCardIndex += 1;

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
            }'s ${upperSnakeToTitle(card.cardType)}.`,
        );
        const opponent = otherPlayerDesignator(player.playerDesignator);
        let checkResult: CheckResult = { message: '', success: false };
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
                    if (
                        playerStrength > opponentStrength &&
                        opponentStrength > 0
                    ) {
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
                    !this.islands.some((island) => {
                        return !this.islandIsFull(island);
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
                do {
                    this.writeMessage(
                        `Requesting flying fish movement from ${player.playerDesignator}.`,
                    );
                    flyingFishMovement =
                        // eslint-disable-next-line no-await-in-loop
                        await player.requestFlyingFishMovement();
                    console.log('Got', flyingFishMovement);
                    checkResult = this.checkFlyingFishMovementLegal(
                        player.playerDesignator,
                        flyingFishMovement,
                    );
                    console.log(checkResult.message);
                    player.updateStatus(checkResult);
                } while (!checkResult.success);

                // move the character
                this.writeMessage(
                    `Player ${
                        flyingFishMovement.character.playerDesignator
                    }'s ${flyingFishMovement.character.strength}-strength ${
                        flyingFishMovement.character.tortoise
                            ? 'tortoise'
                            : 'character'
                    } flies from island ${
                        flyingFishMovement.fromIslandNumber
                    } to island ${flyingFishMovement.toIslandNumber}.`,
                );
                this.findIsland(
                    flyingFishMovement.fromIslandNumber,
                )?.removeCharacter(flyingFishMovement.character);
                this.findIsland(
                    flyingFishMovement.toIslandNumber,
                )?.addCharacter(flyingFishMovement.character);

                // reset tortoise and reclaim card if necessary
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
                do {
                    this.writeMessage(
                        `Requesting fog target from ${player.playerDesignator}.`,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    fogTarget = await player.requestFogTarget();
                    console.log('Got', fogTarget);
                } while (
                    !this.actionOrderTrack.checkFogTargetLegal(slot, fogTarget)
                );

                // fog the target
                this.writeMessage(`Fogging slot ${fogTarget + 1}.`);
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
                            ).success;
                        })
                ) {
                    this.writeMessage(
                        `There are no valid harpoon targets for player ${player.playerDesignator}.`,
                    );
                    break;
                }

                let harpoonTarget: HarpoonTarget | null = null;
                console.log('Starting harpoon loop');
                do {
                    this.writeMessage(
                        `Requesting harpoon target from ${player.playerDesignator}.`,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    harpoonTarget = await player.requestHarpoonTarget();
                    console.log('Got', harpoonTarget);
                    checkResult = this.checkHarpoonTargetLegal(
                        player.playerDesignator,
                        harpoonTarget,
                    );
                    console.log(checkResult.message);
                    player.updateStatus(checkResult);
                } while (!checkResult.success);

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
                                    return !this.islandIsFull(otherIsland);
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
                do {
                    this.writeMessage(
                        `Requesting movement set from ${player.playerDesignator}.`,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    movementSet = await player.requestMovementSet();
                    console.log('Got', movementSet);
                    checkResult = this.checkMovementSetLegal(
                        player.playerDesignator,
                        movementSet,
                    );
                    console.log(checkResult.message);
                    player.updateStatus(checkResult);
                } while (!checkResult.success);

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
                    // reset tortoise and reclaim card if necessary
                    if (movement.character.tortoise) {
                        movement.character.tortoise = false;
                        this.getPlayer(
                            movement.character.playerDesignator,
                        ).reclaim(CardType.TORTOISE);
                    }
                    this.findIsland(movement.toIslandNumber)?.addCharacter(
                        movement.character,
                    );
                });
                break;
            case CardType.NET:
                // try to get a net target until a valid one is given
                let netTarget: number | null = null;
                console.log('Starting net loop');
                do {
                    this.writeMessage(
                        `Requesting net target from ${player.playerDesignator}.`,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    netTarget = await player.requestNetTarget();
                    console.log('Got', netTarget);
                    checkResult = this.checkNetTargetLegal(netTarget);
                    console.log(checkResult.message);
                    player.updateStatus(checkResult);
                } while (!checkResult.success);

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
                do {
                    this.writeMessage(
                        `Requesting pilings target from ${player.playerDesignator}.`,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    pilingsTarget = await player.requestPilingsTarget();
                    console.log('Got', pilingsTarget);
                    checkResult = this.checkPilingsTargetLegal(
                        player.playerDesignator,
                        pilingsTarget,
                    );
                    console.log(checkResult);
                    player.updateStatus(checkResult);
                } while (!checkResult.success);

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
                do {
                    this.writeMessage(
                        `Requesting tidal surge target from ${player.playerDesignator}.`,
                    );
                    // eslint-disable-next-line no-await-in-loop, require-atomic-updates
                    tidalSurgeTarget = await player.requestTidalSurgeTarget();
                    console.log('Got', tidalSurgeTarget);
                    checkResult =
                        this.checkTidalSurgeTargetLegal(tidalSurgeTarget);
                    console.log(checkResult.message);
                    player.updateStatus(checkResult);
                } while (!checkResult.success);

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
                do {
                    this.writeMessage(
                        `Requesting tidal wave target from ${player.playerDesignator}.`,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    tidalWaveTarget = await player.requestTidalWaveTarget();
                    console.log('Got', tidalWaveTarget);
                    checkResult =
                        this.checkTidalWaveTargetLegal(tidalWaveTarget);
                    console.log(checkResult.message);
                    player.updateStatus(checkResult);
                } while (!checkResult.success);

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
                do {
                    this.writeMessage(
                        `Requesting tortoise target from ${player.playerDesignator}.`,
                    );
                    // eslint-disable-next-line no-await-in-loop, require-atomic-updates
                    tortoiseTarget = await player.requestTortoiseTarget();
                    console.log('Got', tortoiseTarget);
                    checkResult = this.checkTortoiseTargetLegal(
                        player.playerDesignator,
                        tortoiseTarget,
                    );
                    console.log(checkResult.message);
                    player.updateStatus(checkResult);
                } while (!checkResult.success);

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
                do {
                    this.writeMessage(
                        `Requesting volcanic eruption target from ${player.playerDesignator}.`,
                    );
                    // eslint-disable-next-line require-atomic-updates
                    volcanicEruptionTarget =
                        // eslint-disable-next-line no-await-in-loop
                        await player.requestVolcanicEruptionTarget();
                    console.log('Got', volcanicEruptionTarget);
                    checkResult = this.checkVolcanicEruptionTargetLegal(
                        volcanicEruptionTarget,
                    );
                    console.log(checkResult.message);
                    player.updateStatus(checkResult);
                } while (!checkResult.success);

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
                    // netted and does not have pilings and the volcano
                    // erupter has a character on the lava flow island, let
                    // them choose a character to flee
                    if (
                        safeIsland.smallCapacity &&
                        safeIsland.getCharacters().length <= 0 &&
                        !this.islandIsNetted(safeIsland.islandNumber) &&
                        !this.islandHasPilings(safeIsland.islandNumber) &&
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
                        do {
                            this.writeMessage(
                                `Requesting flee choice from ${player.playerDesignator}.`,
                            );
                            // eslint-disable-next-line no-await-in-loop, require-atomic-updates
                            characterToFlee = await player.requestFleeChoice();
                            console.log('Got', characterToFlee);
                            checkResult = this.checkFleeChoiceLegal(
                                player.playerDesignator,
                                lavaFlowIsland,
                                characterToFlee,
                            );
                            console.log(checkResult.message);
                            player.updateStatus(checkResult);
                        } while (!checkResult.success);

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
                    if (!this.islandIsFull(safeIsland)) {
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

    public readonly getIslandsSerialized = () => {
        return this.islands.map((island) => {
            return island.serialize();
        });
    };

    public readonly serialize = (
        playerDesignator: PlayerDesignator,
    ): GameSerialized => {
        return {
            actionOrderTrack: this.actionOrderTrack.serialize(playerDesignator),
            activeCardIndex: this.activeCardIndex,
            id: this.id,
            indescretion: {
                [PlayerDesignator.PLAYER_A]: this.playerA.indescretion,
                [PlayerDesignator.PLAYER_B]: this.playerB.indescretion,
            },
            initiative: this.initiative,
            islandModifiers: {
                playerANet: this.playerA.netIsland,
                playerAPilings: this.playerA.pilingsIsland,
                playerBNet: this.playerB.netIsland,
                playerBPilings: this.playerB.pilingsIsland,
            },
            islands: this.getIslandsSerialized(),
            messages: this.messages,
            nextIslandToSink: this.nextIslandToSink,
            you: playerDesignator,
            yourHand: this.getPlayer(playerDesignator).getHand(),
        };
    };
}
