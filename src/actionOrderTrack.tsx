import React from 'react';
import type { CardSerialized, GameSerialized } from './commonTypes';
import { cardTypeToString } from './server/gameObjects/card';
import { upperSnakeToTitle } from './util';
import { GameContext } from './gameContext';

interface ActionOrderTrackProps {
    gameState: GameSerialized;
    onSlotClicked?: (slotIndex: number) => void;
    overrideCards?: Array<CardSerialized | null>;
    highlightIndex?: number;
}

export const ActionOrderTrack = (props: ActionOrderTrackProps) => {
    const gameContext = React.useContext(GameContext);

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
                    <tr>
                        {props.gameState.actionOrderTrack.cardSlots.map(
                            (card, slotIndex) => {
                                const overrideCard =
                                    props.overrideCards?.[slotIndex];
                                const activeCard =
                                    slotIndex ===
                                    props.gameState.activeCardIndex;
                                return (
                                    <td
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={slotIndex}
                                        style={{
                                            border:
                                                props.highlightIndex ===
                                                slotIndex
                                                    ? '3px solid'
                                                    : '',
                                            boxSizing: 'border-box',
                                            cursor: props.onSlotClicked
                                                ? 'pointer'
                                                : '',
                                            width: '100px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                alignItems: 'center',
                                                background:
                                                    overrideCard?.playerDesignator ===
                                                        gameContext.you ||
                                                    card?.playerDesignator ===
                                                        gameContext.you
                                                        ? 'skyblue'
                                                        : overrideCard || card
                                                          ? 'indianred'
                                                          : 'lightgray',
                                                color:
                                                    activeCard || card === null
                                                        ? 'black'
                                                        : '#777',
                                                display: 'flex',
                                                height: '40px',
                                                justifyContent: 'center',
                                            }}
                                            onClick={() => {
                                                if (props.onSlotClicked) {
                                                    props.onSlotClicked(
                                                        slotIndex,
                                                    );
                                                }
                                            }}
                                        >
                                            <div>
                                                {overrideCard
                                                    ? cardTypeToString(
                                                          overrideCard.cardType,
                                                      )
                                                    : card
                                                      ? upperSnakeToTitle(
                                                            card.cardType ?? '',
                                                        )
                                                      : 'Empty'}
                                            </div>
                                            {(props.gameState.actionOrderTrack.faceUpCards.includes(
                                                slotIndex,
                                            ) &&
                                                card) ||
                                            (props.gameState.indiscretion[
                                                gameContext.you
                                            ] &&
                                                overrideCard) ? (
                                                <div>(Face Up)</div>
                                            ) : null}
                                        </div>
                                        <div>
                                            <span
                                                style={{
                                                    color: 'transparent',
                                                    textShadow: '0 0 0 #000000',
                                                    visibility: activeCard
                                                        ? 'visible'
                                                        : 'hidden',
                                                }}
                                            >
                                                {'🔺'}
                                            </span>
                                        </div>
                                    </td>
                                );
                            },
                        )}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
