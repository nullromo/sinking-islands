import * as React from 'react';
import { Link } from 'react-router';
import type { InjectedServerCallsProps } from '../../communication/withServerCalls';
import { withServerCalls } from '../../communication/withServerCalls';
import { useResultMessage } from '../../hooks/useResultMessage';
import type { GameSerialized } from '../../info/commonTypes';
import { PageRoutes } from '../../router/pageRoutes';
import { GameListRow } from './gameListRow';

export const cellStyle: React.CSSProperties = {
    border: '1px solid',
    padding: '4px',
    textAlign: 'center',
};

export const GameListWidget = withServerCalls(
    (props: InjectedServerCallsProps) => {
        const [games, setGames] = React.useState<GameSerialized[]>([]);
        const [result, setResult] = useResultMessage();

        const refreshGameList = React.useCallback(() => {
            setResult(null, '');
            props.serverCalls
                .getGameList()
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
            <div
                style={{
                    border: '1px solid',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    rowGap: '10px',
                }}
            >
                {
                    <div style={{ color: result.success ? 'green' : 'red' }}>
                        {result.message}
                    </div>
                }
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginBottom: '10px',
                    }}
                >
                    <Link to={PageRoutes.TUTORIAL}>
                        <button type='button'>Tutorial</button>
                    </Link>
                    <button
                        type='button'
                        onClick={() => {
                            setResult(null, '');
                            props.serverCalls
                                .createGame()
                                .then((response) => {
                                    setResult(true, `Created game ${response}`);
                                })
                                .then(() => {
                                    refreshGameList();
                                })
                                .catch((error: unknown) => {
                                    setResult(false, error);
                                });
                        }}
                    >
                        Create New Game
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            refreshGameList();
                        }}
                    >
                        Refresh List
                    </button>
                </div>
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
                                <td
                                    colSpan={5}
                                    style={{
                                        textAlign: 'center',
                                        width: '620px',
                                    }}
                                >
                                    You have no active games.
                                </td>
                            </tr>
                        ) : (
                            games.map((game) => {
                                return (
                                    <GameListRow
                                        key={game.id}
                                        game={game}
                                        refresh={refreshGameList}
                                        setResult={setResult}
                                    />
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        );
    },
    'GetGamesWidget',
);
