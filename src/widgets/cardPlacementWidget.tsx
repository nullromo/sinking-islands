import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import type { CardSerialized, CardType } from '../commonTypes';
import { GameActionType } from '../gameActionTypes';
import { GameContext } from '../gameContext';
import { Hand } from '../hand';
import type { SetResultProps } from '../useResultMessage';
import type { InjectedServerCallsProps } from '../withServerCalls';
import { withServerCalls } from '../withServerCalls';
import { Board } from '../board';

interface CardPlacementWidgetProps
    extends InjectedServerCallsProps, SetResultProps {
    //
}

export const CardPlacementWidget = withServerCalls(
    (props: CardPlacementWidgetProps) => {
        const gameContext = React.use(GameContext);

        const [cardChoices, setCardChoices] = React.useState<
            Array<CardType | null>
        >(Array(6).fill(null));
        const [clickedCardIndex, setClickedCardIndex] = React.useState<
            number | null
        >(null);
        const [ghostSlots, setGhostSlots] = React.useState<number[]>([]);

        return (
            <>
                <Board />
                <div
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <ActionOrderTrack
                        overrideCards={cardChoices.map((card) => {
                            if (card === null) {
                                return null;
                            }
                            return {
                                cardType: card,
                                playerDesignator: gameContext.you,
                            };
                        })}
                        onSlotClicked={(slotIndex) => {
                            if (
                                clickedCardIndex !== null &&
                                gameContext.game.actionOrderTrack.cardSlots[
                                    slotIndex
                                ] === null &&
                                cardChoices[slotIndex] === null
                            ) {
                                setCardChoices((oldCardChoices) => {
                                    oldCardChoices[slotIndex] =
                                        gameContext.game.players[
                                            gameContext.you
                                        ].hand[clickedCardIndex].cardType;
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
                        ghostSlots={ghostSlots}
                        highlightIndex={clickedCardIndex ?? undefined}
                        onCardClicked={(_, index) => {
                            setClickedCardIndex(index);
                        }}
                    />
                    <div style={{ width: '600px' }}>
                        Place Cards. Click a card in your hand to select it,
                        then click on a slot in the Action Order Track to place
                        the card. Click Submit when finished, or click Reset to
                        start over.
                    </div>
                    {gameContext.game.players[gameContext.you].indiscretion ? (
                        <>
                            <br />
                            <div style={{ color: 'darkred', width: '600px' }}>
                                You are under the effects of indiscretion.
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
                                props.serverCalls
                                    .takeGameAction(gameContext.game.id, {
                                        action: GameActionType.CARD_PLACEMENT,
                                        data: Object.fromEntries(
                                            (
                                                cardChoices
                                                    .map((cardType, index) => {
                                                        return {
                                                            cardType,
                                                            index,
                                                        };
                                                    })
                                                    .filter((item) => {
                                                        return (
                                                            item.cardType !==
                                                            null
                                                        );
                                                    }) as Array<{
                                                    cardType: CardType;
                                                    index: number;
                                                }>
                                            ).map<[number, CardSerialized]>(
                                                (item) => {
                                                    return [
                                                        item.index,
                                                        {
                                                            cardType:
                                                                item.cardType,
                                                            playerDesignator:
                                                                gameContext.you,
                                                        },
                                                    ];
                                                },
                                            ),
                                        ) as Record<number, CardSerialized>,
                                    })
                                    .catch((error: unknown) => {
                                        props.setResult(false, error);
                                    });
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </>
        );
    },
    'CardPlacementWidget',
);
