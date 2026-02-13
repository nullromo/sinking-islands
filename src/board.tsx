import * as React from 'react';
import { CircularContainer } from './circularContainer';
import type {
    CharacterSerialized,
    IslandSerialized,
    TargetCharacter,
} from './commonTypes';
import { IslandType, PlayerDesignator } from './commonTypes';
import { GameContext } from './gameContext';
import { CharacterOperations } from './server/gameObjects/characterOperations';
import { getIslandImage } from './images/islandImages';
import { assertUnreachable } from './util';
import { Emoji } from './emoji';
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

const IslandNumberChip = (props: { readonly island: IslandSerialized }) => {
    const gameContext = React.use(GameContext);

    const colors = getIslandColors(props.island);

    return (
        <div
            style={{
                background: colors.island,
                borderBottom: `3px solid ${colors.island}`,
                borderRadius: '4px',
                borderRight: `3px solid ${colors.island}`,
                color: colors.text,
                fontSize: '14pt',
                left: '-10px',
                padding: '3px 3px 0px 6px',
                position: 'absolute',
                top: '-12px',
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
            {props.island.islandNumber ===
                gameContext.game.players[PlayerDesignator.PLAYER_A].netIsland ||
            props.island.islandNumber ===
                gameContext.game.players[PlayerDesignator.PLAYER_B].netIsland
                ? Emoji.net
                : ''}
            {props.island.islandNumber === gameContext.game.nextIslandToSink
                ? Emoji.storm
                : ''}
        </div>
    );
};

const TypeAndCapacityChip = (props: { readonly island: IslandSerialized }) => {
    return (
        <div
            style={{
                background: getIslandColors(props.island).island,
                bottom: '-3px',
                fontSize: '12pt',
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
    readonly character: CharacterSerialized;
    readonly onClick: (() => void) | undefined;
    readonly highlight: boolean;
}) => {
    const gameContext = React.use(GameContext);

    return (
        <div
            style={{
                alignItems: 'center',
                background:
                    props.character.playerDesignator === gameContext.you
                        ? 'skyblue'
                        : 'indianred',
                border: props.highlight ? '3px solid' : '',
                boxSizing: 'border-box',
                cursor: props.onClick ? 'pointer' : '',
                display: 'flex',
                fontSize: '18px',
                height: '27px',
                width: '50px',
            }}
            onClick={() => {
                if (props.onClick) {
                    props.onClick();
                }
            }}
        >
            {props.character.tortoise ? Emoji.tortoise : Emoji.person}
            {props.character.strength}
        </div>
    );
};

const Island = (props: {
    readonly island: IslandSerialized;
    readonly highlight: boolean;
    readonly highlightCharacter: TargetCharacter | undefined;
    readonly onClick: (() => void) | undefined;
    readonly onCharacterClicked:
        | ((character: CharacterSerialized) => void)
        | undefined;
}) => {
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
    return (
        <div
            key={props.island.islandNumber}
            style={{ height: '100%', width: '100%' }}
        >
            <div
                style={{
                    alignItems: 'flex-start',
                    backgroundImage: getIslandImage(props.island.islandNumber),
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    border: props.highlight
                        ? `6px solid ${colors.island}`
                        : `3px solid ${colors.island}`,
                    boxSizing: 'border-box',
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
                <IslandNumberChip island={props.island} />
                <TypeAndCapacityChip island={props.island} />
            </div>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                {props.island.characters.map((character, index) => {
                    return (
                        <Character
                            key={index}
                            character={character}
                            highlight={index === highlightCharacterIndex}
                            onClick={
                                props.onCharacterClicked
                                    ? () => {
                                          if (props.onCharacterClicked) {
                                              props.onCharacterClicked(
                                                  character,
                                              );
                                          }
                                      }
                                    : undefined
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
};

export const Board = (props: BoardProps) => {
    const gameContext = React.use(GameContext);

    return (
        <CircularContainer
            items={gameContext.game.islands.map((island) => {
                return (
                    <Island
                        key={island.islandNumber}
                        highlight={
                            props.highlightIslandNumber === island.islandNumber
                        }
                        highlightCharacter={props.highlightCharacter}
                        island={island}
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
            })}
        />
    );
};
