import { ActionOrderTrack, CardPlacement } from './actionOrderTrack';
import { Card, CardType } from './card';
import { Character } from './character';
import { Island, IslandType } from './island';
import {
    FlyingFishMovement,
    HarpoonTarget,
    otherPlayerDesignator,
    Player,
    PlayerDesignator,
    TortoiseTarget,
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
                this.actionOrderTrack.assignPlacement(
                    cardPlacement,
                    player.indescretion,
                );

                // remove the cards from the player's hand
                Object.values(cardPlacement).forEach((card) => {
                    player.removeCardFromHand(card);
                });

                // remove indescretion's effect from the player
                player.indescretion = false;
            };

            // players take their turns
            takeTurn(initiativePlayer);
            takeTurn(otherPlayer);

            // print out the game state
            console.log(this.dump());

            // resolve the actions, catching any thrown PlayerDesignators
            try {
                this.resolveActionTrack();
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
                break;
            }

            // advance the rising waters marker
            while (!this.findIsland(this.nextIslandToSink)) {
                this.nextIslandToSink = (this.nextIslandToSink % 16) + 1;
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
    private readonly resolveActionTrack = () => {
        for (const [slot, card] of this.actionOrderTrack
            .getCardSlots()
            .entries()) {
            if (card === null) {
                console.log('The card in slot', slot, 'was fogged.');
                continue;
            }
            // find the player that played the card
            const player = this.getPlayer(card.playerDesignator);

            // execute the card's actions
            this.resolveCardEffect(card, player, slot);

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
     * Resolves the effects of a card played by a player in a slot.
     */
    private readonly resolveCardEffect = (
        card: Card,
        player: Player,
        slot: number,
    ) => {
        console.log('Executing', card);
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
                                    playerStrength:
                                        totals.playerStrength +
                                        (character.playerDesignator ===
                                        card.playerDesignator
                                            ? player.weakness
                                                ? 10
                                                : character.strength
                                            : 0),
                                    opponentStrength:
                                        totals.opponentStrength +
                                        (character.playerDesignator ===
                                        card.playerDesignator
                                            ? 0
                                            : this.getPlayer(opponent).weakness
                                            ? 10
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
                    console.log('There is nowhere for a flying fish to fly.');
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
                    console.log('There is no card to fog.');
                    break;
                }

                // try to get a fog target until a valid one is given
                let fogTarget: number | null = null;
                while (
                    !fogTarget ||
                    !this.actionOrderTrack.checkFogTargetLegal(slot, fogTarget)
                ) {
                    fogTarget = player.getFogTarget();
                }

                // fog the target
                console.log('Fogging slot', fogTarget);
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
                        .reduce((allCharacters, island) => {
                            return [
                                ...allCharacters,
                                ...island.getCharacters().map((character) => {
                                    return {
                                        character,
                                        islandNumber: island.islandNumber,
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
                this.findIsland(harpoonTarget.islandNumber)?.removeCharacter(
                    harpoonTarget.character,
                );
                break;
            case CardType.INDESCRETION:
                console.log(
                    `Player ${otherPlayerDesignator(
                        player.playerDesignator,
                    )} is put under the effects of indescretion.`,
                );
                this.getPlayer(
                    otherPlayerDesignator(player.playerDesignator),
                ).indescretion = true;
                break;
            case CardType.MEDITATION:
                console.log(`Player ${player.playerDesignator} meditates.`);
                player.reshuffle();
                break;
            case CardType.MOVEMENT:
                // TODO
                break;
            case CardType.NET:
                // try to get a net target until a valid one is given
                let netTarget: number | null = null;
                while (!netTarget || !this.findIsland(netTarget)) {
                    netTarget = player.getNetTarget();
                }

                // place the net
                console.log(
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
                    console.log(
                        'There are no islands that can support pilings.',
                    );
                    break;
                }

                // try to get a pilngs target until a valid one is given
                let pilingsTarget: number | null = null;
                while (
                    !pilingsTarget ||
                    !this.findIsland(pilingsTarget)?.smallCapacity ||
                    pilingsTarget === this.getPlayer(opponent).pilingsIsland
                ) {
                    pilingsTarget = player.getPilingsTarget();
                }

                // place the net
                console.log(
                    `Player ${player.playerDesignator} constructs pilings on island ${pilingsTarget}.`,
                );
                player.pilingsIsland = pilingsTarget;
                break;
            case CardType.PRAYER:
                console.log(`Player ${player.playerDesignator} prays.`);
                player.draw(
                    this.islands
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
                        }, 0),
                );
                break;
            case CardType.TIDAL_SURGE:
                // if there are no legal tidal surge targets, then the card
                // does nothing
                if (this.islands.length <= 1) {
                    console.log('The tide cannot surge.');
                    break;
                }

                // try to get a tidal surge target until a valid one is given
                let tidalSurgeTarget: number | null = null;
                while (
                    !tidalSurgeTarget ||
                    !this.getAdjacentIslands(this.nextIslandToSink).some(
                        (island) => {
                            return island.islandNumber === tidalSurgeTarget;
                        },
                    )
                ) {
                    tidalSurgeTarget = player.getTidalSurgeTarget();
                }

                // move the rising waters marker
                console.log(`The tide surges to island ${tidalSurgeTarget}.`);
                this.nextIslandToSink = tidalSurgeTarget;
                break;
            case CardType.TIDAL_WAVE:
                // try to get a tidal wave target until a valid one is given
                let tidalWaveTarget: number | null = null;
                while (!tidalWaveTarget || !this.findIsland(tidalWaveTarget)) {
                    tidalWaveTarget = player.getTidalWaveTarget();
                }

                // move the rising waters marker
                console.log(
                    `A tidal wave moves upon island ${tidalWaveTarget}.`,
                );
                this.nextIslandToSink = tidalWaveTarget;
                break;
            case CardType.TORTOISE:
                // try to get a tortoise target until a valid one is given
                let tortoiseTarget: TortoiseTarget | null = null;
                while (
                    !tortoiseTarget ||
                    tortoiseTarget.character.playerDesignator !==
                        player.playerDesignator ||
                    !this.findIsland(tortoiseTarget.islandNumber)
                        ?.getCharacters()
                        .some((character) => {
                            return (
                                character.dump() ===
                                tortoiseTarget?.character.dump()
                            );
                        })
                ) {
                    tortoiseTarget = player.getTortoiseTarget();
                }

                // make the target a tortoise
                console.log(
                    `Character ${tortoiseTarget.character.dump()} on island ${
                        tortoiseTarget.islandNumber
                    } turns into a tortoise.`,
                );
                (
                    (
                        this.findIsland(tortoiseTarget.islandNumber) as Island
                    ).findCharacter(tortoiseTarget.character) as Character
                ).tortoise = true;
                break;
            case CardType.VOLCANIC_ERUPTION:
                // if there are no volcanoes, the card does nothing
                if (
                    !this.islands.some((island) => {
                        return island.islandType === IslandType.VOLCANO;
                    })
                ) {
                    console.log('There are no volcanoes left.');
                    break;
                }

                // try to get a volcanic eruption target until a valid one is
                // given
                let volcanicEruptionTarget: number | null = null;
                while (
                    !volcanicEruptionTarget ||
                    this.findIsland(volcanicEruptionTarget)?.islandType !==
                        IslandType.VOLCANO
                ) {
                    volcanicEruptionTarget = player.getVolcanicEruptionTarget();
                }

                // erupt the volcano
                console.log(`Island ${volcanicEruptionTarget} erupts.`);

                // find islands affected by lava flows
                const lavaFlowIslands = this.getAdjacentIslands(
                    volcanicEruptionTarget,
                );

                // handle lava flow fleeing
                lavaFlowIslands.forEach((lavaFlowIsland) => {
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
                        let characterToFlee: Character | null = null;
                        while (
                            !characterToFlee ||
                            characterToFlee.playerDesignator !==
                                player.playerDesignator ||
                            !lavaFlowIsland
                                .getCharacters()
                                .some((character) => {
                                    return (
                                        character.dump() ===
                                        characterToFlee?.dump()
                                    );
                                })
                        ) {
                            characterToFlee = player.getFleeChoice();
                        }

                        // move the chosen character
                        console.log(
                            `Player ${
                                player.playerDesignator
                            }'s character ${characterToFlee.dump()} flees first.`,
                        );

                        // reset tortoise and reclaim card if necessary
                        if (characterToFlee.tortoise) {
                            characterToFlee.tortoise = false;
                            player.reclaim(CardType.TORTOISE);
                        }

                        // move the character
                        console.log(
                            `Character ${characterToFlee.dump()} flees from the lava flow.`,
                        );
                        lavaFlowIsland.removeCharacter(characterToFlee);
                        safeIsland.addCharacter(characterToFlee);
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
                            // reset tortoise and reclaim card if necessary
                            if (character.tortoise) {
                                character.tortoise = false;
                                this.getPlayer(
                                    character.playerDesignator,
                                ).reclaim(CardType.TORTOISE);
                            }

                            // move the character
                            console.log(
                                `Character ${character.dump()} flees from the lava flow.`,
                            );
                            lavaFlowIsland.removeCharacter(character);
                            safeIsland.addCharacter(character);
                        });
                    }
                });

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
                        console.log(
                            `Character ${character.dump()} burns to death in the lava flow.`,
                        );
                        lavaFlowIsland.removeCharacter(character);
                    });
                });

                // remove the volcano itself
                console.log(
                    `Island ${volcanicEruptionTarget} erupts and sinks.`,
                );
                this.islands = this.islands.filter((island) => {
                    return island.islandNumber !== volcanicEruptionTarget;
                });
                break;
            case CardType.WEAKNESS:
                console.log(
                    `Player ${player.playerDesignator}'s characters are afflicted with weakness.`,
                );
                this.getPlayer(opponent).weakness = true;
                break;
            default:
                assertUnreachable(card.cardType);
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
                }${island.islandNumber === this.playerA.netIsland ? 'A#' : ''}${
                    island.islandNumber === this.playerB.netIsland ? 'B#' : ''
                }${
                    island.islandNumber === this.playerA.pilingsIsland
                        ? 'A_'
                        : ''
                }${
                    island.islandNumber === this.playerB.pilingsIsland
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
