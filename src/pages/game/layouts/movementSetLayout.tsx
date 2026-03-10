import * as React from 'react';
import { withServerCalls } from '../../../communication/withServerCalls';
import { GameContext } from '../../../contexts/gameContext';
import type {
    CharacterSerialized,
    IslandSerialized,
    NormalMovement,
} from '../../../info/commonTypes';
import {
    computeMovementSteps,
    countSpacesBetweenIslands,
} from '../../../info/computeMovementSteps';
import { convertMovementToIslands } from '../../../info/convertActionData';
import { GameActionType } from '../../../info/gameActionTypes';
import { GameState } from '../../../info/gameState';
import { checkFlyingFishLegal } from '../../../server/actionHandlers/flyingFishAction';
import { checkMovementSetLegal } from '../../../server/actionHandlers/movementAction';
import { GameOperations } from '../../../server/gameObjects/gameOperations';
import {
    buildCharacterElementID,
    buildIslandElementID,
} from '../../../tutorial/elementIDs';
import { MovementArrow } from '../arrows/movementArrow';
import type { LayoutProps } from './gameLayoutContainers';
import { GamePageLayout } from './gameLayoutContainers';

type IndexedMovement = NormalMovement & { playerIndex: number };
type IndexedMovementSet = IndexedMovement[];

