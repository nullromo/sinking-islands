import * as React from 'react';
import { GameContext } from '../../../contexts/gameContext';
import type { PlayerDesignator } from '../../../info/commonTypes';
import { GameInfoIcon } from './gameInfoIcon';
import { makeCardTooltipList } from './util';

export const DiscardPileIcon = (props: {
    readonly playerDesignator: PlayerDesignator;
}) => {
    const gameContext = React.use(GameContext);
    const cards = gameContext.game.players[props.playerDesignator].discardPile;

    return (
        <GameInfoIcon
            iconLabel={cards.length}
            labelPosition={{ left: -3, top: 12 }}
            playerDesignator={props.playerDesignator}
            shape={[
                { points: '2 3 14 3 13 15.5 3 15.5' },
                { points: '1 3 15 3 10 2 8 1 6 2' },
            ]}
            tooltipBody={
                <div style={{ padding: '4px' }}>
                    {makeCardTooltipList(cards)}
                </div>
            }
            tooltipTitle='Discard Pile'
            viewBox='0 0 18 18'
        />
    );
};
