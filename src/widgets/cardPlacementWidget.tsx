import React from 'react';
import type { CardSerialized, PlayerDesignator } from '../commonTypes';
import type { CardPlacement } from '../server/actionOrderTrack';
import type { CardType } from '../server/card';

interface CardPlacementWidgetProps {
    submit: (cardPlacement: CardPlacement) => void;
    you: PlayerDesignator;
    yourHand: CardSerialized[];
}

export const CardPlacementWidget = (props: CardPlacementWidgetProps) => {
    const [positionChoices, setPositionChoices] = React.useState<number[]>([
        0, 2, 4,
    ]);
    const [cardTypeChoices, setCardTypeChoices] = React.useState<CardType[]>([
        props.yourHand[0].cardType,
        props.yourHand[0].cardType,
        props.yourHand[0].cardType,
    ]);

    return (
        <>
            {[...Array(3).keys()].map((cardKey) => {
                return (
                    <div key={cardKey}>
                        <select
                            value={positionChoices[cardKey]}
                            onChange={(event) => {
                                setPositionChoices(
                                    positionChoices.map((choice, index) => {
                                        return index === cardKey
                                            ? Number(event.target.value)
                                            : choice;
                                    }),
                                );
                            }}
                        >
                            <option value={cardKey * 2}>
                                {cardKey * 2 + 1}
                            </option>
                            <option value={cardKey * 2 + 1}>
                                {cardKey * 2 + 2}
                            </option>
                        </select>
                        <select
                            value={cardTypeChoices[cardKey]}
                            onChange={(event) => {
                                setCardTypeChoices(
                                    cardTypeChoices.map((choice, index) => {
                                        return index === cardKey
                                            ? (event.target.value as CardType)
                                            : choice;
                                    }),
                                );
                            }}
                        >
                            {[
                                ...new Set(
                                    props.yourHand.map((card) => {
                                        return card.cardType;
                                    }),
                                ),
                            ].map((cardType) => {
                                return (
                                    <option key={cardType} value={cardType}>
                                        {cardType}
                                    </option>
                                );
                            })}
                        </select>
                        <br />
                    </div>
                );
            })}
            <button
                type='button'
                onClick={() => {
                    props.submit({
                        [positionChoices[0]]: {
                            cardType: cardTypeChoices[0],
                            playerDesignator: props.you,
                        },
                        [positionChoices[1]]: {
                            cardType: cardTypeChoices[1],
                            playerDesignator: props.you,
                        },
                        [positionChoices[2]]: {
                            cardType: cardTypeChoices[2],
                            playerDesignator: props.you,
                        },
                    });
                }}
            >
                Submit
            </button>
        </>
    );
};
