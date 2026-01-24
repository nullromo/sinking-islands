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

interface LoggedInUserContextProviderProps
    extends React.PropsWithChildren,
        InjectedServerCallsProps {
    //
}

export const LoggedInUserContextProvider = withServerCalls(
    (props: LoggedInUserContextProviderProps) => {
        // keep track of the logged in user
        const [loggedInUser, setLoggedInUser] = React.useState<string | null>(
            null,
        );

        // on mount, try to see if the user is logged in and update the state
        React.useEffect(() => {
            props.serverCalls
                .whoAmI()
                .then((response) => {
                    setLoggedInUser(response.username);
                })
                .catch((error: unknown) => {
                    console.error(error);
                    setLoggedInUser(null);
                });
        }, []);

        // provide the state value
        const value = React.useMemo(() => {
            return { loggedInUser, setLoggedInUser };
        }, [loggedInUser]);

        return (
            <LoggedInUserContext value={value}>
                {props.children}
            </LoggedInUserContext>
        );
    },
    'LoggedInUserContextProvider',
);

interface LogInGuardProps extends React.PropsWithChildren {
    readonly alternativeChildren: React.ReactNode;
}

export const LogInGuard = (props: LogInGuardProps) => {
    const loggedInUserContext = React.useContext(LoggedInUserContext);
    return (
        <>
            {loggedInUserContext.loggedInUser === null
                ? props.alternativeChildren
                : props.children}
        </>
    );
};
