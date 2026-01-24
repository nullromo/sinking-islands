import * as React from 'react';
import { BoxWidget } from './boxWidget';
import type { GameSerialized } from './commonTypes';
import { useResultMessage } from './useResultMessage';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

export const GetGamesWidget = withServerCalls(
    (props: InjectedServerCallsProps) => {
        const [games, setGames] = React.useState<GameSerialized[]>([]);
        const [result, setResult] = useResultMessage();

        const refreshGameList = React.useCallback(() => {
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
        }, []);

        React.useEffect(() => {
            refreshGameList();
        }, [refreshGameList]);

        return (
            <BoxWidget title='List Games'>
                {result.success === null ? null : (
                    <div style={{ color: result.success ? 'green' : 'red' }}>
                        {result.message}
                    </div>
                )}
                <button
                    type='button'
                    onClick={() => {
                        refreshGameList();
                    }}
                >
                    Refresh
                </button>
                <ul>
                    {games.map((game) => {
                        return <li key={game.id}>{game.id}</li>;
                    })}
                </ul>
            </BoxWidget>
        );
    },
    'GetGamesWidget',
);
