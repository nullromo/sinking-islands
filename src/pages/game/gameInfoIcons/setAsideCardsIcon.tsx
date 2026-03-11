import * as React from 'react';
import { GameContext } from '../../../contexts/gameContext';
import type { PlayerDesignator } from '../../../info/commonTypes';
import { GameInfoIcon } from './gameInfoIcon';
import { makeCardTooltipList } from './util';

export const SetAsideCardsIcon = (props: {
    readonly playerDesignator: PlayerDesignator;
}) => {
    const gameContext = React.use(GameContext);
    const cards =
        gameContext.game.players[props.playerDesignator].setAsideCards;

    return (
        <GameInfoIcon
            clickable={true}
            iconLabel={cards.length}
            labelPosition={{ left: -9, top: 9 }}
            playerDesignator={props.playerDesignator}
            shape={[
                { points: '3 3 13 3 13 15.5 3 15.5' },
                { points: '14 3 20 3 20 11 14 11' },
            ]}
            tooltipBody={
                <div style={{ padding: '4px' }}>
                    {makeCardTooltipList(cards)}
                </div>
            }
            tooltipTitle='Set Aside Cards'
            viewBox='2 1 19 16'
        />
    );
};
