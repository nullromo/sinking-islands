import { Link } from 'react-router';
import { CenteredPage } from '../centeredPage';
import titleBackground from '../images/titleBackground.png';
import { PageRoutes } from '../pageRoutes';

export const TitlePage = () => {
    return (
        <div
            style={{
                backgroundImage: `url(${titleBackground})`,
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
                    <h1 style={{ marginTop: 0 }}>Sinking Islands</h1>
                    <div style={{ columnGap: '10px', display: 'flex' }}>
                        <Link to={PageRoutes.LOG_IN}>
                            <button type='button'>Log In</button>
                        </Link>
                        <Link to={PageRoutes.CREATE_ACCOUNT}>
                            <button type='button'>Create Account</button>
                        </Link>
                    </div>
                </CenteredPage>
            </div>
        </div>
    );
};
