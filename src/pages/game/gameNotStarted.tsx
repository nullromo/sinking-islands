import * as React from 'react';
import { Link } from 'react-router';
import { GameContext } from '../../contexts/gameContext';
import { PageRoutes } from '../../router/pageRoutes';

export const GameNotStarted = () => {
    const gameContext = React.use(GameContext);

    return (
        <>
            <div
                style={{
                    alignItems: 'center',
                    background: 'lightgray',
                    borderRadius: '20px',
                    boxShadow: '0px 0px 10px 10px black',
                    display: 'flex',
                    flexDirection: 'column',
                    left: '50%',
                    padding: '50px 80px',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    whiteSpace: 'nowrap',
                }}
            >
                <p style={{ fontSize: '20pt' }}>
                    The game has not started yet. Your game ID is{' '}
                    <code>{gameContext.game.id}</code>
                </p>
                <div style={{ fontSize: '14pt' }}>
                    Another player must join this game before the game can
                    begin.
                </div>
            </div>
            <div style={{ left: 20, position: 'fixed', top: 20 }}>
                <Link to={PageRoutes.DASHBOARD}>
                    <button type='button'>Back to Dashboard</button>
                </Link>
            </div>
        </>
    );
};
