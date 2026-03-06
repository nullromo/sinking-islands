import * as React from 'react';
import { LoggedInUserContext } from '../../contexts/loggedInUserContext';
import type { SetResultProps } from '../../hooks/useResultMessage';
import type { GameSerialized } from '../../info/commonTypes';
import { PlayerDesignator } from '../../info/commonTypes';
import { GameActionsCell } from './gameActionsCell';
import { cellStyle } from './gameList';

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
