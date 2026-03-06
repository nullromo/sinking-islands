import * as React from 'react';
import { GameContext } from '../../../contexts/gameContext';
import type { IslandSerialized } from '../../../info/commonTypes';
import { PlayerDesignator } from '../../../info/commonTypes';
import { getIslandColors } from '../../../info/islandColors';
import { Tooltip } from '../tooltip';
import { tooltipTHStyle } from './tooltipTHStyle';

export const IslandTooltip = (props: { readonly island: IslandSerialized }) => {
    const gameContext = React.use(GameContext);

    const islandColors = getIslandColors(props.island);

    const playerANetted =
        gameContext.game.players[PlayerDesignator.PLAYER_A].netIsland ===
        props.island.islandNumber;
    const playerBNetted =
        gameContext.game.players[PlayerDesignator.PLAYER_B].netIsland ===
        props.island.islandNumber;
    const playerAPilings =
        gameContext.game.players[PlayerDesignator.PLAYER_A].pilingsIsland ===
        props.island.islandNumber;
    const playerBPilings =
        gameContext.game.players[PlayerDesignator.PLAYER_B].pilingsIsland ===
        props.island.islandNumber;

    return (
        <Tooltip
            style={{ background: islandColors.island, width: 'fit-content' }}
        >
            <div style={{ borderBottom: '2px solid', textAlign: 'center' }}>
                Island {props.island.islandNumber}
            </div>
            <div style={{ background: 'lightgray', padding: '4px' }}>
                <table>
                    <tbody>
                        <tr>
                            <th style={tooltipTHStyle}>Type</th>
                            <td>
                                <b
                                    style={{
                                        background: islandColors.island,
                                        boxShadow: `0px 0px 6px 1px ${islandColors.island}`,
                                        padding: '0px 4px 0px 4px',
                                    }}
                                >
                                    {props.island.islandType}
                                </b>
                            </td>
                        </tr>
                        <tr>
                            <th style={tooltipTHStyle}>Capacity</th>
                            <td>
                                {props.island.smallCapacity
                                    ? 'Limited'
                                    : 'Unlimited'}
                            </td>
                        </tr>
                        <tr>
                            <th style={tooltipTHStyle}>Your strength</th>
                            <td>
                                {props.island.characters.reduce(
                                    (total, character) => {
                                        return character.playerDesignator ===
                                            gameContext.you
                                            ? total + character.strength
                                            : total;
                                    },
                                    0,
                                )}
                            </td>
                        </tr>
                        <tr>
                            <th style={tooltipTHStyle}>Enemy strength</th>
                            <td>
                                {props.island.characters.reduce(
                                    (total, character) => {
                                        return character.playerDesignator !==
                                            gameContext.you
                                            ? total + character.strength
                                            : total;
                                    },
                                    0,
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div
                    style={{
                        marginTop: '2px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {playerAPilings || playerBPilings ? (
                        <em style={{ color: 'saddlebrown' }}>
                            <b>
                                {`Pilings constructed by Player ${playerAPilings ? 'A' : 'B'}.`}
                            </b>
                        </em>
                    ) : null}
                </div>
                <div
                    style={{
                        marginTop: '2px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {playerANetted || playerBNetted ? (
                        <em style={{ color: 'saddlebrown' }}>
                            <b>
                                {`Island ensnared by Player ${playerANetted ? 'A' : 'B'}'s net.`}
                            </b>
                        </em>
                    ) : null}
                </div>
                <div
                    style={{
                        marginTop: '2px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {gameContext.game.nextIslandToSink ===
                    props.island.islandNumber ? (
                        <em style={{ color: '#c72727' }}>
                            <b>This island is sinking!</b>
                        </em>
                    ) : null}
                </div>
            </div>
        </Tooltip>
    );
};
