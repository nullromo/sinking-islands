import { CenteredPage } from '../centeredPage';
import logInBackground from '../images/logInBackground.jpg';
import { LogInOrCreateAccountWidget } from '../logInOrCreateAccount';

export const LogInPage = () => {
    return (
        <div
            style={{
                backgroundImage: `url(${logInBackground})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
            }}
        >
            <div style={{ background: '#FFFFFF66' }}>
                <CenteredPage
                    style={{
                        background: '#FFFFFF77',
                        border: '1px solid',
                        padding: '10px',
                    }}
                >
                    <LogInOrCreateAccountWidget widgetType='logIn' />
                </CenteredPage>
            </div>
        </div>
    );
};
