import * as React from 'react';
import { getCardDescription } from './cardDescription';
import type { CardSerialized, FaceDownCard } from './commonTypes';
import { CardType, cardTypeToString } from './commonTypes';
import { GameContext } from './gameContext';
import { getCardImage } from './images/cardImages';
import { useMousePosition } from './useMousePosition';

interface OnScreenCardProps {
    readonly card: CardSerialized | FaceDownCard;
    readonly onClick: (() => void) | undefined;
    readonly highlight: boolean;
}

export const OnScreenCard = (props: OnScreenCardProps) => {
    const gameContext = React.use(GameContext);

    const [hover, setHover] = React.useState(false);
    const mousePosition = useMousePosition();

    const backgroundColor =
        props.card.playerDesignator === gameContext.you
            ? 'lightblue'
            : 'indianred';

    const makeCardTitle = (short: boolean) => {
        return (
            <span style={{ verticalAlign: 'middle' }}>
                {props.card.cardType === null
                    ? 'Face Down'
                    : short &&
                        props.card.cardType === CardType.VOLCANIC_ERUPTION
                      ? 'Volcanic E.'
                      : cardTypeToString(props.card.cardType)}
            </span>
        );
    };

    const cardTooltip = (
        <div
            style={{
                background: backgroundColor,
                border: '2px solid',
                borderRadius: '4px',
                left: mousePosition.x - 4 - 200,
                position: 'absolute',
                top: mousePosition.y + 4,
                visibility: hover ? 'visible' : 'hidden',
                width: '200px',
            }}
        >
            <div style={{ borderBottom: '2px solid' }}>
                {makeCardTitle(false)}
            </div>
            <div>{getCardDescription(props.card.cardType)}</div>
        </div>
    );

    return (
        <div
            style={{
                alignItems: 'center',
                background: backgroundColor,
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
            onMouseEnter={() => {
                setHover(true);
            }}
            onMouseLeave={() => {
                setHover(false);
            }}
        >
            <div
                style={{
                    borderBottom: '2px solid',
                    height: '20px',
                    width: '100%',
                }}
            >
                {makeCardTitle(true)}
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
            <div
                style={{
                    height: 0,
                    left: 0,
                    position: 'absolute',
                    top: 0,
                    width: 0,
                }}
            >
                {cardTooltip}
            </div>
        </div>
    );
};
