import githubLogo from '../images/logos/github.svg';
import venmoLogo from '../images/logos/venmo.webp';
import { LogoLink } from './logoButton';

export const Credits = () => {
    return (
        <div
            style={{
                background: '#FFFFFF66',
                borderRadius: '10px',
                bottom: '20px',
                padding: '0 10px 0 10px',
                position: 'fixed',
                right: '20px',
            }}
        >
            <p>Website Created by Kyle Kovacs</p>
            <LogoLink
                href='https://github.com/nullromo/sinking-islands'
                image={githubLogo}
                title='GitHub'
            >
                <div style={{ width: '170px' }}>
                    {'Check out the page, '}
                    <a href='https://github.com/nullromo/sinking-islands/issues'>
                        open an issue
                    </a>
                    {', or '}
                    <a href='https://github.com/sponsors/nullromo'>sponsor</a>
                </div>
            </LogoLink>
            <LogoLink
                background='#0074d3'
                href='https://venmo.com/u/Kyle-Kovacs'
                image={venmoLogo}
                title='Venmo'
            >
                <div>Support on Venmo</div>
            </LogoLink>
        </div>
    );
};
