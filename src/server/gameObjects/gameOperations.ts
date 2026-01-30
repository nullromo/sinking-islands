import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
    PlayerSerialized,
} from '../../commonTypes';
import { IslandType, PlayerDesignator } from '../../commonTypes';
import { createBlankGame } from '../../createBlankGame';
import { GameActionType, type GameAction } from '../../gameActionTypes';
import { GameState } from '../../gameState';
import { assertUnreachable, shuffleArray } from '../../util';
import { ActionOrderTrackOperations } from './actionOrderTrackOperations';
import { CharacterOperations } from './characterOperations';
import { IslandOperations } from './islandOperations';
import { PlayerOperations } from './playerOperations';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GameOperations {
    /**
     * Creates a new game.
     */
    export const create = (): GameSerialized => {
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
            id: crypto.randomUUID(),
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
     * Assigns a user to an available player in the game.
     */
    export const assignUserToGame = (
        game: GameSerialized,
        username: string,
    ) => {
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
    };

    export const takeGameAction = (
        game: GameSerialized,
        playerDesignator: PlayerDesignator,
        gameAction: GameAction,
    ) => {
        const checkGameStateAndPlayer = (gameState: GameState) => {
            if (game.gameState !== gameState) {
                throw new Error(
                    `Game '${game.id}' is not in the '${gameState}' state.`,
                );
            }
            if (game.waitingForPlayer !== playerDesignator) {
                throw new Error(
                    `It is not ${playerDesignator}'s turn in game '${game.id}'.`,
                );
            }
        };

        switch (gameAction.action) {
            case GameActionType.CARD_PLACEMENT:
                checkGameStateAndPlayer(GameState.AWAIT_CARD_PLACEMENT);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.FLYING_FISH_MOVEMENT:
                checkGameStateAndPlayer(GameState.AWAIT_FLYING_FISH_MOVEMENT);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.FOG_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_FOG_TARGET);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.HARPOON_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_HARPOON_TARGET);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.MOVEMENT_SET:
                checkGameStateAndPlayer(GameState.AWAIT_MOVEMENT_SET);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.NET_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_NET_TARGET);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.PILINGS_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_PILINGS_TARGET);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.TIDAL_SURGE_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_TIDAL_SURGE_TARGET);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.TIDAL_WAVE_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_TIDAL_WAVE_TARGET);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.TORTOISE_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_TORTOISE_TARGET);
                throw new Error('TODO: unimplemented game action');
            case GameActionType.FLEE_CHOICE:
                checkGameStateAndPlayer(GameState.AWAIT_FLEE_CHOICE);
                throw new Error('TODO: unimplemented game action');
            default:
                return assertUnreachable(gameAction);
        }
    };
}
