import { useNavigate } from 'react-router';
import React from 'react';
import { PageRoutes } from './pageRoutes';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';
import { LoggedInUserContext } from './loggedInUserContext';

export const LogOutWidget = withServerCalls(
    (props: InjectedServerCallsProps) => {
        const navigate = useNavigate();
        const loggedInUserContext = React.useContext(LoggedInUserContext);

        return (
            <div style={{ position: 'fixed', right: '10px', top: '10px' }}>
                <button
                    type='button'
                    onClick={() => {
                        props.serverCalls
                            .logOut()
                            .then(async () => {
                                loggedInUserContext.setLoggedInUser(null);
                                return navigate(PageRoutes.TITLE);
                            })
                            .catch((error: unknown) => {
                                console.error(error);
                            });
                    }}
                >
                    Log out
                </button>
            </div>
        );
    },
    'LogOutWidget',
);
