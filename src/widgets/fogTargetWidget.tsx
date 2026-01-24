import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import type { GameSerialized } from '../commonTypes';
import { Hand } from '../hand';

interface FogTargetWidgetProps {
    readonly submit: (fogTarget: number) => void;
    readonly gameState: GameSerialized;
}

export const FogTargetWidget = (props: FogTargetWidgetProps) => {
    const [slotChoice, setSlotChoice] = React.useState(0);

    return (
        <>
            <ActionOrderTrack
                gameState={props.gameState}
                highlightIndex={slotChoice}
                onSlotClicked={(slotIndex) => {
                    setSlotChoice(slotIndex);
                }}
            />
            <Hand gameState={props.gameState} />
            <div style={{ width: '600px' }}>
                Choose a Fog target. Click on a card in the Action Order Track
                to select it. Click Submit when ready.
            </div>
            <button
                type='button'
                onClick={() => {
                    props.submit(slotChoice);
                }}
            >
                Submit
            </button>
        </>
    );
};
