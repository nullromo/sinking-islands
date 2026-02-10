import * as React from 'react';
import type { CardSerialized } from './commonTypes';
import { GameContext } from './gameContext';
import { upperSnakeToTitle } from './util';

interface HandProps {
    readonly onCardClicked?: (card: CardSerialized, index: number) => void;
    readonly highlightIndex?: number;
    readonly ghostSlots?: number[];
}

export const Hand = (props: HandProps) => {
    const gameContext = React.use(GameContext);

    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <b>Your Hand</b>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '20px',
                    textAlign: 'center',
                }}
            >
                {gameContext.game.players[gameContext.you].hand.map(
                    (card, index) => {
                        if (props.ghostSlots?.includes(index)) {
                            return null;
                        }
                        return (
                            <div
                                key={index}
                                style={{
                                    alignItems: 'center',
                                    background: 'lightblue',
                                    border:
                                        props.highlightIndex === index
                                            ? '3px solid'
                                            : '',
                                    boxSizing: 'border-box',
                                    cursor: props.onCardClicked
                                        ? 'pointer'
                                        : '',
                                    display: 'flex',
                                    height: '40px',
                                    justifyContent: 'center',
                                    width: '100px',
                                }}
                                onClick={() => {
                                    if (props.onCardClicked) {
                                        props.onCardClicked(card, index);
                                    }
                                }}
                            >
                                <span>{upperSnakeToTitle(card.cardType)}</span>
                            </div>
                        );
                    },
                )}
            </div>
        </div>
    );
};
