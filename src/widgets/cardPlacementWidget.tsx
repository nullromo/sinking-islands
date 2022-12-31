import React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import type { CardSerialized, GameSerialized } from '../commonTypes';
import { Hand } from '../hand';
import type { CardPlacement } from '../server/actionOrderTrack';
import type { CardType } from '../server/card';

interface CardPlacementWidgetProps {
    submit: (cardPlacement: CardPlacement) => void;
    gameState: GameSerialized;
}

export const CardPlacementWidget = (props: CardPlacementWidgetProps) => {
    const [cardChoices, setCardChoices] = React.useState<
        Array<CardType | null>
    >(Array(6).fill(null));
    const [clickedCardIndex, setClickedCardIndex] = React.useState<
        number | null
    >(null);
    const [ghostSlots, setGhostSlots] = React.useState<number[]>([]);

    return (
        <>
            <ActionOrderTrack
                gameState={props.gameState}
                overrideCards={cardChoices.map((card) => {
                    if (card === null) {
                        return null;
                    }
                    return {
                        cardType: card,
                        playerDesignator: props.gameState.you,
                    };
                })}
                onSlotClicked={(slotIndex) => {
                    if (
                        clickedCardIndex !== null &&
                        props.gameState.actionOrderTrack.cardSlots[
                            slotIndex
                        ] === null &&
                        cardChoices[slotIndex] === null
                    ) {
                        setCardChoices((oldCardChoices) => {
                            oldCardChoices[slotIndex] =
                                props.gameState.yourHand[
                                    clickedCardIndex
                                ].cardType;
                            return [...oldCardChoices];
                        });
                        setClickedCardIndex(null);
                        setGhostSlots((ghostSlots) => {
                            return [...ghostSlots, clickedCardIndex];
                        });
                    }
                }}
            />
            <Hand
                gameState={props.gameState}
                ghostSlots={ghostSlots}
                highlightIndex={clickedCardIndex ?? undefined}
                onCardClicked={(_, index) => {
                    setClickedCardIndex(index);
                }}
            />
            <div style={{ width: '600px' }}>
                Place Cards. Click a card in your hand to select it, then click
                on a slot in the Action Order Track to place the card. Click
                Submit when finished, or click Reset to start over.
            </div>
            {props.gameState.indescretion[props.gameState.you] ? (
                <>
                    <br />
                    <div style={{ color: 'darkred', width: '600px' }}>
                        You are under the effects of indescretion.
                    </div>
                </>
            ) : null}
            <br />
            <div>
                <button
                    type='button'
                    onClick={() => {
                        setCardChoices(Array(6).fill(null));
                        setClickedCardIndex(null);
                        setGhostSlots([]);
                    }}
                >
                    Reset
                </button>
                <button
                    type='button'
                    onClick={() => {
                        props.submit(
                            Object.fromEntries(
                                (
                                    cardChoices
                                        .map((cardType, index) => {
                                            return { cardType, index };
                                        })
                                        .filter((item) => {
                                            return item.cardType !== null;
                                        }) as Array<{
                                        cardType: CardType;
                                        index: number;
                                    }>
                                ).map<[number, CardSerialized]>((item) => {
                                    return [
                                        item.index,
                                        {
                                            cardType: item.cardType,
                                            playerDesignator:
                                                props.gameState.you,
                                        },
                                    ];
                                }),
                            ) as Record<number, CardSerialized>,
                        );
                    }}
                >
                    Submit
                </button>
            </div>
        </>
    );
};
