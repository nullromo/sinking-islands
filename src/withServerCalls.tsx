import * as React from 'react';
import { ServerCalls } from './serverCalls';

export interface InjectedServerCallsProps extends React.PropsWithChildren {
    readonly serverCalls: Omit<ServerCalls, 'abort'>;
}

export const withServerCalls = <P extends InjectedServerCallsProps>(
    WrappedComponent: React.ComponentType<P>,
    displayName: string,
) => {
    WrappedComponent.displayName = displayName;
    const WithServerCalls = (
        props: Omit<P, keyof InjectedServerCallsProps> &
            React.PropsWithChildren,
    ) => {
        const [serverCalls] = React.useState(() => {
            return new ServerCalls();
        });

        React.useEffect(() => {
            return () => {
                serverCalls.abort();
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return <WrappedComponent {...(props as P)} serverCalls={serverCalls} />;
    };
    return WithServerCalls;
};
