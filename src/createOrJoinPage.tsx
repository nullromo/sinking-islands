import React from 'react';
import { LogInOrCreateAccountWidget } from './logInOrCreateAccount';
import { CreateGameWidget } from './createGame';
import { GetGamesWidget } from './getGames';

export const CreateOrJoinPage = (props: {
    emitCreate: () => void;
    emitJoin: (id: string) => void;
}) => {
    const [joinID, setJoinID] = React.useState('');

    React.useEffect(() => {
        navigator.clipboard
            .readText()
            .then((text) => {
                setJoinID(text);
            })
            .catch(console.error);
    }, []);

    return (
        <div>
            <button
                type='button'
                onClick={() => {
                    props.emitCreate();
                }}
            >
                Create Game
            </button>
            <input
                type='text'
                value={joinID}
                onChange={(event) => {
                    setJoinID(event.target.value);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        props.emitJoin(joinID);
                    }
                }}
            />
            <button
                type='button'
                onClick={() => {
                    props.emitJoin(joinID);
                }}
            >
                Join Game
            </button>
            <br />
            <br />
            <br />
            <br />
            <LogInOrCreateAccountWidget widgetType='createAccount' />
            <LogInOrCreateAccountWidget widgetType='logIn' />
            <CreateGameWidget />
            <GetGamesWidget />
        </div>
    );
};
