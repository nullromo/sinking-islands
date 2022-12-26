import React from 'react';
import { Board } from '../board';
import type { GameSerialized } from '../commonTypes';

interface IslandSelectorWidgetProps {
    submit: (islandNumber: number) => void;
    gameState: GameSerialized;
}

export const IslandSelectorWidget = (props: IslandSelectorWidgetProps) => {
    const [islandChoice, setIslandChoice] = React.useState(1);

    return (
        <>
            <Board
                gameState={props.gameState}
                onCharacterClicked={(island, _) => {
                    setIslandChoice(island.islandNumber);
                }}
                onIslandClicked={(island) => {
                    setIslandChoice(island.islandNumber);
                }}
            />
            <br />
            {`Island: ${islandChoice}`}
            <br />
            <button
                type='button'
                onClick={() => {
                    props.submit(islandChoice);
                }}
            >
                Submit
            </button>
        </>
    );
};
