import * as React from 'react';
import type { IslandSerialized } from '../commonTypes';
import { Emoji } from '../emoji';
import { GameContext } from '../gameContext';
import { getIslandColors } from '../islandColors';

export const IslandCapacityChip = (props: {
    readonly island: IslandSerialized;
    readonly islandWidth: number;
}) => {
    const gameContext = React.use(GameContext);

    const hasPilings = Object.values(gameContext.game.players).some(
        (player) => {
            return player.pilingsIsland === props.island.islandNumber;
        },
    );

    return (
        <div
            style={{
                background: getIslandColors(props.island).island,
                bottom: '-3px',
                fontSize: `${props.islandWidth / 8.75}px`,
                height: `${props.islandWidth / 6}px`,
                padding: '0 1px 3px 0',
                position: 'absolute',
                right: '-3px',
            }}
        >
            {hasPilings ? <span style={{ paddingLeft: '4px' }}>*</span> : null}
            <span style={{ color: 'transparent', textShadow: '0 0 0 black' }}>
                {props.island.smallCapacity && !hasPilings
                    ? Emoji.alone
                    : Emoji.together}
            </span>
        </div>
    );
};
