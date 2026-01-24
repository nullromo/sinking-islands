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

interface LogInGuardProps
    extends React.PropsWithChildren, InjectedServerCallsProps {
    readonly alternativeChildren: React.ReactNode;
}

export const LogInGuard = withServerCalls((props: LogInGuardProps) => {
    const loggedInUserContext = React.use(LoggedInUserContext);

    // on mount, try to see if the user is logged in and update the state
    React.useEffect(() => {
        props.serverCalls
            .whoAmI()
            .then((response) => {
                loggedInUserContext.setLoggedInUser(response.username);
            })
            .catch((error: unknown) => {
                console.error(error);
                loggedInUserContext.setLoggedInUser(null);
            });
    }, [loggedInUserContext, props.serverCalls]);
    return (
        <>
            {loggedInUserContext.loggedInUser === null
                ? props.alternativeChildren
                : props.children}
        </>
    );
}, 'LogInGuard');
