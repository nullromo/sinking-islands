import * as React from 'react';
import type { PlayerDesignator } from '../../../info/commonTypes';
import { GameInfoIcon } from './gameInfoIcon';
import { GameContext } from '../../../contexts/gameContext';

export const HandIcon = (props: {
    readonly playerDesignator: PlayerDesignator;
}) => {
    const gameContext = React.use(GameContext);

    const cards = gameContext.game.players[props.playerDesignator].hand;

    return (
        <GameInfoIcon
            iconLabel={cards.length}
            labelPosition={{ left: 1, top: 11 }}
            playerDesignator={props.playerDesignator}
            shape={[
                {
                    points: '2 3 11 2 12 13.5 3 14.5',
                    transform: 'translate(1 -1)',
                },
                {
                    points: '5 4 14 5 13 16.5 4 15.5',
                    transform: 'translate(5 2)',
                },
                {
                    points: '3 3 13 3 13 15.5 3 15.5',
                    transform: 'translate(3)',
                },
            ]}
            tooltipBody={
                <div
                    style={{ padding: '10px', textAlign: 'center' }}
                >{`${cards.length} cards`}</div>
            }
            tooltipTitle='Hand'
            viewBox='1 0 19 20'
        />
    );
};
