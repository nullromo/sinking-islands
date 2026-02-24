import * as React from 'react';
import type { CardSerialized, FaceDownCard } from './commonTypes';
import { CardType, cardTypeToString } from './commonTypes';
import { GameContext } from './gameContext';
import { getCardImage } from './images/cardImages';

interface OnScreenCardProps {
    readonly card: CardSerialized | FaceDownCard;
    readonly onClick: (() => void) | undefined;
    readonly highlight: boolean;
}

export const OnScreenCard = (props: OnScreenCardProps) => {
    const gameContext = React.use(GameContext);

    return (
        <div
            style={{
                alignItems: 'center',
                background:
                    props.card.playerDesignator === gameContext.you
                        ? 'lightblue'
                        : 'indianred',
                border: '2px solid',
                borderRadius: '4px',
                boxSizing: 'border-box',
                cursor: props.onClick ? 'pointer' : '',
                display: 'flex',
                flexDirection: 'column',
                height: '126px',
                justifyContent: 'center',
                outline: props.highlight ? '4px solid gold' : '',
                width: '100px',
            }}
            onClick={props.onClick}
        >
            <div
                style={{
                    borderBottom: '2px solid',
                    height: '20px',
                    width: '100%',
                }}
            >
                <span style={{ verticalAlign: 'middle' }}>
                    {props.card.cardType === null
                        ? 'Face Down'
                        : props.card.cardType === CardType.VOLCANIC_ERUPTION
                          ? 'Volcano'
                          : cardTypeToString(props.card.cardType)}
                </span>
            </div>
            <div
                style={{
                    alignItems: 'center',
                    backgroundImage:
                        props.card.cardType === null
                            ? ''
                            : getCardImage(props.card.cardType),
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    height: '100px',
                    width: '100%',
                }}
            />
        </div>
    );
};
