import * as React from 'react';
import { createPortal } from 'react-dom';
import { withServerCalls } from '../../../communication/withServerCalls';
import { CoordinatesContext } from '../../../contexts/coordinatesContext';
import { GameContext } from '../../../contexts/gameContext';
import { MousePositionContext } from '../../../contexts/mousePositionContext';
import type {
    CharacterSerialized,
    IslandSerialized,
    MovementSet,
} from '../../../info/commonTypes';
import { computeMovementSteps } from '../../../info/computeMovementSteps';
import { convertMovementToIslands } from '../../../info/convertActionData';
import { GameActionType } from '../../../info/gameActionTypes';
import {
    boardElementID,
    buildCharacterElementID,
    buildIslandElementID,
} from '../../../tutorial/elementIDs';
import type { LayoutProps } from './gameLayoutContainers';
import { GamePageLayout } from './gameLayoutContainers';

const Arrow = (props: {
    characterElementID: string;
    islandElementID: string | null;
}) => {
    const coordinatesContext = React.use(CoordinatesContext);
    const { mousePosition } = React.use(MousePositionContext);

    const characterBox = coordinatesContext.getCoordinates(
        props.characterElementID,
    );
    const boardBox = coordinatesContext.getCoordinates(boardElementID);
    const islandBox =
        props.islandElementID === null
            ? null
            : coordinatesContext.getCoordinates(props.islandElementID);

    return createPortal(
        <div
            style={{
                left: 0,
                pointerEvents: 'none',
                position: 'fixed',
                top: 0,
                zIndex: 1000,
            }}
        >
            <svg style={{ height: '100vw', width: '100vw' }}>
                <defs>
                    <marker
                        id='head'
                        markerHeight='10'
                        markerWidth='5'
                        orient='auto'
                        refX='4'
                        refY='5'
                    >
                        <path
                            d='M 1 1 L 5 5 L 1 9 L 0 8 L 3 5 L 0 2 Z'
                            fill='magenta'
                        />
                    </marker>
                </defs>
                <path
                    d={`M ${characterBox.x + characterBox.width / 2} ${characterBox.y + characterBox.height / 2} S ${boardBox.x + boardBox.width / 2} ${boardBox.y + boardBox.height / 2} ${islandBox ? islandBox.x + islandBox.width / 2 : mousePosition.x} ${islandBox ? islandBox.y + islandBox.height / 2 : mousePosition.y}`}
                    markerEnd='url(#head)'
                    style={{ fill: 'none', stroke: 'magenta', strokeWidth: 3 }}
                />
            </svg>
            <svg>
                <path
                    d='M 0 0 80 100 120'
                    fill='none'
                    id='arrow-line'
                    stroke='black'
                    strokeWidth='4'
                />
            </svg>
        </div>,
        document.body,
    );
};

export const MovementSetLayout = withServerCalls((props: LayoutProps) => {
    const gameContext = React.use(GameContext);

    const [movementSet, setMovementSet] = React.useState<MovementSet>([]);

    const [activeCharacter, setActiveCharacter] = React.useState<{
        character: CharacterSerialized;
        fromIsland: IslandSerialized;
        playerIndex: number;
    } | null>(null);

    return (
        <GamePageLayout
            boardProps={{
                onCharacterClicked: (island, character, playerIndex) => {
                    if (character.playerDesignator !== gameContext.you) {
                        return;
                    }

                    setActiveCharacter({
                        character,
                        fromIsland: island,
                        playerIndex,
                    });
                },
                onIslandClicked: (island) => {
                    if (activeCharacter !== null) {
                        setMovementSet((previous) => {
                            return [
                                ...previous,
                                {
                                    character: activeCharacter.character,
                                    fromIslandNumber:
                                        activeCharacter.fromIsland.islandNumber,
                                    toIslandNumber: island.islandNumber,
                                },
                            ];
                        });
                        setActiveCharacter(null);
                    }
                },
            }}
        >
            <div style={{ width: '600px' }}>
                Click on a character, then click on an island to choose where to
                move that character. Click Submit when finished, or click Reset
                to start over.
            </div>
            {'Movement steps used:'}{' '}
            {computeMovementSteps(
                gameContext.game.islands,
                movementSet.map((movement) => {
                    return convertMovementToIslands(gameContext.game, movement);
                }),
            )}{' '}
            {'of 3'}
            {movementSet.map((movement, index) => {
                return (
                    <React.Fragment key={index}>
                        <br />
                        {`Character: ${
                            movement.character.tortoise ? '🐢' : '🧍'
                        }${movement.character.strength}`}
                        <br />
                        {`from ${movement.fromIslandNumber}`}
                        <br />
                        {`to ${
                            movement.toIslandNumber === 0
                                ? '?'
                                : movement.toIslandNumber
                        }`}
                        <br />
                    </React.Fragment>
                );
            })}
            <div>
                <button
                    type='button'
                    onClick={() => {
                        setMovementSet([]);
                    }}
                >
                    Reset
                </button>
                <button
                    type='button'
                    onClick={() => {
                        props.serverCalls
                            .takeGameAction(gameContext.game.id, {
                                action: GameActionType.MOVEMENT_SET,
                                data: movementSet,
                            })
                            .catch((error: unknown) => {
                                props.setResult(false, error);
                            });
                    }}
                >
                    Submit
                </button>
            </div>
            {activeCharacter === null ? null : (
                <Arrow
                    characterElementID={buildCharacterElementID(
                        activeCharacter.fromIsland.islandNumber,
                        activeCharacter.character.playerDesignator,
                        activeCharacter.playerIndex,
                    )}
                    islandElementID={null}
                />
            )}
            {movementSet.map((movement, index) => {
                return (
                    <Arrow
                        key={index}
                        characterElementID={buildCharacterElementID(
                            movement.fromIslandNumber,
                            movement.character.playerDesignator,
                            0,
                        )}
                        islandElementID={buildIslandElementID(
                            movement.toIslandNumber,
                        )}
                    />
                );
            })}
        </GamePageLayout>
    );
}, 'MovementSetLayout');
