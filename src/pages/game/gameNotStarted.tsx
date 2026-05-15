import * as React from 'react';
import { GameContext } from '../../contexts/gameContext';
import { OutOfGamePage } from './outOfGamePage';

export const GameNotStarted = () => {
    const gameContext = React.use(GameContext);

    return (
        <OutOfGamePage
            mainContent={
                <>
                    <p style={{ fontSize: '20pt' }}>
                        The game has not started yet. Your game ID is{' '}
                        <code>{gameContext.game.id}</code>
                    </p>
                    <div style={{ fontSize: '14pt' }}>
                        Another player must join this game before the game can
                        begin.
                    </div>
                </>
            }
        />
    );
};
