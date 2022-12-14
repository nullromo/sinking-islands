import { Character } from './character';
import { Player, PlayerDesignator } from './player';
import { Island, IslandType } from './island';
import { shuffleArray } from './util';
import { Card } from './card';

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

    // representations of card slots on the Action Order Track
    private cardSlot1: Card | null = null;
    private cardSlot2: Card | null = null;
    private cardSlot3: Card | null = null;
    private cardSlot4: Card | null = null;
    private cardSlot5: Card | null = null;
    private cardSlot6: Card | null = null;

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
        let loser: PlayerDesignator | undefined = undefined;
        while (true) {
            // check if there is a loser and break if there is
            loser = this.getLoser();
            if (loser) {
                break;
            }

            ////
            const island = this.islands.find((island) => {
                return island.getCharacters().length > 0;
            });
            if (island) {
                console.log('rem');
                island.removeCharacter(island.getCharacters()[0]);
            }
            ////

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
            .join('')}`;
    };
}

new Game().play();
