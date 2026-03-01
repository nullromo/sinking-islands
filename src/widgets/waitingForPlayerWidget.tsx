import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import { GameContext } from '../gameContext';
import { GameInfo } from '../gameInfo';
import { Hand } from '../hand';
import { MessageLog } from '../messageLog';
import { GameLayout, RightSidePanelLayout } from './gameLayoutContainers';

export const WaitingForPlayerWidget = () => {
    const gameContext = React.use(GameContext);

    return (
        <GameLayout>
            <Board />
            <RightSidePanelLayout>
                <GameInfo />
                <MessageLog gameState={gameContext.game} />
                <ActionOrderTrack />
                <Hand />
                Waiting for opponent
            </RightSidePanelLayout>
        </GameLayout>
    );
};
