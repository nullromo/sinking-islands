import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import { GameContext } from '../gameContext';
import { Hand } from '../hand';
import { GameInfo } from '../gameInfo';
import { MessageLog } from '../messageLog';

export const WaitingForPlayerWidget = () => {
    const gameContext = React.use(GameContext);

    return (
        <>
            <Board />
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'flex-start',
                }}
            >
                <div>
                    <GameInfo />
                    <MessageLog gameState={gameContext.game} />
                </div>
                <div>
                    <ActionOrderTrack />
                    <Hand />
                </div>
                Waiting for opponent
            </div>
        </>
    );
};
