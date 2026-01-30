import type { GameSerialized } from './commonTypes';
import { PlayerDesignator } from './commonTypes';
import { GameActionsCell } from './gameActionsCell';
import { cellStyle } from './gameList';
import type { SetResultProps } from './useResultMessage';

interface GameListRowProps extends SetResultProps {
    readonly game: GameSerialized;
}

export const GameListRow = (props: GameListRowProps) => {
    const playerAUsername =
        props.game.players[PlayerDesignator.PLAYER_A].username;
    const playerBUsername =
        props.game.players[PlayerDesignator.PLAYER_B].username;

    return (
        <tr>
            <td style={cellStyle}>{props.game.id}</td>
            <td style={cellStyle}>{props.game.gameState}</td>
            <td style={cellStyle}>{playerAUsername ?? '<none>'}</td>
            <td style={cellStyle}>{playerBUsername ?? '<none>'}</td>
            <GameActionsCell game={props.game} setResult={props.setResult} />
        </tr>
    );
};
