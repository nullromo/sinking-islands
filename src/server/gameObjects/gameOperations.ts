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
import { mapToValues } from '../../maps';
import { randomUUID } from '../../random';
import { assertUnreachable, shuffleArray } from '../../util';
import { handleCardPlacement } from '../actionHandlers/cardPlacementAction';
import { handleFlyingFish } from '../actionHandlers/flyingFishAction';
import { handleFog } from '../actionHandlers/fogAction';
import { handleHarpoon } from '../actionHandlers/harpoonAction';
import { handleMovement } from '../actionHandlers/movementAction';
import { handleNet } from '../actionHandlers/netAction';
import { handlePilings } from '../actionHandlers/pilingsAction';
import { handleTidalSurge } from '../actionHandlers/tidalSurgeAction';
import { handleTidalWave } from '../actionHandlers/tidalWaveAction';
import { handleTortoise } from '../actionHandlers/tortoiseAction';
import { handleVolcanicEruption } from '../actionHandlers/volcanicEruptionAction';
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

    /**
     * Processes end-of-round actions and prepares the game for the next round.
     */
    const endRound = (game: GameSerialized) => {
        // weakness wears off
        game.players[PlayerDesignator.PLAYER_A].weakness = false;
        game.players[PlayerDesignator.PLAYER_B].weakness = false;

        // reset the face up card list
        ActionOrderTrackOperations.resetFaceUpCards(game.actionOrderTrack);

        // players reclaim their set aside cards due to sunken tokens or
        // characters
        mapToValues(game.players).forEach((player) => {
            // reclaim net card
            if (player.netIsland === game.nextIslandToSink) {
                PlayerOperations.reclaim(player, CardType.NET);
            }

            // reclaim pilings card
            if (player.pilingsIsland === game.nextIslandToSink) {
                PlayerOperations.reclaim(player, CardType.PILINGS);
            }

            // reclaim tortoise card
            if (
                findIsland(game, game.nextIslandToSink)?.characters.some(
                    (character) => {
                        return (
                            character.playerDesignator ===
                                player.playerDesignator && character.tortoise
                        );
                    },
                )
            ) {
                PlayerOperations.reclaim(player, CardType.TORTOISE);
            }
        });

        // sink the lowest island
        console.log(`Island ${game.nextIslandToSink} sinks.`);
        game.islands = game.islands.filter((island) => {
            return island.islandNumber !== game.nextIslandToSink;
        });

        // if there are no islands left, then the game is a draw
        if (game.islands.length < 1) {
            // TODO
            throw new Error('TODO: the game ends in a draw');
        }

        // advance the rising waters marker
        console.log('Starting rising water loop');
        while (!findIsland(game, game.nextIslandToSink)) {
            game.nextIslandToSink = (game.nextIslandToSink % 16) + 1;
        }

        // swap the initiative
        game.initiative = otherPlayerDesignator(game.initiative);

        // players draw new cards
        mapToValues(game.players).forEach((player) => {
            PlayerOperations.draw(player, 3);
        });

        // update the active card index
        game.activeCardIndex = null;

        // update the new game state
        game.gameState = GameState.AWAIT_CARD_PLACEMENT;
    };

    /**
     * Resolves the next card.
     *
     * - If the card requires a user action, this function leaves the game in
     *   the proper awaiting state.
     * - If the card requires no action, this function resolves the card and
     *   then calls itself again.
     * - If there are no more cards to resolve, this function leaves the game
     *   in the waiting for card placement state.
     */
    const resolveNextCard = (game: GameSerialized) => {
        // in card placement step, there is nothing to resolve
        if (game.activeCardIndex === null) {
            return;
        }

        if (game.activeCardIndex > 5) {
            endRound(game);
        }

        // find the next card that needs to resolve
        const nextCardToResolve =
            game.actionOrderTrack.cardSlots[game.activeCardIndex];

        // if there is no card to resolve (because of fog), advance to the next
        // card
        if (nextCardToResolve === null) {
            console.log(
                'The card in slot',
                game.activeCardIndex + 1,
                'was fogged.',
            );
            game.activeCardIndex += 1;
            resolveNextCard(game);
            return;
        }

        // resolve next card
        switch (nextCardToResolve.cardType) {
            case CardType.CRAB:
                // TODO
                throw new Error('resolve crab');
            case CardType.FLYING_FISH:
                game.gameState = GameState.AWAIT_FLYING_FISH_MOVEMENT;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.FOG:
                // TODO
                throw new Error('resolve fog');
            case CardType.HARPOON:
                // TODO
                throw new Error('resolve harpoon');
            case CardType.INDISCRETION:
                // TODO
                throw new Error('resolve indiscretion');
            case CardType.MEDITATION:
                // TODO
                throw new Error('resolve meditatino');
            case CardType.MOVEMENT:
                // TODO
                throw new Error('resolve movement');
            case CardType.NET:
                // TODO
                throw new Error('resolve net');
            case CardType.PILINGS:
                // TODO
                throw new Error('resolve pilings');
            case CardType.PRAYER:
                // TODO
                throw new Error('resolve prayer');
            case CardType.TIDAL_SURGE:
                // TODO
                throw new Error('resolve tidal surge');
            case CardType.TIDAL_WAVE:
                // TODO
                throw new Error('resolve tidal wave');
            case CardType.TORTOISE:
                // TODO
                throw new Error('resolve tortoise');
            case CardType.VOLCANIC_ERUPTION:
                // TODO
                throw new Error('resolve volcano');
            case CardType.WEAKNESS:
                // TODO
                throw new Error('resolve weakness');
            case null:
                // TODO handle somehow null card
                break;
            default:
                assertUnreachable(nextCardToResolve);
        }
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

        // if all players have joined, start the game
        if (
            game.players[PlayerDesignator.PLAYER_A].username !== null &&
            game.players[PlayerDesignator.PLAYER_B].username !== null
        ) {
            // advance the game to the card placement step
            game.gameState = GameState.AWAIT_CARD_PLACEMENT;

            // set the active player
            game.waitingForPlayer = game.initiative;
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
     * Attempts to take the given action on the given game.
     *
     * The game must be in the proper state and the player must be allowed to
     * take the action.
     */
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

        // take the action on the game
        switch (gameAction.action) {
            case GameActionType.CARD_PLACEMENT:
                checkGameStateAndPlayer(GameState.AWAIT_CARD_PLACEMENT);
                handleCardPlacement(game, playerDesignator, gameAction.data);
                break;
            case GameActionType.FLYING_FISH_MOVEMENT:
                checkGameStateAndPlayer(GameState.AWAIT_FLYING_FISH_MOVEMENT);
                handleFlyingFish(game, playerDesignator, gameAction.data);
                break;
            case GameActionType.FOG_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_FOG_TARGET);
                handleFog(game, gameAction.data);
                break;
            case GameActionType.HARPOON_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_HARPOON_TARGET);
                handleHarpoon(game, playerDesignator, gameAction.data);
                break;
            case GameActionType.MOVEMENT_SET:
                checkGameStateAndPlayer(GameState.AWAIT_MOVEMENT_SET);
                handleMovement(game, playerDesignator, gameAction.data);
                break;
            case GameActionType.NET_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_NET_TARGET);
                handleNet(game, playerDesignator, gameAction.data);
                break;
            case GameActionType.PILINGS_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_PILINGS_TARGET);
                handlePilings(game, playerDesignator, gameAction.data);
                break;
            case GameActionType.TIDAL_SURGE_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_TIDAL_SURGE_TARGET);
                handleTidalSurge(game, gameAction.data);
                break;
            case GameActionType.TIDAL_WAVE_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_TIDAL_WAVE_TARGET);
                handleTidalWave(game, gameAction.data);
                break;
            case GameActionType.TORTOISE_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_TORTOISE_TARGET);
                handleTortoise(game, playerDesignator, gameAction.data);
                break;
            case GameActionType.VOLCANIC_ERUPTION_TARGET:
                checkGameStateAndPlayer(
                    GameState.AWAIT_VOLCANIC_ERUPTION_TARGET,
                );
                handleVolcanicEruption(game, playerDesignator, gameAction.data);
                break;
            default:
                assertUnreachable(gameAction);
        }

        // if cards were not being placed, then a card is resolving
        if (gameAction.action !== GameActionType.CARD_PLACEMENT) {
            if (game.activeCardIndex === null) {
                throw new Error(
                    'Active card index was null while a card was resolving.',
                );
            }

            const card = game.actionOrderTrack.cardSlots[game.activeCardIndex];
            if (!card || card.cardType === null) {
                throw new Error(
                    'Face-down card or no card in active card slot.',
                );
            }

            // move the card to the appropriate zone
            ActionOrderTrackOperations.resetSlot(
                game.actionOrderTrack,
                game.activeCardIndex,
            );
            if (
                card.cardType === CardType.PILINGS ||
                card.cardType === CardType.NET ||
                card.cardType === CardType.TORTOISE
            ) {
                PlayerOperations.setAside(
                    game.players[card.playerDesignator],
                    card,
                );
            } else {
                PlayerOperations.discardCard(
                    game.players[card.playerDesignator],
                    card,
                );
            }

            // advance the active card index
            game.activeCardIndex += 1;

            // execute the next card
            resolveNextCard(game);

            return;
        }
        // otherwise, cards were being placed

        // if not all cards have been placed, wait for the next player to place
        // their cards
        if (
            game.actionOrderTrack.cardSlots.some((slot) => {
                return slot === null;
            })
        ) {
            game.waitingForPlayer = otherPlayerDesignator(
                game.waitingForPlayer,
            );
        } else {
            // all cards have been placed, so advance the game to the next step
            game.activeCardIndex = 0;
        }

        // execute the next card
        resolveNextCard(game);
    };
}
