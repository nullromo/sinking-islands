import * as React from 'react';
import { CircularContainer } from './circularContainer';
import type {
    CharacterSerialized,
    IslandSerialized,
    TargetCharacter,
} from './commonTypes';
import { IslandType, PlayerDesignator } from './commonTypes';
import { Emoji } from './emoji';
import { GameContext } from './gameContext';
import { hoverHighlightStyle } from './hoverHighlightStyle';
import { getCharacterImage } from './images/characterImages';
import { getIslandImage } from './images/islandImages';
import { NetOverlay } from './netOverlay';
import { getPlayerColor } from './playerColors';
import { RisingWaterSpinner } from './risingWaterSpinner';
import { CharacterOperations } from './server/gameObjects/characterOperations';
import { Tooltip } from './tooltip';
import { assertUnreachable } from './util';

interface BoardProps {
    readonly onCharacterClicked?: (
        island: IslandSerialized,
        character: CharacterSerialized,
    ) => void;
    readonly onIslandClicked?: (island: IslandSerialized) => void;
    readonly highlightCharacter?: TargetCharacter;
    readonly highlightIslandNumber?: number;
}

const getIslandColors = (island: IslandSerialized) => {
    switch (island.islandType) {
        case IslandType.SACRED:
            return { island: '#ffc532', text: 'black' };
        case IslandType.VOLCANO:
            return { island: 'crimson', text: 'black' };
        case IslandType.NORMAL:
            return { island: 'deepskyblue', text: 'black' };
        default:
            return assertUnreachable(island.islandType);
    }
};

