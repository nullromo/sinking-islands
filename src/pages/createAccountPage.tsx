import { CenteredPage } from '../centeredPage';
import createAccountBackground from '../images/backgrounds/createAccountBackground.jpg';
import { LogInOrCreateAccountWidget } from '../logInOrCreateAccount';

export const CreateAccountPage = () => {
    return (
        <div
            style={{
                backgroundImage: `url(${createAccountBackground})`,
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
                    <LogInOrCreateAccountWidget widgetType='createAccount' />
                </CenteredPage>
            </div>
        </div>
    );
};
