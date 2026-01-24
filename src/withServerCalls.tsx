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
    class WithServerCalls extends React.Component<
        Omit<P, keyof InjectedServerCallsProps> & React.PropsWithChildren,
        Record<string, never>
    > {
        public componentWillUnmount() {
            this.serverCalls.abort();
        }

        private readonly serverCalls = new ServerCalls();

        public render() {
            return (
                <WrappedComponent
                    {...(this.props as P)}
                    serverCalls={this.serverCalls}
                />
            );
        }
    }
    return WithServerCalls;
};
