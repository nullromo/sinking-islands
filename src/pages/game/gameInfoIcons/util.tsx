import type { CardSerialized } from '../../../info/commonTypes';
import { cardTypeToString } from '../../../info/commonTypes';

export const makeCardTooltipList = (cards: CardSerialized[]) => {
    return cards.length === 0
        ? '<Empty>'
        : cards
              .toSorted((a, b) => {
                  return a.cardType.localeCompare(b.cardType);
              })
              .reduce<Array<[number, CardSerialized]>>((cards, card) => {
                  if (cards.length === 0) {
                      return [[1, card]];
                  }
                  const lastEntry = cards[cards.length - 1];
                  if (lastEntry[1].cardType === card.cardType) {
                      lastEntry[0] += 1;
                      return cards;
                  }
                  return [...cards, [1, card]];
              }, [])
              .map(([quantity, card], index) => {
                  return (
                      <div key={index}>
                          {quantity}x {cardTypeToString(card.cardType)}
                      </div>
                  );
              });
};
