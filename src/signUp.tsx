import React from 'react';

export const SignUpWidget = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    return (
        <div>
            Sign Up
            <div
                style={{
                    border: '1px solid',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px',
                    rowGap: '10px',
                    width: 'fit-content',
                }}
            >
                <label>
                    {'Username: '}
                    <input
                        type='text'
                        value={username}
                        onChange={(event) => {
                            setUsername(event.target.value);
                        }}
                    />
                </label>
                <label>
                    {'Password: '}
                    <input
                        type='text'
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                        }}
                    />
                </label>
                <button
                    type='button'
                    onClick={() => {
                        //
                    }}
                >
                    Create Account
                </button>
            </div>
        </div>
    );
};
