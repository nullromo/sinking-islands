import * as React from 'react';
import type { PlayerDesignator } from '../../../info/commonTypes';
import { GameInfoIcon } from './gameInfoIcon';
import { GameContext } from '../../../contexts/gameContext';

export const DeckIcon = (props: {
    readonly playerDesignator: PlayerDesignator;
}) => {
    const gameContext = React.use(GameContext);

    const cards = gameContext.game.players[props.playerDesignator].deck;

    return (
        <GameInfoIcon
            iconLabel={cards.length}
            labelPosition={{ left: -5, top: 10 }}
            playerDesignator={props.playerDesignator}
            shape={[
                { points: '6 4 16 4 16 16.5 6 16.5' },
                { points: '4 3 14 3 14 15.5 4 15.5' },
                { points: '2 2 12 2 12 14.5 2 14.5' },
            ]}
            tooltipBody={
                <div
                    style={{ padding: '10px', textAlign: 'center' }}
                >{`${cards.length} cards`}</div>
            }
            tooltipTitle='Deck'
            viewBox='0 0 18 18.5'
        />
    );
};
