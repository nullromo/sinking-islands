import * as React from 'react';
import { createPortal } from 'react-dom';
import { CoordinatesContext } from '../../../contexts/coordinatesContext';
import { GameContext } from '../../../contexts/gameContext';
import { MousePositionContext } from '../../../contexts/mousePositionContext';
import type { CardType } from '../../../info/commonTypes';
import { boardElementID } from '../../../tutorial/elementIDs';
import { OnScreenCard } from '../onScreenCard';

export const SelectionArrow = (props: {
    readonly targetElementID: string | null;
    readonly color: string;
    readonly cardType: CardType;
}) => {
    const gameContext = React.use(GameContext);
    const coordinatesContext = React.use(CoordinatesContext);
    const { mousePosition } = React.use(MousePositionContext);

    const boardBox = coordinatesContext.getCoordinates(boardElementID);
    const targetBox =
        props.targetElementID === null
            ? null
            : coordinatesContext.getCoordinates(props.targetElementID);

    return createPortal(
        <div
            style={{
                left: 0,
                pointerEvents: 'none',
                position: 'fixed',
                top: 0,
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    textAlign: 'center',
                    transform: `translate(${boardBox.x + boardBox.width / 2 - 50}px, ${boardBox.y + boardBox.height / 2 - 67}px)`,
                    width: 'fit-content',
                }}
            >
                <OnScreenCard
                    card={{
                        cardType: props.cardType,
                        playerDesignator: gameContext.you,
                    }}
                    highlight={false}
                    onClick={undefined}
                />
            </div>
            <svg style={{ height: '100vw', width: '100vw' }}>
                <defs>
                    <marker
                        id='head'
                        markerHeight='10'
                        markerWidth='5'
                        orient='auto'
                        refX='4'
                        refY='5'
                    >
                        <path
                            d='M 1 1 L 5 5 L 1 9 L 0 8 L 3 5 L 0 2 Z'
                            fill={props.color}
                        />
                    </marker>
                </defs>
                <path
                    d={`M ${boardBox.x + boardBox.width / 2} ${boardBox.y + boardBox.height / 2} L ${targetBox ? targetBox.x + targetBox.width / 2 : mousePosition.x} ${targetBox ? targetBox.y + targetBox.height / 2 : mousePosition.y}`}
                    markerEnd='url(#head)'
                    style={{
                        fill: 'none',
                        stroke: props.color,
                        strokeWidth: 3,
                    }}
                />
            </svg>
        </div>,
        document.body,
    );
};
