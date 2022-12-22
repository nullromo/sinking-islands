import _ from 'lodash';
import React from 'react';
import type { PlayerDesignator } from '../commonTypes';
import type { MovementSet } from '../server/player';
import { NormalMovementSelector } from './normalMovementSelector';

interface MovementSetWidgetProps {
    submit: (movementSet: MovementSet) => void;
    you: PlayerDesignator;
}

export const MovementSetWidget = (props: MovementSetWidgetProps) => {
    const [numberOfMovements, setNumberOfMovements] = React.useState(1);
    const [movementSet, setMovementSet] = React.useState<MovementSet>([
        {
            character: {
                playerDesignator: props.you,
                strength: 20,
                tortoise: false,
            },
            fromIslandNumber: 1,
            toIslandNumber: 1,
        },
        {
            character: {
                playerDesignator: props.you,
                strength: 20,
                tortoise: false,
            },
            fromIslandNumber: 1,
            toIslandNumber: 1,
        },
        {
            character: {
                playerDesignator: props.you,
                strength: 20,
                tortoise: false,
            },
            fromIslandNumber: 1,
            toIslandNumber: 1,
        },
    ]);

    return (
        <>
            <select
                value={numberOfMovements}
                onChange={(event) => {
                    setNumberOfMovements(Number(event.target.value));
                }}
            >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
            </select>
            {[...Array(numberOfMovements).keys()].map((index) => {
                return (
                    <NormalMovementSelector
                        key={index}
                        character={movementSet[index].character}
                        fromIsland={movementSet[index].fromIslandNumber}
                        setCharacter={(character) => {
                            const newMovementSet = _.cloneDeep(movementSet);
                            newMovementSet[index].character = character;
                            setMovementSet(newMovementSet);
                        }}
                        setFromIsland={(islandNumber) => {
                            const newMovementSet = _.cloneDeep(movementSet);
                            newMovementSet[index].fromIslandNumber =
                                islandNumber;
                            setMovementSet(newMovementSet);
                        }}
                        setToIsland={(islandNumber) => {
                            const newMovementSet = _.cloneDeep(movementSet);
                            newMovementSet[index].toIslandNumber = islandNumber;
                            setMovementSet(newMovementSet);
                        }}
                        toIsland={movementSet[index].toIslandNumber}
                    />
                );
            })}
            <button
                type='button'
                onClick={() => {
                    props.submit(movementSet.slice(0, numberOfMovements));
                }}
            >
                Submit
            </button>
        </>
    );
};
