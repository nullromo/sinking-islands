import * as React from 'react';
import { GameContext } from '../../../contexts/gameContext';
import type { PlayerDesignator } from '../../../info/commonTypes';
import { getPlayerColor } from '../../../info/playerColors';
import { TooltipDiv } from '../tooltip';

export const GameInfoIcon = (props: {
    readonly playerDesignator: PlayerDesignator;
    readonly clickable: boolean;
    readonly tooltipTitle: string;
    readonly tooltipBody: React.JSX.Element;
    readonly iconLabel: number | string;
    readonly viewBox: string;
    readonly shape: Array<{ points: string; transform?: string }>;
    readonly labelPosition: { top: number; left: number };
}) => {
    const gameContext = React.use(GameContext);

    return (
        <TooltipDiv
            style={{
                cursor: 'help',
                position: 'relative',
                userSelect: 'none',
                width: '50px',
            }}
            tooltipChild={
                <>
                    <div
                        style={{
                            borderBottom: '2px solid',
                            textAlign: 'center',
                        }}
                    >
                        {props.tooltipTitle}
                        {props.clickable ? (
                            <>
                                <br /> <em>Click to view</em>
                            </>
                        ) : null}{' '}
                    </div>
                    {props.tooltipBody}
                </>
            }
            tooltipStyle={{
                background: getPlayerColor(
                    props.playerDesignator,
                    gameContext.you,
                ).dim,
                width: '150px',
            }}
        >
            <span
                style={{
                    color: 'red',
                    fontSize: '17pt',
                    height: '100%',
                    left: props.labelPosition.left,
                    position: 'absolute',
                    textAlign: 'center',
                    top: props.labelPosition.top,
                    width: '50px',
                    zIndex: 10,
                }}
            >
                {props.iconLabel}
            </span>
            <svg
                style={{
                    fill: 'white',
                    position: 'relative',
                    stroke: 'black',
                    strokeLinejoin: 'round',
                    strokeWidth: '1.4',
                }}
                viewBox={props.viewBox}
            >
                {props.shape.map(({ points, transform }, index) => {
                    return (
                        <polygon
                            key={index}
                            points={points}
                            transform={transform}
                        />
                    );
                })}
            </svg>
        </TooltipDiv>
    );
};
