import * as React from 'react';
import { GameContext } from '../../../contexts/gameContext';
import type { CharacterSerialized } from '../../../info/commonTypes';
import { getPlayerColor } from '../../../info/playerColors';
import { Tooltip } from '../tooltip';
import { tooltipTHStyle } from './tooltipTHStyle';

export const CharacterTooltip = (props: {
    readonly character: CharacterSerialized;
}) => {
    const gameContext = React.use(GameContext);

    return (
        <Tooltip
            style={{
                background: getPlayerColor(
                    props.character.playerDesignator,
                    gameContext.you,
                ).dim,
                width: 'fit-content',
            }}
        >
            <div
                style={{
                    borderBottom: '2px solid',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                }}
            >
                {gameContext.spectator
                    ? `${props.character.playerDesignator}'s`
                    : props.character.playerDesignator === gameContext.you
                      ? 'Your'
                      : 'Enemy'}{' '}
                Character
            </div>
            <div style={{ background: 'lightgray', padding: '4px' }}>
                <table>
                    <tbody>
                        <tr>
                            <th style={tooltipTHStyle}>Strength</th>
                            <td>{props.character.strength}</td>
                        </tr>
                        <tr>
                            <th style={tooltipTHStyle}>Type</th>
                            <td>
                                {props.character.tortoise
                                    ? 'Tortoise'
                                    : 'Human'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Tooltip>
    );
};
