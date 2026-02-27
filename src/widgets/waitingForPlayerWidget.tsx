import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import { GameContext } from '../gameContext';
import { Hand } from '../hand';
import { HandAndDeckInfo } from '../handAndDeckInfo';
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
                }}
            >
                <HandAndDeckInfo />
                <MessageLog gameState={gameContext.game} />
                <ActionOrderTrack />
                <Hand />
                Waiting for opponent
            </div>
        </>
    );
};
