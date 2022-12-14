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
    private readonly islands: Island[] = shuffleArray([
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
        let iterations = 0;
        while (true) {
            iterations += 1;
            if (iterations > 1) {
                console.log('breaking infinite loop');
                break;
            }
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

            // resolve the actions
            this.resolve();

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

        return true;
    };

    /**
     * Returns true if the given harpoon target is legal.
     */
    private readonly checkHarpoonTargetLegal = (
        playerDesignator: PlayerDesignator,
        harpoonTarget: HarpoonTarget,
    ) => {
        //TODO
        return true;
    };

    /**
     * Resolves the played cards in order.
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
                    // has no effect
                    if (false) {
                        // TODO
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
                    //TODO
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
