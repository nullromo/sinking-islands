import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
    PlayerSerialized,
} from '../../commonTypes';
import { IslandType, PlayerDesignator } from '../../commonTypes';
import { createBlankGame } from '../../createBlankGame';
import { GameState } from '../../gameState';
import { randomUUID } from '../../random';
import { shuffleArray } from '../../util';
import { ActionOrderTrackOperations } from './actionOrderTrackOperations';
import { CardType } from './card';
import { CharacterOperations } from './characterOperations';
import { IslandOperations } from './islandOperations';
import { PlayerOperations } from './playerOperations';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GameOperations {
    /**
     * Creates a new game.
     */
    export const create = (): GameSerialized => {
        console.log('Creating game.');

        // create and randomize all the islands
        const islands: IslandSerialized[] = shuffleArray([
            IslandOperations.create(1, IslandType.NORMAL, true),
            IslandOperations.create(2, IslandType.NORMAL, false),
            IslandOperations.create(3, IslandType.NORMAL, false),
            IslandOperations.create(4, IslandType.NORMAL, true),
            IslandOperations.create(5, IslandType.NORMAL, false),
            IslandOperations.create(6, IslandType.VOLCANO, false),
            IslandOperations.create(7, IslandType.NORMAL, true),
            IslandOperations.create(8, IslandType.NORMAL, false),
            IslandOperations.create(9, IslandType.VOLCANO, false),
            IslandOperations.create(10, IslandType.NORMAL, true),
            IslandOperations.create(11, IslandType.SACRED, false),
            IslandOperations.create(12, IslandType.VOLCANO, false),
            IslandOperations.create(13, IslandType.NORMAL, true),
            IslandOperations.create(14, IslandType.SACRED, false),
            IslandOperations.create(15, IslandType.VOLCANO, false),
            IslandOperations.create(16, IslandType.NORMAL, true),
        ]);

        // create and randomize all the characters
        const characters: CharacterSerialized[] = shuffleArray([
            CharacterOperations.create(PlayerDesignator.PLAYER_A, 20),
            CharacterOperations.create(PlayerDesignator.PLAYER_A, 20),
            CharacterOperations.create(PlayerDesignator.PLAYER_A, 20),
            CharacterOperations.create(PlayerDesignator.PLAYER_A, 20),
            CharacterOperations.create(PlayerDesignator.PLAYER_A, 30),
            CharacterOperations.create(PlayerDesignator.PLAYER_A, 30),
            CharacterOperations.create(PlayerDesignator.PLAYER_A, 30),
            CharacterOperations.create(PlayerDesignator.PLAYER_A, 40),
            CharacterOperations.create(PlayerDesignator.PLAYER_B, 20),
            CharacterOperations.create(PlayerDesignator.PLAYER_B, 20),
            CharacterOperations.create(PlayerDesignator.PLAYER_B, 20),
            CharacterOperations.create(PlayerDesignator.PLAYER_B, 20),
            CharacterOperations.create(PlayerDesignator.PLAYER_B, 30),
            CharacterOperations.create(PlayerDesignator.PLAYER_B, 30),
            CharacterOperations.create(PlayerDesignator.PLAYER_B, 30),
            CharacterOperations.create(PlayerDesignator.PLAYER_B, 40),
        ]);

        // add one character to each island
        characters.forEach((character, index) => {
            IslandOperations.addCharacter(islands[index], character);
        });

        const playerA = PlayerOperations.create(PlayerDesignator.PLAYER_A);
        const playerB = PlayerOperations.create(PlayerDesignator.PLAYER_B);

        const blankGame = createBlankGame();

        return {
            ...blankGame,
            actionOrderTrack: ActionOrderTrackOperations.create(),
            id: randomUUID(),
            initiative: (
                islands.find((island) => {
                    return island.islandNumber === 1;
                }) as IslandSerialized
            ).characters[0].playerDesignator,
            islands,
            players: {
                [PlayerDesignator.PLAYER_A]: playerA,
                [PlayerDesignator.PLAYER_B]: playerB,
            },
        };
    };

    /**
     * Attempts to find an island matching the given island number.
     */
    export const findIsland = (game: GameSerialized, islandNumber: number) => {
        return game.islands.find((island) => {
            return island.islandNumber === islandNumber;
        });
    };

    export const getCurrentlyResolvingCard = (game: GameSerialized) => {
        if (game.activeCardIndex === null) {
            throw new Error(
                'Active card index was null while retrieving active card.',
            );
        }

        const card = game.actionOrderTrack.cardSlots[game.activeCardIndex];
        if (!card || card.cardType === null) {
            throw new Error('Face-down card or no card in active card slot.');
        }
        return card;
    };

    /**
     * Assigns a user to an available player in the game.
     */
    export const assignUserToGame = (
        game: GameSerialized,
        username: string,
    ) => {
        // make sure the game is in the right state
        if (game.gameState !== GameState.INITIAL_STATE) {
            throw new Error(
                'Cannot assign a user to a game that has already begun.',
            );
        }

        // search for an available player
        const availablePlayer = (
            Object.entries(game.players) as Array<
                [PlayerDesignator, PlayerSerialized]
            >
        ).find(([__, player]) => {
            return player.username === null;
        });

        // make sure there is an available player
        if (availablePlayer === undefined) {
            throw new Error(`Game with ID '${game.id}' is full.`);
        }

        // assign username
        game.players[availablePlayer[0]].username = username;
        console.log(
            `Assigned ${username} to game ${game.id} as ${availablePlayer[0]}.`,
        );

        // if all players have joined, start the game
        if (
            game.players[PlayerDesignator.PLAYER_A].username !== null &&
            game.players[PlayerDesignator.PLAYER_B].username !== null
        ) {
            // advance the game to the card placement step
            game.gameState = GameState.AWAIT_CARD_PLACEMENT;

            // set the active player
            game.waitingForPlayer = game.initiative;

            console.log(
                `Starting game ${game.id}. The starting player is ${game.initiative}.`,
            );
        }
    };

    /**
     * Returns true if the island has a net on it.
     */
    export const islandIsNetted = (
        game: GameSerialized,
        islandNumber: number,
    ) => {
        return (
            islandNumber ===
                game.players[PlayerDesignator.PLAYER_A].netIsland ||
            islandNumber === game.players[PlayerDesignator.PLAYER_B].netIsland
        );
    };

    /**
     * Returns true if the island has pilings on it.
     */
    export const islandHasPilings = (
        game: GameSerialized,
        islandNumber: number,
    ) => {
        return (
            islandNumber ===
                game.players[PlayerDesignator.PLAYER_A].pilingsIsland ||
            islandNumber ===
                game.players[PlayerDesignator.PLAYER_B].pilingsIsland
        );
    };

    /**
     * Returns true if the island is full.
     */
    export const islandIsFull = (
        game: GameSerialized,
        island: IslandSerialized,
    ) => {
        return (
            islandIsNetted(game, island.islandNumber) ||
            (island.smallCapacity &&
                !islandHasPilings(game, island.islandNumber) &&
                island.characters.length > 0)
        );
    };

    /**
     * Returns the two islands next to this island in an array. If there are
     * only 2 islands in the game, returns only 1 item. If there is only 1
     * island, returns an empty array.
     */
    export const getAdjacentIslands = (
        game: GameSerialized,
        islandNumber: number,
    ) => {
        if (game.islands.length <= 1) {
            return [];
        }
        const islandIndex = game.islands.findIndex((island) => {
            return island.islandNumber === islandNumber;
        });
        if (islandIndex < 0) {
            throw new Error(`Invalid island number: ${islandNumber}.`);
        }
        if (game.islands.length < 3) {
            return [game.islands[(islandIndex + 1) % 2]];
        }
        return [
            game.islands[
                (islandIndex + game.islands.length - 1) % game.islands.length
            ],
            game.islands[(islandIndex + 1) % game.islands.length],
        ];
    };

    /**
     * Moves a character from one island to another.
     *
     * Handles de-tortoise-ing the character.
     */
    export const moveCharacter = (
        game: GameSerialized,
        character: CharacterSerialized,
        fromIsland: IslandSerialized,
        toIsland: IslandSerialized,
        verb: string,
    ) => {
        console.log(
            `Player ${
                character.playerDesignator
            }'s ${character.strength}-strength ${
                character.tortoise ? 'tortoise' : 'character'
            } ${verb} from island ${
                fromIsland.islandNumber
            } to island ${toIsland.islandNumber}.`,
        );
        IslandOperations.removeCharacter(fromIsland, character);
        IslandOperations.addCharacter(toIsland, character);

        // reset tortoise and reclaim card if necessary
        if (character.tortoise) {
            character.tortoise = false;
            PlayerOperations.reclaim(
                game.players[character.playerDesignator],
                CardType.TORTOISE,
            );
        }
    };

    /**
     * Returns the set of islands that are within a range of 3 from the given
     * island number.
     */
    export const getIslandsWithinMovementRange = (
        game: GameSerialized,
        island: IslandSerialized,
    ) => {
        const withinOne = getAdjacentIslands(game, island.islandNumber);
        const withinTwo = withinOne.reduce((islands, thisIsland) => {
            return [
                ...islands,
                ...getAdjacentIslands(game, thisIsland.islandNumber),
            ];
        }, withinOne);
        const withinThree = withinTwo.reduce((islands, thisIsland) => {
            return [
                ...islands,
                ...getAdjacentIslands(game, thisIsland.islandNumber),
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
}
