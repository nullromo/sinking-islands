import React from 'react';
import { BoxWidget } from './boxWidget';
import { useResultMessage } from './useResultMessage';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';
import { Link } from 'react-router';
import { PageRoutes } from './pageRoutes';

interface LogInOrCreateAccountWidgetProps extends InjectedServerCallsProps {
    widgetType: 'createAccount' | 'logIn';
}

export const LogInOrCreateAccountWidget = withServerCalls(
    (props: LogInOrCreateAccountWidgetProps) => {
        const [username, setUsername] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [result, setResult] = useResultMessage();

        const inputBoxes = (
            <>
                <label>
                    {'Username: '}
                    <input
                        type='text'
                        value={username}
                        onChange={(event) => {
                            setUsername(event.target.value);
                        }}
                    />
                </label>
                <label>
                    {'Password: '}
                    <input
                        type='text'
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                        }}
                    />
                </label>
            </>
        );

        return (
            <BoxWidget
                title={
                    props.widgetType === 'logIn' ? 'Log In' : 'Create Account'
                }
            >
                {result.success ? null : inputBoxes}
                {result.success === null ? null : (
                    <div style={{ color: result.success ? 'green' : 'red' }}>
                        {result.message}
                    </div>
                )}
                {result.success ? (
                    <Link to={PageRoutes.TITLE}>
                        <button style={{ width: '100%' }} type='button'>
                            Back
                        </button>
                    </Link>
                ) : (
                    <button
                        type='button'
                        onClick={() => {
                            setResult(null, '');
                            (props.widgetType === 'logIn'
                                ? props.serverCalls.logIn
                                : props.serverCalls.createUser)(
                                username,
                                password,
                            )
                                .then((response) => {
                                    setResult(true, response.message);
                                })
                                .catch((error: unknown) => {
                                    setResult(false, error);
                                });
                        }}
                    >
                        {props.widgetType === 'logIn'
                            ? 'Log In'
                            : 'Create Account'}
                    </button>
                )}
            </BoxWidget>
        );
    },
    'CreateAccountWidget',
);
