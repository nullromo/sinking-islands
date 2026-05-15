import * as React from 'react';
import { withServerCalls } from '../../../communication/withServerCalls';
import { GameContext } from '../../../contexts/gameContext';
import { GameActionType } from '../../../info/gameActionTypes';
import type { LayoutProps } from './gameLayoutContainers';
import { GamePageLayout } from './gameLayoutContainers';

export const FogTargetLayout = withServerCalls((props: LayoutProps) => {
    const gameContext = React.use(GameContext);

    const [slotChoice, setSlotChoice] = React.useState(0);

    return (
        <GamePageLayout
            actionOrderTrackProps={{
                highlightIndex: slotChoice,
                onSlotClicked: (slotIndex) => {
                    setSlotChoice(slotIndex);
                },
            }}
        >
            <div style={{ width: '600px' }}>
                Choose a Fog target. Click on a card in the Action Order Track
                to select it. Click Submit when ready.
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
                        })
                        .finally(() => {
                            setSlotChoice(0);
                        });
                }}
            >
                Submit
            </button>
        </GamePageLayout>
    );
}, 'FogTargetLayout');
