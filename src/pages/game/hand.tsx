import * as React from 'react';
import { GameContext } from '../../contexts/gameContext';
import type { CardSerialized } from '../../info/commonTypes';
import { OnScreenCard } from './onScreenCard';

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
                        const onClick = props.onCardClicked
                            ? () => {
                                  if (props.onCardClicked) {
                                      props.onCardClicked(card, index);
                                  }
                              }
                            : undefined;
                        return (
                            <OnScreenCard
                                key={index}
                                card={card}
                                highlight={props.highlightIndex === index}
                                onClick={onClick}
                            />
                        );
                    },
                )}
            </div>
        </div>
    );
};
