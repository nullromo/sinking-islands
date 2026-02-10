import * as React from 'react';
import type { GameSerialized } from './commonTypes';
import { PlayerDesignator } from './commonTypes';
import { GameActionsCell } from './gameActionsCell';
import { cellStyle } from './gameList';
import { LoggedInUserContext } from './loggedInUserContext';
import type { SetResultProps } from './useResultMessage';

interface GameListRowProps extends SetResultProps {
    readonly game: GameSerialized;
    readonly refresh: () => void;
}

const YouStyledTD = (props: { readonly username: string | null }) => {
    const loggedInUserContext = React.use(LoggedInUserContext);

    return (
        <td
            style={{
                ...cellStyle,
                ...(props.username === loggedInUserContext.loggedInUser
                    ? { background: 'lightgreen' }
                    : {}),
            }}
        >
            {props.username ?? '<none>'}
        </td>
    );
};

export const GameListRow = (props: GameListRowProps) => {
    const playerAUsername =
        props.game.players[PlayerDesignator.PLAYER_A].username;
    const playerBUsername =
        props.game.players[PlayerDesignator.PLAYER_B].username;

    return (
        <tr>
            <td style={cellStyle}>{props.game.id}</td>
            <td style={cellStyle}>{props.game.gameState}</td>
            <YouStyledTD username={playerAUsername} />
            <YouStyledTD username={playerBUsername} />
            <GameActionsCell
                game={props.game}
                refresh={props.refresh}
                setResult={props.setResult}
            />
        </tr>
    );
};
