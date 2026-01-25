import * as React from 'react';
import { GameListWidget } from './gameList';
import { LoggedInUserContext } from './loggedInUserContext';

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
            <h1>Hello {loggedInUserContext.loggedInUser}!</h1>
            <GameListWidget />
        </div>
    );
};
