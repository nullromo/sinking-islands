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
import { computeMovementSteps } from '../../computeMovementSteps';
import { createBlankGame } from '../../createBlankGame';
import { GameActionType, type GameAction } from '../../gameActionTypes';
import { GameState } from '../../gameState';
import { mapToValues } from '../../maps';
import { randomUUID } from '../../random';
import { assertUnreachable, shuffleArray } from '../../util';
import type { CardPlacement } from './actionOrderTrack';
import { ActionOrderTrackOperations } from './actionOrderTrackOperations';
import { CardType } from './card';
import { CharacterOperations } from './characterOperations';
import { IslandOperations } from './islandOperations';
import type {
    FlyingFishMovement,
    MovementSet,
    TargetCharacter,
} from './player';
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
    const findIsland = (game: GameSerialized, islandNumber: number) => {
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
     * Resolves as much as possible without input from a user.
     */
    const resolveUntilNextDecision = (game: GameSerialized) => {
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
            resolveUntilNextDecision(game);
            return;
        }

        // resolve next card
        switch (nextCardToResolve.cardType) {
            case CardType.CRAB:
            case CardType.FLYING_FISH:
            case CardType.FOG:
            case CardType.HARPOON:
            case CardType.INDISCRETION:
            case CardType.MEDITATION:
            case CardType.MOVEMENT:
            case CardType.NET:
            case CardType.PILINGS:
            case CardType.PRAYER:
            case CardType.TIDAL_SURGE:
            case CardType.TIDAL_WAVE:
            case CardType.TORTOISE:
            case CardType.VOLCANIC_ERUPTION:
            case CardType.WEAKNESS:
                // TODO resolve cards
                break;
            default:
                assertUnreachable(nextCardToResolve.cardType);
        }
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
                    game.activeCardIndex = 0;
                    resolveUntilNextDecision(game);
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
                // make sure the active card index is a number, which indicates
                // that the game is in the resolution phase rather than the
                // card placement phase
                if (game.activeCardIndex === null) {
                    throw new Error('The game is not ready to advance.');
                }

                // get the card that just resolved
                const card =
                    game.actionOrderTrack.cardSlots[game.activeCardIndex];

                // make sure the card that just resolved exists
                if (!card) {
                    throw new Error('Could not find card to resolve.');
                }

                // find the player that played the card
                const player = game.players[card.playerDesignator];

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
                    PlayerOperations.setAside(player, card);
                } else {
                    PlayerOperations.discardCard(player, card);
                }

                // advance the active card index
                game.activeCardIndex += 1;

                return;
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

        // all checks passed

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

    /**
     * Returns true if the island has a net on it.
     */
    const islandIsNetted = (game: GameSerialized, islandNumber: number) => {
        return (
            islandNumber ===
                game.players[PlayerDesignator.PLAYER_A].netIsland ||
            islandNumber === game.players[PlayerDesignator.PLAYER_B].netIsland
        );
    };

    /**
     * Returns true if the island has pilings on it.
     */
    const islandHasPilings = (game: GameSerialized, islandNumber: number) => {
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
    const islandIsFull = (game: GameSerialized, island: IslandSerialized) => {
        return (
            islandIsNetted(game, island.islandNumber) ||
            (island.smallCapacity &&
                !islandHasPilings(game, island.islandNumber) &&
                island.characters.length > 0)
        );
    };

    const handleFlyingFishMovementAction = (
        game: GameSerialized,
        playerDesignator: PlayerDesignator,
        flyingFishMovement: FlyingFishMovement,
    ) => {
        const player = game.players[playerDesignator];

        // the player must move their own character
        if (
            flyingFishMovement.character.playerDesignator !== playerDesignator
        ) {
            throw new Error("Cannot move a character that isn't yours.");
        }

        // find the island the character is moving to
        const toIsland = findIsland(game, flyingFishMovement.toIslandNumber);

        // can't move to an island that already sank
        if (!toIsland) {
            throw new Error("Cannot move to an island that doesn't exist.");
        }

        // can't move to an island that is at full capacity
        if (islandIsFull(game, toIsland)) {
            throw new Error('Cannot move to an island that is full.');
        }

        // find the island the character is moving from
        const fromIsland = findIsland(
            game,
            flyingFishMovement.fromIslandNumber,
        );

        // can't move a character that is not there
        if (
            !fromIsland ||
            !IslandOperations.findCharacter(
                fromIsland,
                flyingFishMovement.character,
            )
        ) {
            throw new Error("Cannot move a character that isn't there.");
        }

        // all checks passed

        // move the character
        console.log(
            `Player ${
                flyingFishMovement.character.playerDesignator
            }'s ${flyingFishMovement.character.strength}-strength ${
                flyingFishMovement.character.tortoise ? 'tortoise' : 'character'
            } flies from island ${
                flyingFishMovement.fromIslandNumber
            } to island ${flyingFishMovement.toIslandNumber}.`,
        );
        IslandOperations.removeCharacter(
            fromIsland,
            flyingFishMovement.character,
        );
        IslandOperations.addCharacter(toIsland, flyingFishMovement.character);

        // reset tortoise and reclaim card if necessary
        if (flyingFishMovement.character.tortoise) {
            flyingFishMovement.character.tortoise = false;
            PlayerOperations.reclaim(player, CardType.TORTOISE);
        }
    };

    const handleFogTargetAction = (game: GameSerialized, fogTarget: number) => {
        // if there is no card, that card cannot be fogged
        if (game.actionOrderTrack.cardSlots[fogTarget] === null) {
            throw new Error('Cannot fog a card that does not exist');
        }

        // a fog cannot fog itself
        if (game.activeCardIndex === fogTarget) {
            throw new Error('A fog cannot fog itself');
        }

        // all checks passed

        // fog the target
        console.log(`Fogging slot ${fogTarget + 1}.`);
        const foggedCard = ActionOrderTrackOperations.resetSlot(
            game.actionOrderTrack,
            fogTarget,
        );
        if (foggedCard) {
            PlayerOperations.discardCard(
                game.players[foggedCard.playerDesignator],
                foggedCard,
            );
        }
    };

    /**
     * Returns the two islands next to this island in an array. If there are
     * only 2 islands in the game, returns only 1 item. If there is only 1
     * island, returns an empty array.
     */
    const getAdjacentIslands = (game: GameSerialized, islandNumber: number) => {
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

    const handleHarpoonTargetAction = (
        game: GameSerialized,
        playerDesignator: PlayerDesignator,
        harpoonTarget: TargetCharacter,
    ) => {
        // if the target is a tortoise, it's not valid
        if (harpoonTarget.character.tortoise) {
            throw new Error('Cannot harpoon a tortoise.');
        }

        // the player cannot shoot their own characters
        if (playerDesignator === harpoonTarget.character.playerDesignator) {
            throw new Error('Cannot harpoon your own character.');
        }

        // find the island being targeted
        const targetIsland = findIsland(game, harpoonTarget.islandNumber);

        // if the island does not exist, the target is not valid
        if (!targetIsland) {
            throw new Error('Cannot harpoon on an island that does not exist.');
        }

        // if there are no characters matching the target on the target island,
        // then it is not valid
        if (
            !targetIsland.characters.some((character) => {
                return CharacterOperations.equals(
                    character,
                    harpoonTarget.character,
                );
            })
        ) {
            throw new Error('Cannot harpoon a character that does not exist.');
        }

        // find the adjacent islands and make sure there is an enemy of the
        // target in range
        if (
            !getAdjacentIslands(game, harpoonTarget.islandNumber).some(
                (island) => {
                    return island.characters.some((character) => {
                        return character.playerDesignator === playerDesignator;
                    });
                },
            )
        ) {
            throw new Error(
                'Cannot harpoon a character that is out of harpoon range.',
            );
        }

        // all checks passed

        // kill the target
        console.log(
            `Player ${harpoonTarget.character.playerDesignator}'s ${harpoonTarget.character.strength}-strength character on island ${harpoonTarget.islandNumber} is harpooned.`,
        );
        IslandOperations.removeCharacter(targetIsland, harpoonTarget.character);
    };

    const handleMovementAction = (
        game: GameSerialized,
        playerDesignator: PlayerDesignator,
        movementSet: MovementSet,
    ) => {
        // there must be at least one movement
        if (movementSet.length < 1) {
            throw new Error('Must include at least 1 movement.');
        }

        // check all movements
        for (const movement of movementSet) {
            // the player must move their own character
            if (movement.character.playerDesignator !== playerDesignator) {
                throw new Error("Cannot move a character that isn't yours.");
            }

            const toIsland = findIsland(game, movement.toIslandNumber);

            // can't move to an island that already sank
            if (!toIsland) {
                throw new Error("Cannot move to an island that doesn't exist.");
            }

            const fromIsland = findIsland(game, movement.fromIslandNumber);

            // can't move from an island that doesn't exist
            if (!fromIsland) {
                throw new Error(
                    "Cannot move from an island that doesn't exist.",
                );
            }

            // can't move a character that is not there
            if (
                !IslandOperations.findCharacter(fromIsland, movement.character)
            ) {
                throw new Error("Cannot move a character that isn't there.");
            }

            // can't move to a netted island
            if (islandIsNetted(game, movement.toIslandNumber)) {
                throw new Error('Cannot move to a netted island.');
            }

            // can't move off a netted island
            if (islandIsNetted(game, movement.fromIslandNumber)) {
                throw new Error('Cannot move off a netted island.');
            }

            // movements cannot start and end on the same island
            if (movement.fromIslandNumber === movement.toIslandNumber) {
                throw new Error(
                    'Cannot move from an island to the same island.',
                );
            }
        }

        // the positioning of the characters after the movement must be legal
        for (const island of game.islands) {
            // if the island is not a small capacity island or if it has
            // pilings, then there won't be a problem
            if (
                !island.smallCapacity ||
                islandHasPilings(game, island.islandNumber)
            ) {
                continue;
            }

            // find out how many characters were added to the island
            const numberOfCharactersThatLeft = movementSet.reduce(
                (total, movement) => {
                    return (
                        total +
                        (movement.fromIslandNumber === island.islandNumber
                            ? 1
                            : 0)
                    );
                },
                0,
            );

            // find out how many characters were removed from the island
            const numberOfCharactersThatArrived = movementSet.reduce(
                (total, movement) => {
                    return (
                        total +
                        (movement.toIslandNumber === island.islandNumber
                            ? 1
                            : 0)
                    );
                },
                0,
            );

            // determine how many characters will be left on the island
            const numberOfCharactersAfterMovement =
                island.characters.length +
                numberOfCharactersThatArrived -
                numberOfCharactersThatLeft;

            // make sure the number of characters left is legal. We already
            // know it's a small capacity island with no pilings, so the
            // character limit will always be 1 here
            if (numberOfCharactersAfterMovement > 1) {
                throw new Error(
                    'Movement results in too many characters on an island.',
                );
            }
        }

        // each movement must be for a different character
        for (const movement of movementSet) {
            const fromIsland = findIsland(game, movement.fromIslandNumber);

            // can't move from an island that doesn't exist
            if (!fromIsland) {
                throw new Error(
                    "Cannot move from an island that doesn't exist.",
                );
            }
            // find the number of potential characters on the from island that
            // this movement could refer to
            const numberOfMatchingCharacters = fromIsland.characters.filter(
                (character) => {
                    return CharacterOperations.equals(
                        character,
                        movement.character,
                    );
                },
            ).length;

            // find the number of movements in the movement set that refer to
            // this type of character on this from island
            const numberOfMovesUsingThisTypeOfCharacter = movementSet.filter(
                (otherMovement) => {
                    return (
                        CharacterOperations.equals(
                            otherMovement.character,
                            movement.character,
                        ) &&
                        otherMovement.fromIslandNumber ===
                            movement.fromIslandNumber
                    );
                },
            ).length;

            // if there are not enough of the type of character in question on
            // the from island in question, then at least two of the movements
            // in the movement set are trying to refer to the same character
            if (
                numberOfMovesUsingThisTypeOfCharacter >
                numberOfMatchingCharacters
            ) {
                throw new Error(
                    'Two movements tried to move the same character.',
                );
            }
        }

        // the total movement must be at least 1 and no more than 3
        const totalMovement = computeMovementSteps(game.islands, movementSet);
        if (totalMovement < 1 || totalMovement > 3) {
            throw new Error('Too many or not enough movement points spent.');
        }

        // all checks passed

        // make the moves
        movementSet.forEach((movement) => {
            console.log(
                `Player ${playerDesignator} moves their ${
                    movement.character.strength
                }-strength ${
                    movement.character.tortoise ? 'tortoise' : 'character'
                } from island ${movement.fromIslandNumber} to island ${
                    movement.toIslandNumber
                }.`,
            );
            IslandOperations.removeCharacter(
                findIsland(game, movement.fromIslandNumber) as IslandSerialized,
                movement.character,
            );
            // reset tortoise and reclaim card if necessary
            if (movement.character.tortoise) {
                movement.character.tortoise = false;
                PlayerOperations.reclaim(
                    game.players[movement.character.playerDesignator],
                    CardType.TORTOISE,
                );
            }
            IslandOperations.addCharacter(
                findIsland(game, movement.toIslandNumber) as IslandSerialized,
                movement.character,
            );
        });
    };

    const handleNetTargetAction = (
        game: GameSerialized,
        playerDesignator: PlayerDesignator,
        netTarget: number,
    ) => {
        // find the island
        const island = findIsland(game, netTarget);

        // the island must exist
        if (island === undefined) {
            throw new Error('Cannot net an island that does not exist.');
        }

        // all checks passed

        // place the net
        console.log(
            `Player ${playerDesignator} casts a net over island ${netTarget}.`,
        );
        game.players[playerDesignator].netIsland = netTarget;
    };

    const handlePilingsTargetAction = (
        game: GameSerialized,
        playerDesignator: PlayerDesignator,
        pilingsTarget: number,
    ) => {
        // find the island
        const island = findIsland(game, pilingsTarget);

        // the island must exist
        if (island === undefined) {
            throw new Error(
                'Cannot put pilings on an island that does not exist.',
            );
        }

        // the island must have small capacity
        if (!island.smallCapacity) {
            throw new Error('Cannot put pilings on a large capacity island.');
        }

        // the island must not already have pilings on it
        if (
            pilingsTarget ===
            game.players[otherPlayerDesignator(playerDesignator)].pilingsIsland
        ) {
            throw new Error(
                'Cannot put pilings on an island that already has pilings on it.',
            );
        }

        // all checks passed

        // construct the pilings
        console.log(
            `Player ${playerDesignator} constructs pilings on island ${pilingsTarget}.`,
        );
        game.players[playerDesignator].pilingsIsland = pilingsTarget;
    };

    const handleTidalSurgeTargetAction = (
        game: GameSerialized,
        tidalSurgeTarget: number,
    ) => {
        if (
            !getAdjacentIslands(game, game.nextIslandToSink).some((island) => {
                return island.islandNumber === tidalSurgeTarget;
            })
        ) {
            throw new Error('Cannot tidal surge to a non-adjacent island.');
        }

        // all checks passed

        // move the rising waters marker
        console.log(`The tide surges to island ${tidalSurgeTarget}.`);
        game.nextIslandToSink = tidalSurgeTarget;
    };

    const handleTidalWaveTargetAction = (
        game: GameSerialized,
        tidalWaveTarget: number,
    ) => {
        // find the island
        const island = findIsland(game, tidalWaveTarget);

        // the island must exist
        if (!island) {
            throw new Error(
                'Cannot tidal wave to an island that does not exist.',
            );
        }

        // all checks passed

        // move the rising waters marker
        console.log(`A tidal wave moves upon island ${tidalWaveTarget}.`);
        game.nextIslandToSink = tidalWaveTarget;
    };

    const handleTortoiseTargetAction = (
        game: GameSerialized,
        playerDesignator: PlayerDesignator,
        tortoiseTarget: TargetCharacter,
    ) => {
        // the player must target their own character
        if (tortoiseTarget.character.playerDesignator !== playerDesignator) {
            throw new Error("Cannot target a character that isn't yours.");
        }

        // find the island
        const island = findIsland(game, tortoiseTarget.islandNumber);

        // the island must exist
        if (!island) {
            throw new Error(
                'Cannot tortoise on an island that does not exist.',
            );
        }

        // the character must exist
        if (
            !island.characters.some((character) => {
                return CharacterOperations.equals(
                    character,
                    tortoiseTarget.character,
                );
            })
        ) {
            throw new Error('Cannot tortoise a character that does not exist.');
        }

        // all checks passed

        // make the target a tortoise
        console.log(
            `Player ${tortoiseTarget.character.playerDesignator}'s ${tortoiseTarget.character.strength}-strength character on island ${tortoiseTarget.islandNumber} turns into a tortoise.`,
        );
        (
            IslandOperations.findCharacter(
                island,
                tortoiseTarget.character,
            ) as CharacterSerialized
        ).tortoise = true;
    };

    const handleFleeChoiceAction = (
        game: GameSerialized,
        playerDesignator: PlayerDesignator,
        fleeChoice: CharacterSerialized,
    ) => {
        // the game must be in the middle of processing a lava flow
        if (game.lavaFlowIsland === null || game.safeIsland === null) {
            throw new Error('There is no active lava flow.');
        }

        // the player must choose their own character
        if (fleeChoice.playerDesignator !== playerDesignator) {
            throw new Error("Cannot choose a character that isn't yours.");
        }
        if (
            !game.lavaFlowIsland.characters.some((character) => {
                return CharacterOperations.equals(character, fleeChoice);
            })
        ) {
            throw new Error('Cannot choose a character that does not exist.');
        }

        // all checks passed

        // move the character
        console.log(
            `Player ${fleeChoice.playerDesignator}'s ${
                fleeChoice.strength
            }-strength ${
                fleeChoice.tortoise ? 'tortoise' : 'character'
            } flees from the lava flow to island ${game.safeIsland.islandNumber}.`,
        );
        IslandOperations.removeCharacter(game.lavaFlowIsland, fleeChoice);
        IslandOperations.addCharacter(game.safeIsland, fleeChoice);

        // reset tortoise and reclaim card if necessary
        if (fleeChoice.tortoise) {
            fleeChoice.tortoise = false;
            PlayerOperations.reclaim(
                game.players[playerDesignator],
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
                handleCardPlacementAction(
                    game,
                    playerDesignator,
                    gameAction.data,
                );
                break;
            case GameActionType.FLYING_FISH_MOVEMENT:
                checkGameStateAndPlayer(GameState.AWAIT_FLYING_FISH_MOVEMENT);
                handleFlyingFishMovementAction(
                    game,
                    playerDesignator,
                    gameAction.data,
                );
                break;
            case GameActionType.FOG_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_FOG_TARGET);
                handleFogTargetAction(game, gameAction.data);
                break;
            case GameActionType.HARPOON_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_HARPOON_TARGET);
                handleHarpoonTargetAction(
                    game,
                    playerDesignator,
                    gameAction.data,
                );
                break;
            case GameActionType.MOVEMENT_SET:
                checkGameStateAndPlayer(GameState.AWAIT_MOVEMENT_SET);
                handleMovementAction(game, playerDesignator, gameAction.data);
                break;
            case GameActionType.NET_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_NET_TARGET);
                handleNetTargetAction(game, playerDesignator, gameAction.data);
                break;
            case GameActionType.PILINGS_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_PILINGS_TARGET);
                handlePilingsTargetAction(
                    game,
                    playerDesignator,
                    gameAction.data,
                );
                break;
            case GameActionType.TIDAL_SURGE_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_TIDAL_SURGE_TARGET);
                handleTidalSurgeTargetAction(game, gameAction.data);
                break;
            case GameActionType.TIDAL_WAVE_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_TIDAL_WAVE_TARGET);
                handleTidalWaveTargetAction(game, gameAction.data);
                break;
            case GameActionType.TORTOISE_TARGET:
                checkGameStateAndPlayer(GameState.AWAIT_TORTOISE_TARGET);
                handleTortoiseTargetAction(
                    game,
                    playerDesignator,
                    gameAction.data,
                );
                break;
            case GameActionType.FLEE_CHOICE:
                checkGameStateAndPlayer(GameState.AWAIT_FLEE_CHOICE);
                handleFleeChoiceAction(game, playerDesignator, gameAction.data);
                break;
            default:
                assertUnreachable(gameAction);
        }

        // advance the game
        advanceGameState(game);
    };
}
