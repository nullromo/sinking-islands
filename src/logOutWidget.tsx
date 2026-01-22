import { useNavigate } from 'react-router';
import { PageRoutes } from './pageRoutes';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

export const LogOutWidget = withServerCalls(
    (props: InjectedServerCallsProps) => {
        const navigate = useNavigate();

        return (
            <div style={{ position: 'fixed', right: '10px', top: '10px' }}>
                <button
                    type='button'
                    onClick={() => {
                        props.serverCalls
                            .logOut()
                            .then(async () => {
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
