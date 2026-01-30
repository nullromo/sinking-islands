import * as React from 'react';
import type { GameSerialized } from './commonTypes';
import { PlayerDesignator } from './commonTypes';
import { cellStyle } from './gameList';
import { GameState } from './gameState';
import { LoggedInUserContext } from './loggedInUserContext';
import type { SetResultProps } from './useResultMessage';

interface GameActionsCellProps extends SetResultProps {
    readonly game: GameSerialized;
}

export const GameActionsCell = (props: GameActionsCellProps) => {
    const loggedInUserContext = React.use(LoggedInUserContext);

    const playerAUsername =
        props.game.players[PlayerDesignator.PLAYER_A].username;
    const playerBUsername =
        props.game.players[PlayerDesignator.PLAYER_B].username;

    const playGame = () => {
        // TODO
    };

    const joinGame = () => {
        // TODO
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
};
