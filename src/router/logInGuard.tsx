import { CanceledError } from 'axios';
import * as React from 'react';
import type { InjectedServerCallsProps } from '../communication/withServerCalls';
import { withServerCalls } from '../communication/withServerCalls';
import { LoggedInUserContext } from '../contexts/loggedInUserContext';

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
                if (!(error instanceof CanceledError)) {
                    console.error(error);
                    loggedInUserContext.setLoggedInUser(null);
                }
            });
    }, [loggedInUserContext, props.serverCalls]);

    if (loggedInUserContext.loggedInUser === undefined) {
        return <>Loading...</>;
    }

    if (loggedInUserContext.loggedInUser === null) {
        return <>{props.alternativeChildren}</>;
    }

    return <>{props.children}</>;
}, 'LogInGuard');
