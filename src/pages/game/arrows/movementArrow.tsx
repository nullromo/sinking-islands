import * as React from 'react';
import { createPortal } from 'react-dom';
import { CoordinatesContext } from '../../../contexts/coordinatesContext';
import { MousePositionContext } from '../../../contexts/mousePositionContext';
import { boardElementID } from '../../../tutorial/elementIDs';

export const MovementArrow = (props: {
    readonly characterElementID: string;
    readonly islandElementID: string | null;
    readonly color: string;
}) => {
    const coordinatesContext = React.use(CoordinatesContext);
    const { mousePosition } = React.use(MousePositionContext);

    const characterBox = coordinatesContext.getCoordinates(
        props.characterElementID,
    );
    const boardBox = coordinatesContext.getCoordinates(boardElementID);
    const islandBox =
        props.islandElementID === null
            ? null
            : coordinatesContext.getCoordinates(props.islandElementID);

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
                    d={`M ${characterBox.x + characterBox.width / 2} ${characterBox.y + characterBox.height / 2} S ${boardBox.x + boardBox.width / 2} ${boardBox.y + boardBox.height / 2} ${islandBox ? islandBox.x + islandBox.width / 2 : mousePosition.x} ${islandBox ? islandBox.y + islandBox.height / 2 : mousePosition.y}`}
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
