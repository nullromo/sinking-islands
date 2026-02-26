import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { GameActionType } from '../gameActionTypes';
import { GameContext } from '../gameContext';
import { Hand } from '../hand';
import type { SetResultProps } from '../useResultMessage';
import type { InjectedServerCallsProps } from '../withServerCalls';
import { withServerCalls } from '../withServerCalls';

interface FogTargetWidgetProps
    extends InjectedServerCallsProps, SetResultProps {
    //
}

export const FogTargetWidget = withServerCalls(
    (props: FogTargetWidgetProps) => {
        const gameContext = React.use(GameContext);

        const [slotChoice, setSlotChoice] = React.useState(0);

        return (
            <div>
                <ActionOrderTrack
                    highlightIndex={slotChoice}
                    onSlotClicked={(slotIndex) => {
                        setSlotChoice(slotIndex);
                    }}
                />
                <Hand />
                <div style={{ width: '600px' }}>
                    Choose a Fog target. Click on a card in the Action Order
                    Track to select it. Click Submit when ready.
                </div>
                <button
                    type='button'
                    onClick={() => {
                        props.serverCalls
                            .takeGameAction(gameContext.game.id, {
                                action: GameActionType.FOG_TARGET,
                                data: slotChoice,
                            })
                            .catch((error: unknown) => {
                                props.setResult(false, error);
                            });
                    }}
                >
                    Submit
                </button>
            </div>
        );
    },
    'FogTargetWidget',
);
