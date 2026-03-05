import * as React from 'react';
import { MousePositionContext } from './mousePositionContext';

interface TooltipProps extends React.PropsWithChildren {
    readonly hover?: boolean;
    readonly style?: React.CSSProperties;
}

export const Tooltip = (props: TooltipProps) => {
    const { mousePosition, mouseQuadrant } = React.use(MousePositionContext);

    return (
        <div
            style={{
                height: 0,
                left: 0,
                pointerEvents: 'none',
                position: 'fixed',
                top: 0,
                width: 0,
                zIndex: 100,
            }}
        >
            <div
                style={{
                    border: '2px solid',
                    borderRadius: '4px',
                    position: 'absolute',
                    ...(mouseQuadrant === 1 || mouseQuadrant === 4
                        ? { right: -mousePosition.x }
                        : { left: mousePosition.x }),
                    ...(mouseQuadrant === 1 || mouseQuadrant === 2
                        ? { top: mousePosition.y }
                        : { bottom: -mousePosition.y }),
                    visibility: props.hover === false ? 'hidden' : 'visible',
                    ...props.style,
                }}
            >
                {props.children}
            </div>
        </div>
    );
};
