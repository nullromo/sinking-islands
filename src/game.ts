import { ActionOrderTrack, CardPlacement } from './actionOrderTrack';
import { CardType } from './card';
import { Character } from './character';
import { Island, IslandType } from './island';
import {
    FlyingFishMovement,
    HarpoonTarget,
    otherPlayerDesignator,
    Player,
    PlayerDesignator,
} from './player';
import { assertUnreachable, shuffleArray } from './util';

/**
 * Represents a game of Sinking Islands
 */
class Game {
    // the island with the Rising Waters marker on it
    private nextIslandToSink: number = 1;

    // the player that plays first this turn
    private initiative: PlayerDesignator = PlayerDesignator.PLAYER_A;

    // specifiers for which islands have which player tokens on them
    private playerANetIsland: number = NaN;
    private playerAPilingsIsland: number = NaN;
    private playerBNetIsland: number = NaN;
    private playerBPilingsIsland: number = NaN;

    // representations of the 2 players
    private playerA = new Player(PlayerDesignator.PLAYER_A);
    private playerB = new Player(PlayerDesignator.PLAYER_B);

    // representation of the Action Order Track
    private actionOrderTrack = new ActionOrderTrack();

    // representation of all the islands in the archipelago
    private islands: Island[] = shuffleArray([
        new Island(1, IslandType.NORMAL, false),
        new Island(2, IslandType.NORMAL, true),
        new Island(3, IslandType.NORMAL, true),
        new Island(4, IslandType.NORMAL, false),
        new Island(5, IslandType.NORMAL, true),
        new Island(6, IslandType.VOLCANO, true),
        new Island(7, IslandType.NORMAL, false),
        new Island(8, IslandType.NORMAL, true),
        new Island(9, IslandType.VOLCANO, true),
        new Island(10, IslandType.NORMAL, false),
        new Island(11, IslandType.SACRED, true),
        new Island(12, IslandType.VOLCANO, true),
        new Island(13, IslandType.NORMAL, false),
        new Island(14, IslandType.SACRED, true),
        new Island(15, IslandType.VOLCANO, true),
        new Island(16, IslandType.NORMAL, false),
    ]);

