import _ from 'lodash';
import * as React from 'react';
import { withServerCalls } from '../../../communication/withServerCalls';
import { CoordinatesContext } from '../../../contexts/coordinatesContext';
import { GameContext } from '../../../contexts/gameContext';
import { MousePositionContext } from '../../../contexts/mousePositionContext';
import { PlayerDesignator, type MovementSet } from '../../../info/commonTypes';
import { computeMovementSteps } from '../../../info/computeMovementSteps';
import { convertMovementToIslands } from '../../../info/convertActionData';
import { GameActionType } from '../../../info/gameActionTypes';
import { buildCharacterElementID } from '../../../tutorial/elementIDs';
import type { LayoutProps } from './gameLayoutContainers';
import { GamePageLayout } from './gameLayoutContainers';

const Arrow = () => {
    const coordinatesContext = React.use(CoordinatesContext);

    const characterBox = coordinatesContext.getCoordinates(
        buildCharacterElementID(10, PlayerDesignator.PLAYER_A, 0),
    );
    const { mousePosition } = React.use(MousePositionContext);

    return (
        <div
            style={{
                left: characterBox.left,
                position: 'fixed',
                top: characterBox.top,
                zIndex: 1000,
            }}
        >
            <svg>
                <path
                    d={`M 0 0 L ${mousePosition.x - characterBox.left} ${mousePosition.y - characterBox.top}`}
                    style={{ fill: 'none', stroke: 'red', strokeWidth: 3 }}
                />
            </svg>
        </div>
    );
};

export const MovementSetLayout = withServerCalls((props: LayoutProps) => {
    const gameContext = React.use(GameContext);

    const [movementSet, setMovementSet] = React.useState<MovementSet>([]);

    return (
        <GamePageLayout
            boardProps={{
                onCharacterClicked: (island, character) => {
                    if (character.playerDesignator !== gameContext.you) {
                        return;
                    }
                    const newMovement = {
                        character,
                        fromIslandNumber: island.islandNumber,
                        toIslandNumber: island.islandNumber,
                    };
                    if (movementSet.length <= 0) {
                        setMovementSet([newMovement]);
                    } else if (
                        movementSet[movementSet.length - 1].fromIslandNumber ===
                        movementSet[movementSet.length - 1].toIslandNumber
                    ) {
                        setMovementSet([
                            ...movementSet.slice(0, movementSet.length - 2),
                            newMovement,
                        ]);
                    } else {
                        setMovementSet([...movementSet, newMovement]);
                    }
                },
                onIslandClicked: (island) => {
                    if (
                        movementSet.length > 0 &&
                        movementSet[movementSet.length - 1].fromIslandNumber ===
                            movementSet[movementSet.length - 1].toIslandNumber
                    ) {
                        setMovementSet((oldSet) => {
                            const newSet = _.cloneDeep(oldSet);
                            newSet[newSet.length - 1].toIslandNumber =
                                island.islandNumber;
                            return newSet;
                        });
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
            <div
                style={{
                    fontFamily: 'consolas',
                    height: '200px',
                    width: '600px',
                }}
            >
                {JSON.stringify(movementSet, null, 4)}
            </div>
            <Arrow />
        </GamePageLayout>
    );
}, 'MovementSetLayout');