export const MovementSetLayout = withServerCalls((props: LayoutProps) => {
    const gameContext = React.use(GameContext);

    const flyingFish =
        gameContext.game.gameState === GameState.AWAIT_FLYING_FISH_MOVEMENT;

    const [movementSet, setMovementSet] = React.useState<IndexedMovementSet>(
        [],
    );

    const [activeCharacter, setActiveCharacter] = React.useState<{
        character: CharacterSerialized;
        fromIsland: IslandSerialized;
        playerIndex: number;
    } | null>(null);

    const movementStepsUsed = computeMovementSteps(
        gameContext.game.islands,
        movementSet.map((movement) => {
            return convertMovementToIslands(gameContext.game, movement);
        }),
    );

    const movementSetIsLegal = (() => {
        try {
            if (flyingFish) {
                if (movementSet.length !== 1) {
                    return false;
                }
                checkFlyingFishLegal(
                    gameContext.game,
                    gameContext.you,
                    convertMovementToIslands(gameContext.game, movementSet[0]),
                );
            } else {
                checkMovementSetLegal(
                    gameContext.game,
                    gameContext.you,
                    movementSet.map((movement) => {
                        return convertMovementToIslands(
                            gameContext.game,
                            movement,
                        );
                    }),
                );
            }
            return true;
        } catch {
            return false;
        }
    })();

    return (
        <GamePageLayout
            boardProps={{
                highlightCharacter: (islandNumber, character, playerIndex) => {
                    if (activeCharacter === null) {
                        if (flyingFish) {
                            return (
                                character.playerDesignator === gameContext.you
                            );
                        }
                        return (
                            !GameOperations.islandIsNetted(
                                gameContext.game,
                                islandNumber,
                            ) && character.playerDesignator === gameContext.you
                        );
                    }
                    return (
                        islandNumber ===
                            activeCharacter.fromIsland.islandNumber &&
                        character.playerDesignator === gameContext.you &&
                        playerIndex === activeCharacter.playerIndex
                    );
                },
                highlightIsland: (island) => {
                    if (activeCharacter === null) {
                        return false;
                    }
                    if (flyingFish) {
                        return (
                            !island.smallCapacity ||
                            GameOperations.islandHasPilings(
                                gameContext.game,
                                island.islandNumber,
                            ) ||
                            island.characters.length <= 0
                        );
                    }
                    return (
                        countSpacesBetweenIslands(
                            gameContext.game.islands,
                            activeCharacter.fromIsland.islandNumber,
                            island.islandNumber,
                        ) <=
                            3 - movementStepsUsed &&
                        !GameOperations.islandIsFull(gameContext.game, island)
                    );
                },
                onCharacterClicked: (island, character, playerIndex) => {
                    if (character.playerDesignator !== gameContext.you) {
                        return;
                    }

                    setActiveCharacter({
                        character,
                        fromIsland: island,
                        playerIndex,
                    });
                    setMovementSet((previous) => {
                        return previous.filter((movement) => {
                            return (
                                movement.fromIslandNumber !==
                                    island.islandNumber ||
                                movement.playerIndex !== playerIndex
                            );
                        });
                    });
                },
                onIslandClicked: (island) => {
                    if (activeCharacter === null) {
                        return;
                    }
                    if (
                        activeCharacter.fromIsland.islandNumber ===
                        island.islandNumber
                    ) {
                        setActiveCharacter(null);
                        return;
                    }
                    setMovementSet((previous) => {
                        return [
                            ...previous.filter((movement) => {
                                return (
                                    movement.fromIslandNumber !==
                                        activeCharacter.fromIsland
                                            .islandNumber ||
                                    movement.playerIndex !==
                                        activeCharacter.playerIndex
                                );
                            }),
                            {
                                character: activeCharacter.character,
                                fromIslandNumber:
                                    activeCharacter.fromIsland.islandNumber,
                                playerIndex: activeCharacter.playerIndex,
                                toIslandNumber: island.islandNumber,
                            },
                        ];
                    });
                    setActiveCharacter(null);
                },
            }}
        >
            <div style={{ width: '600px' }}>
                Click on a character, then click on an island to choose where to
                move that character.
            </div>
            <br />
            <div style={{ border: '1px solid', padding: '4px', width: '100%' }}>
                Summary
                <ul>
                    {movementSet.length === 0 ? 'No movements' : null}
                    {movementSet.map((movement, index) => {
                        return (
                            <li key={index}>
                                {`Move ${movement.character.strength}-strength ${movement.character.tortoise ? 'tortoise' : 'character'} from island ${movement.fromIslandNumber} to island ${movement.toIslandNumber}`}
                            </li>
                        );
                    })}
                </ul>
                {flyingFish ? null : (
                    <div>
                        {'Movement steps used:'} {movementStepsUsed} {'of 3'}
                    </div>
                )}
            </div>
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ color: movementSetIsLegal ? 'green' : 'red' }}>
                    {'Movement is'} {movementSetIsLegal ? '' : 'not'} {'legal'}
                </div>
                {movementSet.some((movement) => {
                    return movement.character.tortoise;
                }) ? (
                    <div style={{ color: 'red' }}>
                        WARNING: a tortoise that moves stops being a tortoise.
                    </div>
                ) : null}
                <div>
                    <button
                        type='button'
                        onClick={() => {
                            setActiveCharacter(null);
                            setMovementSet([]);
                        }}
                    >
                        Start Over
                    </button>
                    <button
                        disabled={!movementSetIsLegal}
                        type='button'
                        onClick={() => {
                            (flyingFish
                                ? props.serverCalls.takeGameAction(
                                      gameContext.game.id,
                                      {
                                          action: GameActionType.FLYING_FISH_MOVEMENT,
                                          data: movementSet[0],
                                      },
                                  )
                                : props.serverCalls.takeGameAction(
                                      gameContext.game.id,
                                      {
                                          action: GameActionType.MOVEMENT_SET,
                                          data: movementSet.map((movement) => {
                                              return {
                                                  character: movement.character,
                                                  fromIslandNumber:
                                                      movement.fromIslandNumber,
                                                  toIslandNumber:
                                                      movement.toIslandNumber,
                                              };
                                          }),
                                      },
                                  )
                            ).catch((error: unknown) => {
                                props.setResult(false, error);
                            });
                        }}
                    >
                        Submit
                    </button>
                </div>
            </div>
            {activeCharacter === null ? null : (
                <MovementArrow
                    characterElementID={buildCharacterElementID(
                        activeCharacter.fromIsland.islandNumber,
                        activeCharacter.character.playerDesignator,
                        activeCharacter.playerIndex,
                    )}
                    color='magenta'
                    islandElementID={null}
                />
            )}
            {movementSet.map((movement, index) => {
                return (
                    <MovementArrow
                        key={index}
                        characterElementID={buildCharacterElementID(
                            movement.fromIslandNumber,
                            movement.character.playerDesignator,
                            movement.playerIndex,
                        )}
                        color={movementSetIsLegal ? 'limegreen' : 'orange'}
                        islandElementID={buildIslandElementID(
                            movement.toIslandNumber,
                        )}
                    />
                );
            })}
        </GamePageLayout>
    );
}, 'MovementSetLayout');
