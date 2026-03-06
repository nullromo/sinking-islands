import * as React from 'react';
import { Link } from 'react-router';
import type { InjectedServerCallsProps } from '../../communication/withServerCalls';
import { withServerCalls } from '../../communication/withServerCalls';
import { LoggedInUserContext } from '../../contexts/loggedInUserContext';
import { useResultMessage } from '../../hooks/useResultMessage';
import { PageRoutes } from '../../router/pageRoutes';
import { BoxWidget } from '../boxWidget';

interface LogInOrCreateAccountWidgetProps extends InjectedServerCallsProps {
    widgetType: 'createAccount' | 'logIn';
}

export const LogInOrCreateAccountWidget = withServerCalls(
    (props: LogInOrCreateAccountWidgetProps) => {
        const [username, setUsername] = React.useState('kyle');
        const [password, setPassword] = React.useState('okay');
        const [result, setResult] = useResultMessage();

        const loggedInUserContext = React.use(LoggedInUserContext);

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
                bigTitle={true}
                style={{ background: '#FFFFFFAA' }}
                title={
                    props.widgetType === 'logIn' ? 'Log In' : 'Create Account'
                }
            >
                <div
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        height: 0,
                        justifyContent: 'flex-end',
                        left: 0,
                        position: 'relative',
                        width: '100%',
                    }}
                >
                    <Link to={PageRoutes.TITLE}>
                        <button
                            style={{ position: 'relative', top: '-40px' }}
                            type='button'
                        >
                            Back
                        </button>
                    </Link>
                </div>
                {result.success ? null : inputBoxes}
                {result.success === null ? null : (
                    <div style={{ color: result.success ? 'green' : 'red' }}>
                        {result.message}
                    </div>
                )}
                {result.success ? (
                    <Link
                        to={
                            props.widgetType === 'logIn'
                                ? PageRoutes.DASHBOARD
                                : PageRoutes.TITLE
                        }
                    >
                        <button style={{ width: '100%' }} type='button'>
                            {props.widgetType === 'logIn' ? 'Continue' : 'Back'}
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
                                    if (props.widgetType === 'logIn') {
                                        loggedInUserContext.setLoggedInUser(
                                            username,
                                        );
                                    }
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
