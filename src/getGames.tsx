import React from 'react';
import type { GameSerialized } from './commonTypes';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';
import { useResultMessage } from './useResultMessage';

export const GetGamesWidget = withServerCalls(
    (props: InjectedServerCallsProps) => {
        const [games, setGames] = React.useState<GameSerialized[]>([]);
        const [result, setResult] = useResultMessage();

        return (
            <div>
                List Games
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
                    {result.success === null ? null : (
                        <div
                            style={{ color: result.success ? 'green' : 'red' }}
                        >
                            {result.message}
                        </div>
                    )}
                    <button
                        type='button'
                        onClick={() => {
                            setResult(null, '');
                            props.serverCalls
                                .getGamesForUser()
                                .then((response) => {
                                    setResult(true, 'Got games.');
                                    setGames(response);
                                })
                                .catch((error: unknown) => {
                                    setResult(false, error);
                                });
                        }}
                    >
                        List My Games
                    </button>
                    <ul>
                        {games.map((game) => {
                            return <li key={game.id}>{game.id}</li>;
                        })}
                    </ul>
                </div>
            </div>
        );
    },
    'GetGamesWidget',
);
