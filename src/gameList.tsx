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
                    setResult(true, '');
                    setGames(response);
                })
                .catch((error: unknown) => {
                    setResult(false, error);
                });
        }, [props.serverCalls, setResult]);

        React.useEffect(() => {
            refreshGameList();
        }, [refreshGameList]);

        return (
            <BoxWidget bigTitle={false} title='Your Games'>
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
                <table style={{ border: '1px solid' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid', padding: '4px' }}>
                                Game ID
                            </th>
                            <th style={{ border: '1px solid', padding: '4px' }}>
                                Game State
                            </th>
                            <th style={{ border: '1px solid', padding: '4px' }}>
                                Opponent
                            </th>
                            <th style={{ border: '1px solid', padding: '4px' }}>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.length <= 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center' }}>
                                    You have no active games.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </BoxWidget>
        );
    },
    'GetGamesWidget',
);
