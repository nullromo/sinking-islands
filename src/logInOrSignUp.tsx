import React from 'react';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';
import { useResultMessage } from './useResultMessage';

interface LogInOrSignUpWidgetProps extends InjectedServerCallsProps {
    widgetType: 'logIn' | 'signUp';
}

export const LogInOrSignUpWidget = withServerCalls(
    (props: LogInOrSignUpWidgetProps) => {
        const [username, setUsername] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [result, setResult] = useResultMessage();

        return (
            <div>
                {props.widgetType === 'logIn' ? 'Log In' : 'Sign Up'}
                <div
                    style={{
                        border: '1px solid',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '8px',
                        rowGap: '10px',
                        width: 'fit-content',
                    }}
                >
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
                    {result.success === null ? null : (
                        <div
                            style={{ color: result.success ? 'green' : 'red' }}
                        >
                            {result.message}
                        </div>
                    )}
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
                                    setResult(
                                        false,
                                        error instanceof Error
                                            ? error.message
                                            : `${error}`,
                                    );
                                });
                        }}
                    >
                        {props.widgetType === 'logIn'
                            ? 'Log In'
                            : 'Create Account'}
                    </button>
                </div>
            </div>
        );
    },
    'SignUpWidget',
);
