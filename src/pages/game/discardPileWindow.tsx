import * as React from 'react';
import { GameContext } from '../../contexts/gameContext';
import type { GameSerialized } from '../../info/commonTypes';
import {
    cardTypeToString,
    otherPlayerDesignator,
} from '../../info/commonTypes';
import { getPlayerColor } from '../../info/playerColors';

export const CardPileWindow = (props: {
    readonly gameState: GameSerialized;
    readonly cardPile: 'discardPile' | 'setAsideCards';
    readonly opponent: boolean;
}) => {
    const gameContext = React.use(GameContext);

    const [hover, setHover] = React.useState(false);

    const player = props.opponent
        ? props.gameState.players[otherPlayerDesignator(gameContext.you)]
        : props.gameState.players[gameContext.you];

    const cards = player[props.cardPile];

    return (
        <span>
            <span
                style={{ cursor: 'help', textDecoration: 'underline dotted' }}
                onMouseEnter={() => {
                    setHover(true);
                }}
                onMouseLeave={() => {
                    setHover(false);
                }}
            >
                {props.cardPile === 'discardPile'
                    ? 'Discard pile'
                    : 'Set aside cards'}
            </span>
            <span
                style={{
                    background: getPlayerColor(
                        props.opponent
                            ? otherPlayerDesignator(gameContext.you)
                            : gameContext.you,
                        gameContext.you,
                    ).dim,
                    position: 'absolute',
                    visibility: hover ? 'visible' : 'hidden',
                }}
            >
                {cards.length <= 0
                    ? '<Empty>'
                    : cards.map((card, index) => {
                          return (
                              <div key={index}>
                                  {cardTypeToString(card.cardType)}
                              </div>
                          );
                      })}
            </span>
            {` (${cards.length} cards)`}
        </span>
    );
};
