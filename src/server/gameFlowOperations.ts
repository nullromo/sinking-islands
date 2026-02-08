import type { GameSerialized } from '../commonTypes';
import { otherPlayerDesignator, PlayerDesignator } from '../commonTypes';
import type { GameAction } from '../gameActionTypes';
import { GameActionType } from '../gameActionTypes';
import { GameState } from '../gameState';
import { mapToValues } from '../maps';
import { assertUnreachable } from '../util';
import { handleCardPlacement } from './actionHandlers/cardPlacementAction';
import { handleFlyingFish } from './actionHandlers/flyingFishAction';
import { handleFog } from './actionHandlers/fogAction';
import { handleHarpoon } from './actionHandlers/harpoonAction';
import { handleMovement } from './actionHandlers/movementAction';
import { handleNet } from './actionHandlers/netAction';
import { handlePilings } from './actionHandlers/pilingsAction';
import { handleTidalSurge } from './actionHandlers/tidalSurgeAction';
import { handleTidalWave } from './actionHandlers/tidalWaveAction';
import { handleTortoise } from './actionHandlers/tortoiseAction';
import { handleVolcanicEruption } from './actionHandlers/volcanicEruptionAction';
import { ActionOrderTrackOperations } from './gameObjects/actionOrderTrackOperations';
import { CardType } from './gameObjects/card';
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
        while (!GameOperations.findIsland(game, game.nextIslandToSink)) {
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
        console.log('Resolving next card');
        // in card placement step, there is nothing to resolve
        if (game.activeCardIndex === null) {
            console.log('No cards. Nothing to resolve');
            return;
        }

        if (game.activeCardIndex > 5) {
            console.log('Ending the round now');
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

        // for cards that do not require a user action (crab, indiscretion,
        // meditation, prayer, and weakness), the next card should be
        // immediately resolved
        let continueResolving = false;

        // resolve next card
        switch (nextCardToResolve.cardType) {
            case CardType.CRAB:
                continueResolving = true;
                handleCrab(game);
                break;
            case CardType.FLYING_FISH:
                game.gameState = GameState.AWAIT_FLYING_FISH_MOVEMENT;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.FOG:
                game.gameState = GameState.AWAIT_FOG_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.HARPOON:
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
                game.gameState = GameState.AWAIT_MOVEMENT_SET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.NET:
                game.gameState = GameState.AWAIT_NET_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.PILINGS:
                game.gameState = GameState.AWAIT_PILINGS_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.PRAYER:
                continueResolving = true;
                handlePrayer(game);
                break;
            case CardType.TIDAL_SURGE:
                game.gameState = GameState.AWAIT_TIDAL_SURGE_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.TIDAL_WAVE:
                game.gameState = GameState.AWAIT_TIDAL_WAVE_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.TORTOISE:
                game.gameState = GameState.AWAIT_TORTOISE_TARGET;
                game.waitingForPlayer = nextCardToResolve.playerDesignator;
                break;
            case CardType.VOLCANIC_ERUPTION:
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

        console.log(
            'Game is now in state',
            game.gameState,
            'and waiting for',
            game.waitingForPlayer,
        );

        // if no user action was required, then the card action is done
        if (continueResolving) {
            // clean up after resolution
            finishResolvingCard(game);
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
