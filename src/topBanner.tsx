import * as React from 'react';
import { useNavigate } from 'react-router';
import { LoggedInUserContext } from './loggedInUserContext';
import { PageRoutes } from './pageRoutes';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

export const TopBanner = withServerCalls((props: InjectedServerCallsProps) => {
    const navigate = useNavigate();
    const loggedInUserContext = React.use(LoggedInUserContext);

    return (
        <div
            style={{
                alignItems: 'center',
                background: '#2082D9',
                display: 'flex',
                height: '50px',
                justifyContent: 'space-between',
                width: '100%',
            }}
        >
            <div style={{ color: 'white', marginLeft: '20px' }}>
                Sinking Islands
            </div>
            <div style={{ marginRight: '20px' }}>
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
        </div>
    );
}, 'TopBanner');
