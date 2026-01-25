import * as React from 'react';
import { LoggedInUserContext } from './loggedInUserContext';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

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
            {(loggedInUserContext.loggedInUser as unknown) === undefined ||
            loggedInUserContext.loggedInUser === null
                ? props.alternativeChildren
                : props.children}
        </>
    );
}, 'LogInGuard');
