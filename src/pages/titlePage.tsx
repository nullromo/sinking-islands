import { Link } from 'react-router';
import { PageRoutes } from '../pageRoutes';
import { CenteredPage } from '../centeredPage';

export const TitlePage = () => {
    return (
        <CenteredPage>
            <h1>Sinking Islands</h1>
            <div style={{ columnGap: '10px', display: 'flex' }}>
                <Link to={PageRoutes.LOG_IN}>
                    <button type='button'>Log In</button>
                </Link>
                <Link to={PageRoutes.CREATE_ACCOUNT}>
                    <button type='button'>Create Account</button>
                </Link>
            </div>
        </CenteredPage>
    );
};
