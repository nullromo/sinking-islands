import _ from 'lodash';
import React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import type { GameSerialized } from '../commonTypes';
import { computeMovementSteps } from '../computeMovementSteps';
import { Hand } from '../hand';
import type { MovementSet } from '../server/player';

interface MovementSetWidgetProps {
    submit: (movementSet: MovementSet) => void;
    gameState: GameSerialized;
}

export const MovementSetWidget = (props: MovementSetWidgetProps) => {
    const [movementSet, setMovementSet] = React.useState<MovementSet>([]);

    return (
        <>
            <Board
                gameState={props.gameState}
                onCharacterClicked={(island, character) => {
                    if (movementSet.length <= 0) {
                        setMovementSet([
                            {
                                character,
                                fromIslandNumber: island.islandNumber,
                                toIslandNumber: 0,
                            },
                        ]);
                    } else if (
                        movementSet[movementSet.length - 1].toIslandNumber === 0
                    ) {
                        setMovementSet([
                            ...movementSet.slice(0, movementSet.length - 2),
                            {
                                character,
                                fromIslandNumber: island.islandNumber,
                                toIslandNumber: 0,
                            },
                        ]);
                    } else {
                        setMovementSet([
                            ...movementSet,
                            {
                                character,
                                fromIslandNumber: island.islandNumber,
                                toIslandNumber: 0,
                            },
                        ]);
                    }
                }}
                onIslandClicked={(island) => {
                    if (
                        movementSet.length > 0 &&
                        movementSet[movementSet.length - 1].toIslandNumber === 0
                    ) {
                        setMovementSet((oldSet) => {
                            const newSet = _.cloneDeep(oldSet);
                            newSet[newSet.length - 1].toIslandNumber =
                                island.islandNumber;
                            return newSet;
                        });
                    }
                }}
            />
            <ActionOrderTrack gameState={props.gameState} />
            <Hand gameState={props.gameState} />
            <div style={{ width: '600px' }}>
                Click on a character, then click on an island to choose where to
                move that character. Click Submit when finished, or click Reset
                to start over.
            </div>
            {'Movement steps used:'}{' '}
            {computeMovementSteps(props.gameState.islands, movementSet)}{' '}
            {'of 3'}
            {movementSet.map((movement, index) => {
                return (
                    // eslint-disable-next-line react/no-array-index-key
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
                        props.submit(movementSet);
                    }}
                >
                    Submit
                </button>
            </div>
        </>
    );
};
