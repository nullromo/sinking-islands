import * as React from 'react';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

type LoggedInUserContextData = {
    loggedInUser: string | null;
    setLoggedInUser: React.Dispatch<React.SetStateAction<string | null>>;
};

export const LoggedInUserContext = React.createContext<LoggedInUserContextData>(
    {
        loggedInUser: null,
        setLoggedInUser: () => {
            throw new Error('Unmounted context');
        },
    },
);
LoggedInUserContext.displayName = 'LoggedInUserContext';

export const LoggedInUserContextProvider = (props: React.PropsWithChildren) => {
    // keep track of the logged in user
    const [loggedInUser, setLoggedInUser] = React.useState<string | null>(null);

    // provide the state value
    const value = React.useMemo(() => {
        return { loggedInUser, setLoggedInUser };
    }, [loggedInUser]);

    return (
        <LoggedInUserContext value={value}>
            {props.children}
        </LoggedInUserContext>
    );
};
