import type { GameSerialized, TargetCharacter } from '../info/commonTypes';
import {
    CardType,
    IndiscretionStatus,
    IslandType,
    PlayerDesignator,
    otherPlayerDesignator,
} from '../info/commonTypes';
import { convertTargetCharacterToIslands } from '../info/convertActionData';
import type { GameAction } from '../info/gameActionTypes';
import { GameActionType } from '../info/gameActionTypes';
import { GameState } from '../info/gameState';
import { mapToValues } from '../util/maps';
import { assertUnreachable, upperSnakeToTitle } from '../util/util';
import { handleCardPlacement } from './actionHandlers/cardPlacementAction';
import { handleFlyingFish } from './actionHandlers/flyingFishAction';
import { handleFog } from './actionHandlers/fogAction';
import {
    checkHarpoonTargetLegal,
    handleHarpoon,
} from './actionHandlers/harpoonAction';
import {
    handleMovement,
    legalMovementExists,
} from './actionHandlers/movementAction';
import { handleNet } from './actionHandlers/netAction';
import { handlePilings } from './actionHandlers/pilingsAction';
import { handleTidalSurge } from './actionHandlers/tidalSurgeAction';
import { handleTidalWave } from './actionHandlers/tidalWaveAction';
import { handleTortoise } from './actionHandlers/tortoiseAction';
import { handleVolcanicEruption } from './actionHandlers/volcanicEruptionAction';
import { ActionOrderTrackOperations } from './gameObjects/actionOrderTrackOperations';
import { GameOperations } from './gameObjects/gameOperations';
import { PlayerOperations } from './gameObjects/playerOperations';
import { handleCrab } from './nonActionHandlers/crab';
import { handleIndiscretion } from './nonActionHandlers/indiscretion';
import { handleMeditation } from './nonActionHandlers/meditation';
import { handlePrayer } from './nonActionHandlers/prayer';
import { handleWeakness } from './nonActionHandlers/weakness';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GameFlowOperations {
    /**
     * Returns the player that has won the game, or undefined if the game is
     * not over yet.
     */
    const getGameWinner = (game: GameSerialized) => {
        return [PlayerDesignator.PLAYER_A, PlayerDesignator.PLAYER_B].find(
            (player) => {
                return !game.islands.some((island) => {
                    return island.characters.some((character) => {
                        return (
                            character.playerDesignator ===
                            otherPlayerDesignator(player)
                        );
                    });
                });
            },
        );
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
                GameOperations.findIsland(
                    game,
                    game.nextIslandToSink,
                )?.characters.some((character) => {
                    return (
                        character.playerDesignator ===
                            player.playerDesignator && character.tortoise
                    );
                })
            ) {
                PlayerOperations.reclaim(player, CardType.TORTOISE);
            }
        });

        // sink the lowest island
        GameOperations.log(game, `Island ${game.nextIslandToSink} sinks.`);
        game.islands = game.islands.filter((island) => {
            return island.islandNumber !== game.nextIslandToSink;
        });

        // check if a player has won
        const winner = getGameWinner(game);
        if (winner) {
            game.gameState = GameState.FINISHED;
            return;
        }

        // if there are no islands left, then the game is a draw
        if (game.islands.length < 1) {
            // TODO
            throw new Error('TODO: the game ends in a draw');
        }

        // advance the rising waters marker
        GameOperations.log(game, 'Starting rising water loop');
        while (!GameOperations.findIsland(game, game.nextIslandToSink)) {
            game.nextIslandToSink = (game.nextIslandToSink % 16) + 1;
        }

        // swap the initiative
        game.initiative = otherPlayerDesignator(game.initiative);
        game.waitingForPlayer = game.initiative;

        // players draw new cards
        mapToValues(game.players).forEach((player) => {
            PlayerOperations.draw(game, player, 3);
        });

        // remove indiscretion's effect from the players if they have already
        // played face up
        [PlayerDesignator.PLAYER_A, PlayerDesignator.PLAYER_B].forEach(
            (playerDesignator) => {
                if (
                    game.players[playerDesignator].indiscretion ===
                    IndiscretionStatus.PLAYED
                ) {
                    game.players[playerDesignator].indiscretion =
                        IndiscretionStatus.NONE;
                }
            },
        );

        // update the active card index
        game.activeCardIndex = null;

        // update the new game state
        game.gameState = GameState.AWAIT_CARD_PLACEMENT;

        // increment rounds counter
        game.roundsCompleted += 1;
        GameOperations.log(game, `Game ${game.id} beginning next round.`);
    };

    /**
     * Finalizes the card resolution by moving cards around and updating
     * related housekeeping.
     */
    const finishResolvingCard = (game: GameSerialized) => {
        if (game.activeCardIndex === null) {
            throw new Error('Null active card index');
        }
        const card = GameOperations.getCurrentlyResolvingCard(game);

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

        // check if the game is over
        const winner = getGameWinner(game);
        if (winner) {
            game.gameState = GameState.FINISHED;
        }
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
            GameOperations.log(game, 'No cards. Nothing to resolve.');
            return;
        }

        if (game.activeCardIndex > 5) {
            GameOperations.log(game, 'Ending the round.');
            endRound(game);
            return;
        }

        // find the next card that needs to resolve
        const nextCardToResolve =
            game.actionOrderTrack.cardSlots[game.activeCardIndex];

        // if there is no card to resolve (because of fog), advance to the next
        // card
        if (nextCardToResolve === null) {
            GameOperations.log(
                game,
                `The card in slot ${game.activeCardIndex + 1} was fogged.`,
            );
            game.activeCardIndex += 1;
            resolveNextCard(game);
            return;
        }

        if (nextCardToResolve.cardType !== null) {
            GameOperations.log(
                game,
                `Executing slot ${game.activeCardIndex + 1}: ${
                    nextCardToResolve.playerDesignator
                }'s ${upperSnakeToTitle(nextCardToResolve.cardType)}.`,
            );
        }

        // for cards that do not require a user action (crab, indiscretion,
        // meditation, prayer, and weakness), and for any cards that have no
        // choices available, the next card should be immediately resolved
        let continueResolving = false;

        // resolve next card
        switch (nextCardToResolve.cardType) {
            case CardType.CRAB:
                continueResolving = true;
                handleCrab(game);
                break;
            case CardType.FLYING_FISH:
                // if there are no legal islands to move to, the flying
                // fish has no effect. This can only occur if all islands
                // are netted or are at full capacity
                if (
                    !game.islands.some((island) => {
                        return !GameOperations.islandIsFull(game, island);
                    })
                ) {
                    GameOperations.log(
                        game,
                        'There is nowhere for a flying fish to fly.',
                    );
                    continueResolving = true;
                    break;
                }
                // a decision is required
                game.gameState = GameState.AWAIT_FLYING_FISH_MOVEMENT;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.FOG:
                // if the fog has no targets then it has no effect
                if (
                    !game.actionOrderTrack.cardSlots.some(
                        (otherCard, otherSlot) => {
                            return (
                                otherCard !== null &&
                                otherSlot !== game.activeCardIndex
                            );
                        },
                    )
                ) {
                    GameOperations.log(game, 'There is no card to fog.');
                    continueResolving = true;
                    break;
                }
                // a decision is required
                game.gameState = GameState.AWAIT_FOG_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.HARPOON:
                // if there are no legal harpoon targets, then the harpoon
                // has no effect. NOTE: there may be a better way to do
                // this, but brute force here isn't really that much
                // computation
                if (
                    !game.islands
                        .reduce<TargetCharacter[]>((allCharacters, island) => {
                            return [
                                ...allCharacters,
                                ...island.characters.map((character) => {
                                    return {
                                        character,
                                        islandNumber: island.islandNumber,
                                    };
                                }),
                            ];
                        }, [])
                        .some((harpoonTarget) => {
                            try {
                                checkHarpoonTargetLegal(
                                    game,
                                    nextCardToResolve.playerDesignator,
                                    convertTargetCharacterToIslands(
                                        game,
                                        harpoonTarget,
                                    ),
                                );
                                return true;
                            } catch {
                                return false;
                            }
                        })
                ) {
                    GameOperations.log(
                        game,
                        `There are no valid harpoon targets for player ${nextCardToResolve.playerDesignator}.`,
                    );
                    continueResolving = true;
                    break;
                }
                // a decision is required
                game.gameState = GameState.AWAIT_HARPOON_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.INDISCRETION:
                continueResolving = true;
                handleIndiscretion(game);
                break;
            case CardType.MEDITATION:
                continueResolving = true;
                handleMeditation(game);
                break;
            case CardType.MOVEMENT:
                // if there are no valid moves to make, then the movement does
                // nothing
                if (
                    !legalMovementExists(
                        game,
                        nextCardToResolve.playerDesignator,
                    )
                ) {
                    GameOperations.log(
                        game,
                        `No movements are possible for player ${nextCardToResolve.playerDesignator}.`,
                    );
                    continueResolving = true;
                    break;
                }
                // a decision is required
                game.gameState = GameState.AWAIT_MOVEMENT_SET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.NET:
                // if every island is already netted, then it is not possible
                // to cast a net
                if (
                    game.islands.every((island) => {
                        return GameOperations.islandIsNetted(
                            game,
                            island.islandNumber,
                        );
                    })
                ) {
                    GameOperations.log(
                        game,
                        'There are no un-netted islands to net.',
                    );
                    continueResolving = true;
                }
                // a decision is required
                game.gameState = GameState.AWAIT_NET_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.PILINGS:
                // if there are no legal pilings targets, then the card does
                // nothing
                if (
                    !game.islands.some((island) => {
                        return (
                            island.smallCapacity &&
                            island.islandNumber !==
                                game.players[
                                    otherPlayerDesignator(
                                        nextCardToResolve.playerDesignator,
                                    )
                                ].pilingsIsland
                        );
                    })
                ) {
                    GameOperations.log(
                        game,
                        'There are no islands that can support pilings.',
                    );
                    continueResolving = true;
                    break;
                }
                // a decision is required
                game.gameState = GameState.AWAIT_PILINGS_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.PRAYER:
                continueResolving = true;
                handlePrayer(game);
                break;
            case CardType.TIDAL_SURGE:
                // if there are no legal tidal surge targets, then the card
                // does nothing
                if (game.islands.length <= 1) {
                    GameOperations.log(game, 'The tide cannot surge.');
                    continueResolving = true;
                    break;
                }
                // a decision is required
                game.gameState = GameState.AWAIT_TIDAL_SURGE_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.TIDAL_WAVE:
                // a decision is required
                game.gameState = GameState.AWAIT_TIDAL_WAVE_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.TORTOISE:
                // a decision is required
                game.gameState = GameState.AWAIT_TORTOISE_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.VOLCANIC_ERUPTION:
                // if there are no volcanoes, the card does nothing
                if (
                    !game.islands.some((island) => {
                        return island.islandType === IslandType.VOLCANO;
                    })
                ) {
                    GameOperations.log(game, 'There are no volcanoes left.');
                    continueResolving = true;
                    break;
                }
                // a decision is required
                game.gameState = GameState.AWAIT_VOLCANIC_ERUPTION_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.WEAKNESS:
                continueResolving = true;
                handleWeakness(game);
                break;
            case null:
                // TODO handle somehow null card
                break;
            default:
                assertUnreachable(nextCardToResolve);
        }

        GameOperations.log(
            game,
            `Game is now in state ${game.gameState} and waiting for ${game.waitingForPlayer}`,
        );

        // if no user action was required, then the card action is done
        if (continueResolving) {
            // clean up after resolution
            finishResolvingCard(game);

            // exit if the game is over
            if (game.gameState === GameState.FINISHED) {
                return;
            }

            // continue to the next card
            resolveNextCard(game);
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
            // clean up after card resolution
            finishResolvingCard(game);

            // exit if the game is over
            if (game.gameState === GameState.FINISHED) {
                return;
            }

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
