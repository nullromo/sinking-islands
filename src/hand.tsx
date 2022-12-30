import type { CardSerialized, GameSerialized } from './commonTypes';
import { upperSnakeToTitle } from './util';

interface HandProps {
    gameState: GameSerialized;
    onCardClicked?: (card: CardSerialized, index: number) => void;
    highlightIndex?: number;
    ghostSlots?: number[];
}

export const Hand = (props: HandProps) => {
    return (
        <>
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
                {props.gameState.yourHand.map((card, index) => {
                    if (props.ghostSlots?.includes(index)) {
                        return null;
                    }
                    return (
                        <div
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            style={{
                                alignItems: 'center',
                                background: 'lightblue',
                                border:
                                    props.highlightIndex === index
                                        ? '3px solid'
                                        : '',
                                boxSizing: 'border-box',
                                display: 'flex',
                                height: '60px',
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
                })}
            </div>
        </>
    );
};
