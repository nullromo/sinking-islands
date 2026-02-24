import * as React from 'react';
import type { CardSerialized } from './commonTypes';
import { GameContext } from './gameContext';
import { OnScreenCard } from './onScreenCard';

interface ActionOrderTrackProps {
    readonly onSlotClicked?: (slotIndex: number) => void;
    readonly overrideCards?: Array<CardSerialized | null>;
    readonly highlightIndex?: number;
}

export const ActionOrderTrack = (props: ActionOrderTrackProps) => {
    const gameContext = React.use(GameContext);

    const slots = gameContext.game.actionOrderTrack.cardSlots.map(
        (gameStateCard, slotIndex) => {
            const overrideCard = props.overrideCards?.[slotIndex];
            const card = overrideCard ?? gameStateCard;
            const activeCard = slotIndex === gameContext.game.activeCardIndex;

            const emptySlot = (
                <div
                    style={{
                        alignItems: 'center',
                        background:
                            card?.playerDesignator === gameContext.you
                                ? 'skyblue'
                                : card
                                  ? 'indianred'
                                  : 'lightgray',
                        color:
                            activeCard || gameStateCard === null
                                ? 'black'
                                : '#777',
                        display: 'flex',
                        height: '126px',
                        justifyContent: 'center',
                        width: '100px',
                    }}
                    onClick={() => {
                        if (props.onSlotClicked) {
                            props.onSlotClicked(slotIndex);
                        }
                    }}
                >
                    Empty
                    {(gameContext.game.actionOrderTrack.faceUpCards.includes(
                        slotIndex,
                    ) &&
                        gameStateCard) ||
                    (gameContext.game.players[gameContext.you].indiscretion &&
                        overrideCard) ? (
                        <div>(Face Up)</div>
                    ) : null}
                </div>
            );

            return (
                <td
                    key={slotIndex}
                    style={{
                        border:
                            props.highlightIndex === slotIndex
                                ? '3px solid'
                                : '',
                        boxSizing: 'border-box',
                        cursor: props.onSlotClicked ? 'pointer' : '',
                        width: '100px',
                    }}
                >
                    {card === null ? (
                        emptySlot
                    ) : (
                        <OnScreenCard
                            card={card}
                            highlight={false}
                            onClick={
                                props.onSlotClicked
                                    ? () => {
                                          if (props.onSlotClicked) {
                                              props.onSlotClicked(slotIndex);
                                          }
                                      }
                                    : undefined
                            }
                        />
                    )}
                    <div>
                        <span
                            style={{
                                color: 'transparent',
                                textShadow: '0 0 0 #000000',
                                visibility: activeCard ? 'visible' : 'hidden',
                            }}
                        >
                            {'🔺'}
                        </span>
                    </div>
                </td>
            );
        },
    );

    return (
        <div
            style={{
                display: 'flex',
                marginBottom: '20px',
                textAlign: 'center',
            }}
        >
            <table>
                <thead>
                    <tr>
                        <th colSpan={6}>Action Order Track</th>
                    </tr>
                    <tr>
                        <th style={{ background: 'khaki' }}>1</th>
                        <th style={{ background: 'khaki' }}>2</th>
                        <th style={{ background: 'lightpink' }}>3</th>
                        <th style={{ background: 'lightpink' }}>4</th>
                        <th style={{ background: 'palegreen' }}>5</th>
                        <th style={{ background: 'palegreen' }}>6</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>{slots}</tr>
                </tbody>
            </table>
        </div>
    );
};