    public constructor() {
        console.log('Creating game');
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
            this.islands[index % 4].addCharacter(character);
        });
    }

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
    public readonly play = () => {
        console.log('Starting game');
        let loser: PlayerDesignator | undefined = undefined;
        let roundCounter = 1;
        while (true) {
            console.log('Begin round number', roundCounter++);
            // check if there is a loser and break if there is
            loser = this.getLoser();
            if (loser) {
                break;
            }

            // print out the game state
            console.log(this.dump());

            // determine player order
            const initiativePlayer = this.getPlayer(this.initiative);
            const otherPlayer =
                initiativePlayer === this.playerA ? this.playerB : this.playerA;

            // function that takes a turn for 1 player
            const takeTurn = (player: Player) => {
                // get card placement from player
                const cardPlacement = (() => {
                    // keep trying until a valid card placement is given
                    let cardPlacement: CardPlacement | null = null;
                    while (
                        !cardPlacement ||
                        !this.actionOrderTrack.checkCardPlacementLegal(
                            player.playerDesignator,
                            cardPlacement,
                        )
                    ) {
                        cardPlacement = player.getCardPlacement();
                    }
                    return cardPlacement;
                })();

                // assign cards to action track
                this.actionOrderTrack.assignPlacement(cardPlacement);

                // remove the cards from the player's hand
                Object.values(cardPlacement).forEach((card) => {
                    player.removeCardFromHand(card);
                });
            };

            // players take their turns
            takeTurn(initiativePlayer);
            takeTurn(otherPlayer);

            // print out the game state
            console.log(this.dump());

            // resolve the actions, catching any thrown PlayerDesignators
            try {
                this.resolve();
            } catch (error: unknown) {
                // if a PlayerDesignator was thrown, then that's the loser
                if (
                    error === PlayerDesignator.PLAYER_A ||
                    error === PlayerDesignator.PLAYER_B
                ) {
                    loser = error;
                    break;
                }

                // otherwise, it's a real error
                throw error;
            }

            // sink the lowest island
            this.islands = this.islands.filter((island) => {
                return island.islandNumber !== this.nextIslandToSink;
            });

            // if there are no islands left, then the game is a draw
            if (this.islands.length < 1) {
                break;
            }

            // advance the rising waters marker
            while (!this.findIsland(this.nextIslandToSink)) {
                this.nextIslandToSink = (this.nextIslandToSink + 1) % 16;
            }

            // swap the initiative
            this.initiative = otherPlayerDesignator(this.initiative);

            // players draw new cards
            this.playerA.draw(3);
            this.playerB.draw(3);

            // print out the game state
            console.log(this.dump());
        }

        if (!loser) {
            throw new Error('Could not determine a winner.');
        }
        // the winner is the player that didn't lose
        const winner = otherPlayerDesignator(loser);
        console.log('Game over. The winner is', winner);
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
            flyingFishMovement.toIslandNumber === this.playerANetIsland ||
            flyingFishMovement.toIslandNumber === this.playerBNetIsland
        ) {
            return false;
        }

        // can't move to an island that already sank
        if (!this.findIsland(flyingFishMovement?.toIslandNumber)) {
            return false;
        }

        // can't move a character that is not there
        if (
            !this.findIsland(
                flyingFishMovement?.fromIslandNumber,
            )?.findCharacter(flyingFishMovement.character)
        ) {
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
                return character.dump() === harpoonTarget.character.dump();
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
    private readonly resolve = () => {
        for (const [slot, card] of this.actionOrderTrack
            .getCardSlots()
            .entries()) {
            if (card === null) {
                console.log('The card in slot', slot, 'was fogged.');
                continue;
            }
            // find the player that played the card
            const player = this.getPlayer(card.playerDesignator);
            const opponent = otherPlayerDesignator(player.playerDesignator);

            console.log('Executing', card);

            // execute the card's actions
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
                                        playerStrength:
                                            totals.playerStrength +
                                            (character.playerDesignator ===
                                            card.playerDesignator
                                                ? character.strength
                                                : 0),
                                        opponentStrength:
                                            totals.opponentStrength +
                                            (character.playerDesignator ===
                                            card.playerDesignator
                                                ? 0
                                                : character.strength),
                                    };
                                },
                                { playerStrength: 0, opponentStrength: 0 },
                            );

                        // kill necessary characters
                        if (playerStrength > opponentStrength) {
                            console.log(
                                `Player ${opponent}'s characters are crabbed on island ${island.islandNumber}.`,
                            );
                            island.removeCharactersOfPlayer(opponent);
                        }
                    });
                    break;
                case CardType.FLYING_FISH:
                    // if there are no legal islands to move to, the flying
                    // fish has no effect. This can only occur if all islands
                    // are netted
                    if (
                        (this.islands.length === 2 &&
                            this.playerANetIsland &&
                            this.playerBNetIsland &&
                            this.playerANetIsland !== this.playerBNetIsland) ||
                        (this.islands.length === 1 &&
                            (this.playerANetIsland || this.playerBNetIsland))
                    ) {
                        break;
                    }

                    // try to get a movement until a valid one is given
                    let flyingFishMovement: FlyingFishMovement | null = null;
                    while (
                        !flyingFishMovement ||
                        !this.checkFlyingFishMovementLegal(flyingFishMovement)
                    ) {
                        flyingFishMovement = player.getFlyingFishMovement();
                    }

                    // move the character
                    console.log(
                        flyingFishMovement.character.dump(),
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
                    break;
                case CardType.FOG:
                    // if the fog was the last card (for some reason), then it
                    // has no effect
                    if (slot >= 5) {
                        break;
                    }

                    // try to get a fog target until a valid one is given
                    let fogTarget: number | null = null;
                    while (
                        !fogTarget ||
                        !this.actionOrderTrack.checkFogTargetLegal(
                            slot,
                            fogTarget,
                        )
                    ) {
                        fogTarget = player.getFogTarget();
                    }

                    // fog the target
                    console.log('Fogging slot', fogTarget);
                    const foggedCard =
                        this.actionOrderTrack.resetSlot(fogTarget);
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
                            .reduce((allCharacters, island) => {
                                return [
                                    ...allCharacters,
                                    ...island
                                        .getCharacters()
                                        .map((character) => {
                                            return {
                                                character,
                                                islandNumber:
                                                    island.islandNumber,
                                            };
                                        }),
                                ];
                            }, [] as HarpoonTarget[])
                            .some((harpoonTarget) => {
                                return this.checkHarpoonTargetLegal(
                                    player.playerDesignator,
                                    harpoonTarget,
                                );
                            })
                    ) {
                        console.log(
                            `There are no valid harpoon targets for player ${player.playerDesignator}.`,
                        );
                        break;
                    }

                    let harpoonTarget: HarpoonTarget | null = null;
                    while (
                        !harpoonTarget ||
                        !this.checkHarpoonTargetLegal(
                            player.playerDesignator,
                            harpoonTarget,
                        )
                    ) {
                        harpoonTarget = player.getHarpoonTarget();
                    }

                    // kill the target
                    console.log(
                        `Character ${harpoonTarget.character.dump()} on island ${
                            harpoonTarget.islandNumber
                        } is harpooned.`,
                    );
                    this.findIsland(
                        harpoonTarget.islandNumber,
                    )?.removeCharacter(harpoonTarget.character);
                    break;
                case CardType.INDESCRETION:
                    // TODO
                    break;
                case CardType.MEDITATION:
                    // TODO
                    break;
                case CardType.MOVEMENT:
                    // TODO
                    break;
                case CardType.NET:
                    // TODO
                    break;
                case CardType.PILINGS:
                    // TODO
                    break;
                case CardType.PRAYER:
                    // TODO
                    break;
                case CardType.TIDAL_SURGE:
                    // TODO
                    break;
                case CardType.TIDAL_WAVE:
                    // TODO
                    break;
                case CardType.TORTOISE:
                    // TODO
                    break;
                case CardType.VOLCANIC_ERUPTION:
                    // TODO
                    break;
                case CardType.WEAKNESS:
                    // TODO
                    break;
                default:
                    assertUnreachable(card.cardType);
            }

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

            // check to see if the game is over
            const loser = this.getLoser();
            if (loser) {
                throw loser;
            }
        }
    };

    /**
     * Returns a string representation of the game.
     */
    public readonly dump = () => {
        return `${this.initiative}\n${this.islands
            .map((island) => {
                return `${island.dump()}${
                    island.islandNumber === this.nextIslandToSink ? '*' : ''
                }${island.islandNumber === this.playerANetIsland ? 'A#' : ''}${
                    island.islandNumber === this.playerBNetIsland ? 'B#' : ''
                }${
                    island.islandNumber === this.playerAPilingsIsland
                        ? 'A_'
                        : ''
                }${
                    island.islandNumber === this.playerBPilingsIsland
                        ? 'B_'
                        : ''
                }\n`;
            })
            .join(
                '',
            )}\n${this.playerA.dump()}\n${this.playerB.dump()}\n${this.actionOrderTrack.dump()}`;
    };
}

new Game().play();
