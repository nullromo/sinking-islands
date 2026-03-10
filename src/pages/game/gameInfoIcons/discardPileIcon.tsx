import * as React from 'react';
import { GameContext } from '../../../contexts/gameContext';
import type {
    CardSerialized,
    PlayerDesignator,
} from '../../../info/commonTypes';
import { cardTypeToString } from '../../../info/commonTypes';
import { GameInfoIcon } from './gameInfoIcon';

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
            tooltipChild={
                <>
                    <div
                        style={{
                            borderBottom: '2px solid',
                            textAlign: 'center',
                        }}
                    >
                        Discard Pile
                        <br />
                        <em>Click to view</em>
                    </div>
                    <div style={{ padding: '4px' }}>
                        {cards.length === 0
                            ? '<Empty>'
                            : cards
                                  .toSorted((a, b) => {
                                      return a.cardType.localeCompare(
                                          b.cardType,
                                      );
                                  })
                                  .reduce<Array<[number, CardSerialized]>>(
                                      (cards, card) => {
                                          if (cards.length === 0) {
                                              return [[1, card]];
                                          }
                                          const lastEntry =
                                              cards[cards.length - 1];
                                          if (
                                              lastEntry[1].cardType ===
                                              card.cardType
                                          ) {
                                              lastEntry[0] += 1;
                                              return cards;
                                          }
                                          return [...cards, [1, card]];
                                      },
                                      [],
                                  )
                                  .map(([quantity, card], index) => {
                                      return (
                                          <div key={index}>
                                              {quantity}x{' '}
                                              {cardTypeToString(card.cardType)}
                                          </div>
                                      );
                                  })}
                    </div>
                </>
            }
            viewBox='0 0 18 18'
        />
    );
};