const IslandNumberChip = (props: {
    readonly island: IslandSerialized;
    readonly islandWidth: number;
}) => {
    const gameContext = React.use(GameContext);

    const colors = getIslandColors(props.island);

    return (
        <div
            style={{
                border: '1px solid',
                borderRadius: '4px',
                height: `${props.islandWidth / 7}px`,
                left: `-${(props.islandWidth * 3) / 70}px`,
                position: 'absolute',
                textAlign: 'center',
                top: `-${props.islandWidth / 20}px`,
                width: `${props.islandWidth / 7}px`,
            }}
        >
            <div
                style={{
                    alignItems: 'center',
                    background: colors.island,
                    borderRadius: '2px',
                    color: colors.text,
                    display: 'flex',
                    fontSize: `${props.islandWidth / 8.75}px`,
                    height: '100%',
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                <b>{`${props.island.islandNumber} `}</b>
                {props.island.islandNumber ===
                    gameContext.game.players[PlayerDesignator.PLAYER_A]
                        .pilingsIsland ||
                props.island.islandNumber ===
                    gameContext.game.players[PlayerDesignator.PLAYER_B]
                        .pilingsIsland
                    ? Emoji.house
                    : ''}
            </div>
        </div>
    );
};

const TypeAndCapacityChip = (props: {
    readonly island: IslandSerialized;
    readonly islandWidth: number;
}) => {
    return (
        <div
            style={{
                background: getIslandColors(props.island).island,
                bottom: '-3px',
                fontSize: `${props.islandWidth / 8.75}px`,
                height: `${props.islandWidth / 6}px`,
                padding: '0 1px 3px 0',
                position: 'absolute',
                right: '-3px',
            }}
        >
            <span style={{ color: 'transparent', textShadow: '0 0 0 black' }}>
                {props.island.smallCapacity ? Emoji.alone : Emoji.together}
            </span>
            {props.island.islandType === IslandType.SACRED
                ? Emoji.pray
                : props.island.islandType === IslandType.VOLCANO
                  ? Emoji.volcano
                  : ''}
        </div>
    );
};

const Character = (props: {
    readonly width: number;
    readonly character: CharacterSerialized;
    readonly onClick: (() => void) | undefined;
    readonly highlight: boolean;
    readonly shift: number;
    readonly setCharacterHover: (hover: boolean) => void;
    readonly hoverHighlight: boolean;
}) => {
    const gameContext = React.use(GameContext);

    const characterColor = getPlayerColor(
        props.character.playerDesignator,
        gameContext.you,
    );

    return (
        <div
            style={{
                alignItems: 'center',
                border: `${0.05 * props.width}px solid ${characterColor.bright}`,
                borderRadius: '50%',
                boxShadow: props.hoverHighlight
                    ? hoverHighlightStyle
                    : '2px 2px',
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
                    background: 'black',
                    borderRadius: '50%',
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
                {props.character.tortoise ? Emoji.tortoise : ''}
                {props.character.strength}
            </div>
        </div>
    );
};

const Island = (props: {
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
}) => {
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
                <TypeAndCapacityChip
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

const headerStyle: React.CSSProperties = {
    paddingRight: '10px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
};

const IslandTooltip = (props: { readonly island: IslandSerialized }) => {
    const gameContext = React.use(GameContext);

    const islandColors = getIslandColors(props.island);

    const playerANetted =
        gameContext.game.players[PlayerDesignator.PLAYER_A].netIsland ===
        props.island.islandNumber;
    const playerBNetted =
        gameContext.game.players[PlayerDesignator.PLAYER_B].netIsland ===
        props.island.islandNumber;

    return (
        <Tooltip
            style={{ background: islandColors.island, width: 'fit-content' }}
        >
            <div style={{ borderBottom: '2px solid', textAlign: 'center' }}>
                Island {props.island.islandNumber}
            </div>
            <div style={{ background: 'lightgray', padding: '4px' }}>
                <table>
                    <tbody>
                        <tr>
                            <th style={headerStyle}>Type</th>
                            <td>
                                <b
                                    style={{
                                        background: islandColors.island,
                                        boxShadow: `0px 0px 6px 1px ${islandColors.island}`,
                                        padding: '0px 4px 0px 4px',
                                    }}
                                >
                                    {props.island.islandType}
                                </b>
                            </td>
                        </tr>
                        <tr>
                            <th style={headerStyle}>Capacity</th>
                            <td>
                                {props.island.smallCapacity
                                    ? 'Limited'
                                    : 'Unlimited'}
                            </td>
                        </tr>
                        <tr>
                            <th style={headerStyle}>Your strength</th>
                            <td>
                                {props.island.characters.reduce(
                                    (total, character) => {
                                        return character.playerDesignator ===
                                            gameContext.you
                                            ? total + character.strength
                                            : total;
                                    },
                                    0,
                                )}
                            </td>
                        </tr>
                        <tr>
                            <th style={headerStyle}>Enemy strength</th>
                            <td>
                                {props.island.characters.reduce(
                                    (total, character) => {
                                        return character.playerDesignator !==
                                            gameContext.you
                                            ? total + character.strength
                                            : total;
                                    },
                                    0,
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div
                    style={{
                        marginTop: '2px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {playerANetted || playerBNetted ? (
                        <em style={{ color: 'saddlebrown' }}>
                            <b>
                                {`Island ensnared by Player ${playerANetted ? 'A' : 'B'}'s net.`}
                            </b>
                        </em>
                    ) : null}
                </div>
                <div style={{ marginTop: '2px', textAlign: 'center' }}>
                    {gameContext.game.nextIslandToSink ===
                    props.island.islandNumber ? (
                        <em style={{ color: '#c72727' }}>
                            <b>This island is sinking!</b>
                        </em>
                    ) : null}
                </div>
            </div>
        </Tooltip>
    );
};

const CharacterTooltip = (props: {
    readonly character: CharacterSerialized;
}) => {
    const gameContext = React.use(GameContext);

    return (
        <Tooltip
            style={{
                background: getPlayerColor(
                    props.character.playerDesignator,
                    gameContext.you,
                ).dim,
                width: 'fit-content',
            }}
        >
            <div style={{ borderBottom: '2px solid', textAlign: 'center' }}>
                {props.character.playerDesignator === gameContext.you
                    ? 'Your'
                    : 'Enemy'}{' '}
                Character
            </div>
            <div style={{ background: 'lightgray', padding: '4px' }}>
                <table>
                    <tbody>
                        <tr>
                            <th style={headerStyle}>Strength</th>
                            <td>{props.character.strength}</td>
                        </tr>
                        <tr>
                            <th style={headerStyle}>Type</th>
                            <td>
                                {props.character.tortoise
                                    ? 'Tortoise'
                                    : 'Human'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Tooltip>
    );
};

export const Board = (props: BoardProps) => {
    const gameContext = React.use(GameContext);

    const [hoveredIsland, setHoveredIsland] =
        React.useState<IslandSerialized | null>(null);
    const [hoveredCharacter, setHoveredCharacter] =
        React.useState<CharacterSerialized | null>(null);

    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                maxHeight: '100vh',
                maxWidth: '100vh',
                width: '100%',
            }}
        >
            <CircularContainer
                items={gameContext.game.islands}
                renderItem={(island, itemWidth) => {
                    return (
                        <Island
                            key={island.islandNumber}
                            highlight={
                                props.highlightIslandNumber ===
                                island.islandNumber
                            }
                            highlightCharacter={props.highlightCharacter}
                            hoverHighlight={
                                hoveredIsland?.islandNumber ===
                                island.islandNumber
                            }
                            hoveredCharacter={hoveredCharacter}
                            island={island}
                            setHoveredCharacter={setHoveredCharacter}
                            setIslandHover={(hover) => {
                                if (hover) {
                                    setHoveredIsland(island);
                                } else {
                                    setHoveredIsland(null);
                                }
                            }}
                            width={itemWidth}
                            onCharacterClicked={
                                props.onCharacterClicked
                                    ? (character: CharacterSerialized) => {
                                          if (props.onCharacterClicked) {
                                              props.onCharacterClicked(
                                                  island,
                                                  character,
                                              );
                                          }
                                      }
                                    : undefined
                            }
                            onClick={
                                props.onIslandClicked
                                    ? () => {
                                          if (props.onIslandClicked) {
                                              props.onIslandClicked(island);
                                          }
                                      }
                                    : undefined
                            }
                        />
                    );
                }}
            />
            {hoveredCharacter ? (
                <CharacterTooltip character={hoveredCharacter} />
            ) : hoveredIsland === null ? null : (
                <IslandTooltip island={hoveredIsland} />
            )}
        </div>
    );
};
