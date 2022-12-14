import { ActionOrderTrack } from './actionOrderTrack';
import { Card, CardType } from './card';
import { Character } from './character';
import { Island, IslandType } from './island';
import { Player, PlayerDesignator } from './player';
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

            // get card placement from initiative player
            const firstCardPlacement = initiativePlayer.getCardPlacement(
                this.actionOrderTrack.getAvailableSlots(),
            );

            // assign cards to action track
            this.actionOrderTrack.assignPlacement(firstCardPlacement);

            // get card placement from initiative player
            const secondCardPlacement = otherPlayer.getCardPlacement(
                this.actionOrderTrack.getAvailableSlots(),
            );

            // assign cards to action track
            this.actionOrderTrack.assignPlacement(secondCardPlacement);

            // print out the game state
            console.log(this.dump());

            // resolve the actions
            this.resolve();

            // swap the initiative
            this.initiative =
                this.initiative === PlayerDesignator.PLAYER_A
                    ? PlayerDesignator.PLAYER_B
                    : PlayerDesignator.PLAYER_A;

            // players draw new cards
            this.playerA.draw(3);
            this.playerB.draw(3);

            // print out the game state
            console.log(this.dump());
        }

        // the winner is the player that didn't lose
        const winner =
            loser === PlayerDesignator.PLAYER_A
                ? PlayerDesignator.PLAYER_B
                : PlayerDesignator.PLAYER_A;
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
     * Resolves the played cards in order.
     */
    private readonly resolve = () => {
        if (
            this.actionOrderTrack.getCardSlots().some((card) => {
                return card === null;
            })
        ) {
            throw new Error('A card is missing from the action track.');
        }
        for (const [slot, card] of (
            this.actionOrderTrack.getCardSlots() as Card[]
        ).entries()) {
            // find the player that played the card
            const player = this.getPlayer(card.playerDesignator);
            const opponent =
                player.playerDesignator === PlayerDesignator.PLAYER_A
                    ? PlayerDesignator.PLAYER_B
                    : PlayerDesignator.PLAYER_A;

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
                    // TODO
                    break;
                case CardType.FOG:
                    // TODO
                    break;
                case CardType.HARPOON:
                    // TODO
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
