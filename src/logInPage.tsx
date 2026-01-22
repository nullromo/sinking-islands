import { CenteredPage } from './centeredPage';
import { LogInOrCreateAccountWidget } from './logInOrCreateAccount';

export const LogInPage = () => {
    return (
        <CenteredPage>
            <LogInOrCreateAccountWidget widgetType='logIn' />
        </CenteredPage>
    );
};
