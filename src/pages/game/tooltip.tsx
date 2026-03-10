import * as React from 'react';
import { MousePositionContext } from '../../contexts/mousePositionContext';

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

interface TooltipDivProps extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
> {
    readonly tooltipChild: React.JSX.Element;
    readonly tooltipStyle?: React.CSSProperties;
}

export const TooltipDiv = (props: TooltipDivProps) => {
    // eslint-disable-next-line react/destructuring-assignment
    const {
        tooltipChild: tooltipChildren,
        tooltipStyle,
        children,
        ...rest
    } = props;

    const [hover, setHover] = React.useState(false);

    return (
        <div
            {...rest}
            onMouseEnter={() => {
                setHover(true);
            }}
            onMouseLeave={() => {
                setHover(false);
            }}
        >
            {children}
            <Tooltip hover={hover} style={tooltipStyle}>
                {tooltipChildren}
            </Tooltip>
        </div>
    );
};
