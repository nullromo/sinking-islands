import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
    PlayerSerialized,
} from '../../commonTypes';
import {
    IslandType,
    otherPlayerDesignator,
    PlayerDesignator,
} from '../../commonTypes';
import { createBlankGame } from '../../createBlankGame';
import { GameActionType, type GameAction } from '../../gameActionTypes';
import { GameState } from '../../gameState';
import { randomUUID } from '../../random';
import { assertUnreachable, shuffleArray } from '../../util';
import type { CardPlacement } from './actionOrderTrack';
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
     * Resolves as much as possible without input from a user.
     */
    export const resolveCards = (game: GameSerialized) => {
        // TODO
    };

    /**
     * Resolves anything that can be resolved without user input and leaves the
     * game's main state variables with the correct values so that the next
     * action can be taken.
     */
    export const advanceGameState = (game: GameSerialized) => {
        switch (game.gameState) {
            case GameState.INITIAL_STATE:
                // if the game is in the initial state but all players have
                // joined, start the game
                if (
                    game.players[PlayerDesignator.PLAYER_A].username !== null &&
                    game.players[PlayerDesignator.PLAYER_B].username !== null
                ) {
                    // advance the game to the card placement step
                    game.gameState = GameState.AWAIT_CARD_PLACEMENT;

                    // set the active player
                    game.waitingForPlayer = game.initiative;
                }
                return;
            case GameState.AWAIT_CARD_PLACEMENT:
                // if not all cards have been placed, wait for the next player
                // to place their cards
                if (
                    game.actionOrderTrack.cardSlots.some((slot) => {
                        return slot === null;
                    })
                ) {
                    game.waitingForPlayer = otherPlayerDesignator(
                        game.waitingForPlayer,
                    );
                } else {
                    // all cards have been placed, so advance the game to the
                    // next step
                    resolveCards(game);
                }
                return;
            case GameState.AWAIT_FLYING_FISH_MOVEMENT:
            case GameState.AWAIT_FOG_TARGET:
            case GameState.AWAIT_HARPOON_TARGET:
            case GameState.AWAIT_MOVEMENT_SET:
            case GameState.AWAIT_NET_TARGET:
            case GameState.AWAIT_PILINGS_TARGET:
            case GameState.AWAIT_TIDAL_SURGE_TARGET:
            case GameState.AWAIT_TIDAL_WAVE_TARGET:
            case GameState.AWAIT_TORTOISE_TARGET:
            case GameState.AWAIT_VOLCANIC_ERUPTION_TARGET:
            case GameState.AWAIT_FLEE_CHOICE:
            case GameState.FINISHED:
                throw new Error('TODO');
            default:
                assertUnreachable(game.gameState);
        }
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

        // advance the game state
        advanceGameState(game);
    };

    const handleCardPlacementAction = (
        game: GameSerialized,
        playerDesignator: PlayerDesignator,
        cardPlacement: CardPlacement,
    ) => {
        const player = game.players[playerDesignator];

        // player must not already have cards on the track
        if (
            ActionOrderTrackOperations.playerHasPlayed(
                game.actionOrderTrack,
                playerDesignator,
            )
        ) {
            throw new Error(
                'Cannot play cards when cards have already been played.',
            );
        }

        // all cards must be owned by the player placing them
        if (
            Object.values(cardPlacement).some((card) => {
                return card.playerDesignator !== playerDesignator;
            })
        ) {
            throw new Error("Cannot play another player's cards.");
        }

        // they must place 3 cards
        if (Object.entries(cardPlacement).length !== 3) {
            throw new Error('3 cards must be placed.');
        }

        // all chosen cards must be in the player's hand
        if (
            !PlayerOperations.checkCardsInHand(
                player,
                Object.values(cardPlacement),
            )
        ) {
            throw new Error("Cards must be played from the player's hand.");
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
            throw new Error(
                'Two cards cannot be placed in the same area of the action order track.',
            );
        }

        // all slots used must be available
        const availableSlots = ActionOrderTrackOperations.getAvailableSlots(
            game.actionOrderTrack,
        );
        if (
            slots.some((slot) => {
                return !availableSlots.includes(slot);
            })
        ) {
            throw new Error('Cannot place a card on an unavailable slot.');
        }

        // assign cards to action track
        ActionOrderTrackOperations.assignPlacement(
            game.actionOrderTrack,
            cardPlacement,
            player.indiscretion,
        );

        // remove the cards from the player's hand
        Object.values(cardPlacement).forEach((card) => {
            PlayerOperations.removeCardFromHand(player, card);
        });

        // remove indiscretion's effect from the player
        player.indiscretion = false;
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
                handleCardPlacementAction(
                    game,
                    playerDesignator,
                    gameAction.data,
                );
                advanceGameState(game);
                return;
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
