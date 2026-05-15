import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board/board';
import { GameInfo } from '../gameInfo';
import { MessageLog } from '../messageLog';
import type { GenericWidgetProps } from './gameLayoutContainers';
import {
    GamePageLayoutWrapper,
    RightSidePanelLayout,
} from './gameLayoutContainers';

export const SpectatorLayout = (props: GenericWidgetProps) => {
    return (
        <GamePageLayoutWrapper>
            <Board {...props.boardProps} />
            <RightSidePanelLayout>
                <GameInfo />
                <MessageLog />
                <ActionOrderTrack {...props.actionOrderTrackProps} />
                You are spectating this game.
            </RightSidePanelLayout>
        </GamePageLayoutWrapper>
    );
};
