import * as React from 'react';
import { GameContext } from '../../contexts/gameContext';
import { getCardImage } from '../../images/cardImages';
import { getCardDescription } from '../../info/cardDescription';
import type { CardSerialized, FaceDownCard } from '../../info/commonTypes';
import { CardType, cardTypeToString } from '../../info/commonTypes';
import { getPlayerColor } from '../../info/playerColors';
import { hoverHighlightStyle } from './hoverHighlightStyle';
import { Tooltip } from './tooltip';

interface OnScreenCardProps {
    readonly card: CardSerialized | FaceDownCard;
    readonly onClick: (() => void) | undefined;
    readonly highlight: boolean;
}

export const OnScreenCard = (props: OnScreenCardProps) => {
    const gameContext = React.use(GameContext);

    const [hover, setHover] = React.useState(false);

    const backgroundColor = getPlayerColor(
        props.card.playerDesignator,
        gameContext.you,
    ).dim;

    const makeCardTitle = (short: boolean) => {
        return (
            <span style={{ userSelect: 'none', verticalAlign: 'middle' }}>
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
        <Tooltip
            hover={hover}
            style={{ background: backgroundColor, width: '200px' }}
        >
            <div style={{ borderBottom: '2px solid' }}>
                {makeCardTitle(false)}
            </div>
            <div>{getCardDescription(props.card.cardType)}</div>
        </Tooltip>
    );

    return (
        <div
            style={{
                alignItems: 'center',
                background: backgroundColor,
                border: '2px solid',
                borderRadius: '4px',
                boxShadow: hover ? hoverHighlightStyle : '',
                boxSizing: 'border-box',
                cursor: props.onClick ? 'pointer' : '',
                display: 'flex',
                flexDirection: 'column',
                height: '125px',
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
            {cardTooltip}
        </div>
    );
};
