import * as React from 'react';
import type { GameSerialized } from './commonTypes';
import { PlayerDesignator } from './commonTypes';
import { cellStyle } from './gameList';
import { GameState } from './gameState';
import { LoggedInUserContext } from './loggedInUserContext';

interface GameActionsCellProps {
    readonly game: GameSerialized;
}

export const GameActionsCell = (props: GameActionsCellProps) => {
    const loggedInUserContext = React.use(LoggedInUserContext);

    const playerAUsername =
        props.game.players[PlayerDesignator.PLAYER_A].username;
    const playerBUsername =
        props.game.players[PlayerDesignator.PLAYER_B].username;

    return (
        <td style={cellStyle}>
            {playerAUsername === loggedInUserContext.loggedInUser ||
            playerBUsername === loggedInUserContext.loggedInUser ? (
                <button type='button'>
                    {props.game.gameState === GameState.INITIAL_STATE
                        ? 'Play'
                        : 'Resume'}
                </button>
            ) : playerAUsername === null || playerBUsername === null ? (
                <button type='button'>Join</button>
            ) : (
                <button type='button'>Watch</button>
            )}
        </td>
    );
};
