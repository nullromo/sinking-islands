import { Character } from './character';
import { Player, PlayerDesignator } from './player';
import { Island, IslandType } from './island';
import { shuffleArray } from './util';
import { Card } from './card';

class Game {
    private nextIslandToSink: number = 1;

    private initiative: PlayerDesignator = PlayerDesignator.PLAYER_A;

    private playerANetIsland: number = NaN;
    private playerAPilingsIsland: number = NaN;
    private playerBNetIsland: number = NaN;
    private playerBPilingsIsland: number = NaN;

    private playerA = new Player(PlayerDesignator.PLAYER_A);
    private playerB = new Player(PlayerDesignator.PLAYER_B);

    private cardSlot1: Card | null = null;
    private cardSlot2: Card | null = null;
    private cardSlot3: Card | null = null;
    private cardSlot4: Card | null = null;
    private cardSlot5: Card | null = null;
    private cardSlot6: Card | null = null;

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

        // TODO: remove these
        characters[0].tortoise = true;
        this.playerANetIsland = 1;
        this.playerBPilingsIsland = 1;

        characters.forEach((character, index) => {
            this.islands[index].addCharacter(character);
        });
    }

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

console.log(new Game().dump());
