import * as React from 'react';
import type {
    CharacterSerialized,
    IslandSerialized,
    TargetCharacter,
} from '../commonTypes';
import { PlayerDesignator } from '../commonTypes';
import { GameContext } from '../gameContext';
import { hoverHighlightStyle } from '../hoverHighlightStyle';
import { getIslandImage } from '../images/islandImages';
import { getIslandColors } from '../islandColors';
import { NetOverlay } from '../netOverlay';
import { RisingWaterSpinner } from '../risingWaterSpinner';
import { CharacterOperations } from '../server/gameObjects/characterOperations';
import { island1ElementID, island3ElementID } from '../tutorial/elementIDs';
import { Character } from './character';
import { IslandCapacityChip } from './islandCapacityChip';
import { IslandNumberChip } from './islandNumberChip';

export interface IslandProps {
    readonly width: number;
    readonly island: IslandSerialized;
    readonly highlight: boolean;
    readonly highlightCharacter: TargetCharacter | undefined;
    readonly onClick: (() => void) | undefined;
    readonly onCharacterClicked:
        | ((character: CharacterSerialized) => void)
        | undefined;
    readonly setIslandHover: (hover: boolean) => void;
    readonly setHoveredCharacter: (
        character: CharacterSerialized | null,
    ) => void;
    readonly hoverHighlight: boolean;
    readonly hoveredCharacter: CharacterSerialized | null;
}

export const Island = (props: IslandProps) => {
    const gameContext = React.use(GameContext);

    const colors = getIslandColors(props.island);

    const highlightCharacterIndex = props.island.characters.findIndex(
        (character) => {
            return (
                props.island.islandNumber ===
                    props.highlightCharacter?.islandNumber &&
                CharacterOperations.equals(
                    character,
                    props.highlightCharacter.character,
                )
            );
        },
    );

    const characterRowStyle: React.CSSProperties = {
        alignContent: 'flex-start',
        bottom: `${props.width / 6}px`,
        display: 'flex',
        flexDirection: 'column-reverse',
        flexWrap: 'wrap',
        height: `${props.width / 3}px`,
        justifyContent: 'center',
        left: `-${(props.width * 2) / 11}px`,
        position: 'absolute',
    };

    const renderCharacters = (playerDesignator: PlayerDesignator) => {
        return props.island.characters
            .filter((character) => {
                return character.playerDesignator === playerDesignator;
            })
            .map((character, index) => {
                const hoverHighlight =
                    props.hoverHighlight &&
                    CharacterOperations.equals(
                        character,
                        props.hoveredCharacter,
                    );
                return (
                    <Character
                        key={index}
                        character={character}
                        highlight={index === highlightCharacterIndex}
                        hoverHighlight={hoverHighlight}
                        setCharacterHover={(hover) => {
                            if (hover) {
                                props.setHoveredCharacter(character);
                            } else {
                                props.setHoveredCharacter(null);
                            }
                        }}
                        shift={(index * props.width) / 7}
                        width={(props.width * 91) / 300}
                        onClick={
                            props.onCharacterClicked
                                ? () => {
                                      if (props.onCharacterClicked) {
                                          props.onCharacterClicked(character);
                                      }
                                  }
                                : undefined
                        }
                    />
                );
            });
    };

    return (
        <div
            key={props.island.islandNumber}
            id={
                props.island.islandNumber === 1
                    ? island1ElementID
                    : props.island.islandNumber === 3
                      ? island3ElementID
                      : ''
            }
            style={{ height: '100%', width: '100%' }}
            onMouseEnter={() => {
                props.setIslandHover(true);
            }}
            onMouseLeave={() => {
                props.setIslandHover(false);
            }}
        >
            <div
                style={{
                    alignItems: 'flex-end',
                    backgroundImage: getIslandImage(props.island.islandNumber),
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    border: `${(props.width * 3) / 140}px solid ${colors.island}`,
                    boxShadow:
                        props.hoverHighlight && !props.hoveredCharacter
                            ? hoverHighlightStyle
                            : '',
                    cursor: props.onClick ? 'pointer' : '',
                    display: 'flex',
                    fontSize: '18px',
                    height: '100%',
                    position: 'relative',
                    width: '100%',
                }}
                onClick={() => {
                    if (props.onClick) {
                        props.onClick();
                    }
                }}
            >
                {gameContext.game.nextIslandToSink ===
                props.island.islandNumber ? (
                    <RisingWaterSpinner width={props.width} />
                ) : null}
                {props.island.islandNumber ===
                    gameContext.game.players[PlayerDesignator.PLAYER_A]
                        .netIsland ||
                props.island.islandNumber ===
                    gameContext.game.players[PlayerDesignator.PLAYER_B]
                        .netIsland ? (
                    <NetOverlay width={props.width} />
                ) : null}

                <IslandNumberChip
                    island={props.island}
                    islandWidth={props.width}
                />
                <IslandCapacityChip
                    island={props.island}
                    islandWidth={props.width}
                />
                <div style={characterRowStyle}>
                    {renderCharacters(PlayerDesignator.PLAYER_A)}
                </div>
                <div
                    style={{
                        ...characterRowStyle,
                        bottom: `${(props.width / 6) * 3}px`,
                    }}
                >
                    {renderCharacters(PlayerDesignator.PLAYER_B)}
                </div>
            </div>
        </div>
    );
};
