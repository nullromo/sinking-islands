import * as React from 'react';
import { LoggedInUserContext } from '../../contexts/loggedInUserContext';
import { Credits } from '../credits';
import { GameListWidget } from './gameList';
import { TopBanner } from './topBanner';

export const DashboardPage = () => {
    const loggedInUserContext = React.use(LoggedInUserContext);

    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <TopBanner />
            <h1>Hello, {loggedInUserContext.loggedInUser}!</h1>
            <GameListWidget />
            <Credits />
        </div>
    );
};
