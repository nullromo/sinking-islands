import * as React from 'react';
import { useNavigate } from 'react-router';
import type { GameSerialized } from './commonTypes';
import { PlayerDesignator } from './commonTypes';
import { cellStyle } from './gameList';
import { GameState } from './gameState';
import { LoggedInUserContext } from './loggedInUserContext';
import { buildPlayRoute } from './pageRoutes';
import type { SetResultProps } from './useResultMessage';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

interface GameActionsCellProps
    extends SetResultProps, InjectedServerCallsProps {
    readonly game: GameSerialized;
    readonly refresh: () => void;
}

export const GameActionsCell = withServerCalls(
    (props: GameActionsCellProps) => {
        const navigate = useNavigate();
        const loggedInUserContext = React.use(LoggedInUserContext);

        const playerAUsername =
            props.game.players[PlayerDesignator.PLAYER_A].username;
        const playerBUsername =
            props.game.players[PlayerDesignator.PLAYER_B].username;

        const playGame = () => {
            const result = navigate(buildPlayRoute(props.game.id));
            if (result instanceof Promise) {
                result.catch((error: unknown) => {
                    props.setResult(false, error);
                });
            }
        };

        const joinGame = () => {
            props.serverCalls
                .joinGame(props.game.id)
                .then(() => {
                    props.refresh();
                })
                .catch((error: unknown) => {
                    props.setResult(false, error);
                });
        };

        const spectateGame = () => {
            // TODO
        };

        return (
            <td style={cellStyle}>
                {playerAUsername === loggedInUserContext.loggedInUser ||
                playerBUsername === loggedInUserContext.loggedInUser ? (
                    <button type='button' onClick={playGame}>
                        {props.game.gameState === GameState.INITIAL_STATE
                            ? 'Play'
                            : 'Resume'}
                    </button>
                ) : playerAUsername === null || playerBUsername === null ? (
                    <button type='button' onClick={joinGame}>
                        Join
                    </button>
                ) : (
                    <button type='button' onClick={spectateGame}>
                        Spectate
                    </button>
                )}
            </td>
        );
    },
    'GameActionsCell',
);
