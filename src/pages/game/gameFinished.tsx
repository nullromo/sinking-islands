import * as React from 'react';
import { GameContext } from '../../contexts/gameContext';
import { OutOfGamePage } from './outOfGamePage';

export const GameFinished = () => {
    const gameContext = React.use(GameContext);

    return (
        <OutOfGamePage
            mainContent={
                <>
                    <p style={{ fontSize: '14pt' }}>The game is over. </p>
                    <p style={{ fontSize: '26pt' }}>
                        {
                            gameContext.game.players[
                                gameContext.game.waitingForPlayer
                            ].username
                        }{' '}
                        wins!
                    </p>
                </>
            }
        />
    );
};
