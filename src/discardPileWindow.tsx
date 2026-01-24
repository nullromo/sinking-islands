import React from 'react';
import { otherPlayerDesignator, type GameSerialized } from './commonTypes';
import { GameContext } from './gameContext';
import { cardTypeToString } from './server/gameObjects/card';

export const DiscardPileWindow = (props: {
    readonly gameState: GameSerialized;
    readonly opponent: boolean;
}) => {
    const gameContext = React.useContext(GameContext);

    const [hover, setHover] = React.useState(false);

    const cards = props.opponent
        ? props.gameState.players[otherPlayerDesignator(gameContext.you)]
              .discardPile
        : props.gameState.players[gameContext.you].discardPile;

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
                {'discard pile'}
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
