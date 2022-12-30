import React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import type { GameSerialized } from '../commonTypes';
import { Hand } from '../hand';

interface IslandSelectorWidgetProps {
    gameState: GameSerialized;
    submit: (islandNumber: number) => void;
    title: string;
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
                highlightIslandNumber={islandChoice}
            />
            <ActionOrderTrack gameState={props.gameState} />
            <Hand gameState={props.gameState} />
            <div style={{ width: '600px' }}>
                {`${props.title} Click on an island to select it. Click Submit when ready.`}
            </div>
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
