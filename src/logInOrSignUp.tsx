import React from 'react';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

interface LogInOrSignUpWidgetProps extends InjectedServerCallsProps {
    widgetType: 'logIn' | 'signUp';
}

export const LogInOrSignUpWidget = withServerCalls(
    (props: LogInOrSignUpWidgetProps) => {
        const [username, setUsername] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [message, setMessage] = React.useState('');
        const [errorMessage, setErrorMessage] = React.useState('');

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
                    {message === '' ? null : (
                        <div style={{ color: 'green' }}>{message}</div>
                    )}
                    {errorMessage === '' ? null : (
                        <div style={{ color: 'red' }}>{errorMessage}</div>
                    )}
                    <button
                        type='button'
                        onClick={() => {
                            setMessage('');
                            setErrorMessage('');
                            (props.widgetType === 'logIn'
                                ? props.serverCalls.logIn
                                : props.serverCalls.createUser)(
                                username,
                                password,
                            )
                                .then((response) => {
                                    setMessage(response.message);
                                })
                                .catch((error: unknown) => {
                                    setErrorMessage(
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
