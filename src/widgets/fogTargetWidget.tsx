import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import { GameActionType } from '../gameActionTypes';
import { GameContext } from '../gameContext';
import { GameInfo } from '../gameInfo';
import { Hand } from '../hand';
import { MessageLog } from '../messageLog';
import type { SetResultProps } from '../useResultMessage';
import type { InjectedServerCallsProps } from '../withServerCalls';
import { withServerCalls } from '../withServerCalls';
import { GameLayout, RightSidePanelLayout } from './gameLayoutContainers';

interface FogTargetWidgetProps
    extends InjectedServerCallsProps, SetResultProps {
    //
}

export const FogTargetWidget = withServerCalls(
    (props: FogTargetWidgetProps) => {
        const gameContext = React.use(GameContext);

        const [slotChoice, setSlotChoice] = React.useState(0);

        return (
            <GameLayout>
                <Board />
                <RightSidePanelLayout>
                    <GameInfo />
                    <MessageLog gameState={gameContext.game} />
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
                </RightSidePanelLayout>
            </GameLayout>
        );
    },
    'FogTargetWidget',
);
