import * as React from 'react';
import { GameContext } from '../../../contexts/gameContext';
import { useCoordinatesRef } from '../../../hooks/useCoordinatesRef';
import { getCharacterImage } from '../../../images/characterImages';
import type { CharacterSerialized } from '../../../info/commonTypes';
import { getPlayerColor } from '../../../info/playerColors';
import { highlightStyle, hoverHighlightStyle } from '../hoverHighlightStyle';

export interface CharacterProps {
    readonly width: number;
    readonly character: CharacterSerialized;
    readonly onClick: (() => void) | undefined;
    readonly highlight: boolean;
    readonly shift: number;
    readonly setCharacterHover: (hover: boolean) => void;
    readonly hoverHighlight: boolean;
    readonly id: string;
}

export const Character = (props: CharacterProps) => {
    const gameContext = React.use(GameContext);

    const characterColor = getPlayerColor(
        props.character.playerDesignator,
        gameContext.you,
    );

    const characterRef = useCoordinatesRef(props.id);

    return (
        <div
            ref={characterRef}
            style={{
                alignItems: 'center',
                border: `${0.05 * props.width}px solid ${characterColor.bright}`,
                borderRadius: '50%',
                boxShadow: props.hoverHighlight
                    ? hoverHighlightStyle
                    : props.highlight
                      ? highlightStyle
                      : `${props.width * 0.04}px ${props.width * 0.04}px black`,
                display: 'flex',
                flexDirection: 'column',
                height: props.width,
                position: 'absolute',
                transform: `translatex(${props.shift}px)`,
                width: props.width,
                zIndex: props.hoverHighlight ? 2 : 1,
            }}
            onClick={() => {
                if (props.onClick) {
                    props.onClick();
                }
            }}
            onMouseEnter={() => {
                props.setCharacterHover(true);
            }}
            onMouseLeave={() => {
                props.setCharacterHover(false);
            }}
        >
            <div
                style={{
                    alignItems: 'center',
                    backgroundImage: getCharacterImage(
                        gameContext.you,
                        props.character,
                    ),
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    borderRadius: '50%',
                    boxSizing: 'border-box',
                    cursor: props.onClick ? 'pointer' : '',
                    display: 'flex',
                    height: props.width,
                    width: props.width,
                }}
            />
            <div
                style={{
                    alignItems: 'center',
                    background: props.character.tortoise ? 'green' : 'black',
                    border: props.character.tortoise
                        ? '3px solid darkgreen'
                        : '',
                    borderRadius: '50%',
                    boxSizing: 'border-box',
                    color: 'white',
                    display: 'flex',
                    fontSize: `${props.width / 2.8}px`,
                    height: `${props.width / 2.4}px`,
                    justifyContent: 'center',
                    left: 0,
                    position: 'absolute',
                    top: 0,
                    width: `${props.width / 2.4}px`,
                }}
            >
                {props.character.strength}
            </div>
        </div>
    );
};
