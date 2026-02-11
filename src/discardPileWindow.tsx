import * as React from 'react';
import type { GameSerialized } from './commonTypes';
import { cardTypeToString, otherPlayerDesignator } from './commonTypes';
import { GameContext } from './gameContext';

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
            {`Your ${props.opponent ? "opponent's " : ''}`}
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
                    ? 'discard pile'
                    : 'set aside cards'}
            </span>
            <span
                style={{
                    background: props.opponent ? 'indianred' : 'lightskyblue',
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
