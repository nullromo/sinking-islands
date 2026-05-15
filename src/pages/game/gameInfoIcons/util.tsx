import type { CardSerialized, FaceDownCard } from '../../../info/commonTypes';
import { cardTypeToString } from '../../../info/commonTypes';

export const makeCardTooltipList = (
    cards: Array<CardSerialized | FaceDownCard>,
) => {
    return cards.length === 0 ? (
        <em>Empty</em>
    ) : (
        cards
            .toSorted((a, b) => {
                return String(a.cardType).localeCompare(String(b.cardType));
            })
            .reduce<Array<[number, CardSerialized | FaceDownCard]>>(
                (cards, card) => {
                    if (cards.length === 0) {
                        return [[1, card]];
                    }
                    const lastEntry = cards[cards.length - 1];
                    if (lastEntry[1].cardType === card.cardType) {
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
                        {card.cardType === null
                            ? 'Unknown Card'
                            : cardTypeToString(card.cardType)}
                    </div>
                );
            })
    );
};
