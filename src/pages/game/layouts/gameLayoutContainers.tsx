import * as React from 'react';
import type { InjectedServerCallsProps } from '../../../communication/withServerCalls';
import type { SetResultProps } from '../../../hooks/useResultMessage';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board/board';
import { GameInfo } from '../gameInfo';
import { Hand } from '../hand';
import { MessageLog } from '../messageLog';

const GamePageLayoutWrapper = (props: React.PropsWithChildren) => {
    return <>{props.children}</>;
};

const RightSidePanelLayout = (props: React.PropsWithChildren) => {
    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'flex-start',
            }}
        >
            {props.children}
        </div>
    );
};

interface GenericWidgetProps extends React.PropsWithChildren {
    readonly boardProps?: React.ComponentProps<typeof Board>;
    readonly actionOrderTrackProps?: React.ComponentProps<
        typeof ActionOrderTrack
    >;
    readonly handProps?: React.ComponentProps<typeof Hand>;
}

export type LayoutProps = InjectedServerCallsProps & SetResultProps;

export const GamePageLayout = (props: GenericWidgetProps) => {
    return (
        <GamePageLayoutWrapper>
            <Board {...props.boardProps} />
            <RightSidePanelLayout>
                <GameInfo />
                <MessageLog />
                <ActionOrderTrack {...props.actionOrderTrackProps} />
                <Hand {...props.handProps} />
                {props.children}
            </RightSidePanelLayout>
        </GamePageLayoutWrapper>
    );
};
