import * as React from 'react';
import { BoxWidget } from './boxWidget';
import { PlayerDesignator, type GameSerialized } from './commonTypes';
import { useResultMessage } from './useResultMessage';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

const cellStyle: React.CSSProperties = {
    border: '1px solid',
    padding: '4px',
    textAlign: 'center',
};

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
                            <th style={cellStyle}>Game ID</th>
                            <th style={cellStyle}>Game State</th>
                            <th style={cellStyle}>Player A</th>
                            <th style={cellStyle}>Player B</th>
                            <th style={cellStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.length <= 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center' }}>
                                    You have no active games.
                                </td>
                            </tr>
                        ) : (
                            games.map((game) => {
                                return (
                                    <tr key={game.id}>
                                        <td style={cellStyle}>{game.id}</td>
                                        <td style={cellStyle}>
                                            {game.gameState}
                                        </td>
                                        <td style={cellStyle}>
                                            {game.players[
                                                PlayerDesignator.PLAYER_A
                                            ].username ?? '<none>'}
                                        </td>
                                        <td style={cellStyle}>
                                            {game.players[
                                                PlayerDesignator.PLAYER_B
                                            ].username ?? '<none>'}
                                        </td>
                                        <td style={cellStyle}>
                                            <button type='button'>Play</button>
                                            <button type='button'>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </BoxWidget>
        );
    },
    'GetGamesWidget',
);
