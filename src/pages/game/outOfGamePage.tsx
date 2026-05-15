import * as React from 'react';
import { Link } from 'react-router';
import gameBackground from '../../images/backgrounds/gameBackground.png';
import { PageRoutes } from '../../router/pageRoutes';

interface OutOfGamePageProps {
    readonly mainContent: React.ReactNode;
}

export const OutOfGamePage = (props: OutOfGamePageProps) => {
    return (
        <div
            style={{
                backgroundColor: '#ddb76430',
                backgroundImage: `url(${gameBackground})`,
                height: '100vh',
                width: '100vw',
            }}
        >
            <div
                style={{
                    alignItems: 'center',
                    background: 'lightgray',
                    borderRadius: '20px',
                    boxShadow: '0px 0px 10px 10px black',
                    display: 'flex',
                    flexDirection: 'column',
                    left: '50%',
                    padding: '50px 80px',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    whiteSpace: 'nowrap',
                }}
            >
                {props.mainContent}
            </div>
            <div style={{ left: 20, position: 'fixed', top: 20 }}>
                <Link to={PageRoutes.DASHBOARD}>
                    <button type='button'>Back to Dashboard</button>
                </Link>
            </div>
        </div>
    );
};
