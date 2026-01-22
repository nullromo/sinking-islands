import { CenteredPage } from './centeredPage';
import { LogInOrCreateAccountWidget } from './logInOrCreateAccount';

export const CreateAccountPage = () => {
    return (
        <CenteredPage>
            <LogInOrCreateAccountWidget widgetType='createAccount' />
        </CenteredPage>
    );
};
