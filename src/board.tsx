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
import { getCharacterImage } from './images/characterImages';

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
                border: '1px solid',
                borderRadius: '4px',
                height: '20px',
                left: '-6px',
                position: 'absolute',
                textAlign: 'center',
                top: '-7px',
                width: '20px',
            }}
        >
            <div
                style={{
                    alignItems: 'center',
                    background: colors.island,
                    borderRadius: '2px',
                    color: colors.text,
                    display: 'flex',
                    fontSize: '12pt',
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
                {props.island.islandNumber ===
                    gameContext.game.players[PlayerDesignator.PLAYER_A]
                        .netIsland ||
                props.island.islandNumber ===
                    gameContext.game.players[PlayerDesignator.PLAYER_B]
                        .netIsland
                    ? Emoji.net
                    : ''}
                {props.island.islandNumber === gameContext.game.nextIslandToSink
                    ? Emoji.storm
                    : ''}
            </div>
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
    readonly width: number;
    readonly character: CharacterSerialized;
    readonly onClick: (() => void) | undefined;
    readonly highlight: boolean;
}) => {
    const gameContext = React.use(GameContext);

    const characterColor =
        props.character.playerDesignator === gameContext.you
            ? 'dodgerblue'
            : 'red';

    return (
        <div
            style={{
                alignItems: 'center',
                background: characterColor,
                border: `${0.05 * props.width}px solid ${characterColor}`,
                borderRadius: '50%',
                boxShadow: '2px 2px',
                display: 'flex',
                flexDirection: 'column',
                height: props.width,
                position: 'relative',
                width: props.width,
            }}
            onClick={() => {
                if (props.onClick) {
                    props.onClick();
                }
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
                {props.character.strength / 10}
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
                    alignItems: 'flex-end',
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
                <div
                    style={{
                        alignContent: 'flex-start',
                        background: '#abcd2399',
                        bottom: `-${props.width / 11}px`,
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        flexWrap: 'wrap',
                        height: `${(props.width * 3) / 4}px`,
                        left: `-${props.width / 11}px`,
                        position: 'absolute',
                        width: `${props.width}px`,
                    }}
                >
                    {props.island.characters.map((character, index) => {
                        return (
                            <Character
                                key={index}
                                character={character}
                                highlight={index === highlightCharacterIndex}
                                width={props.width / 3}
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
        </div>
    );
};

export const Board = (props: BoardProps) => {
    const gameContext = React.use(GameContext);

    return (
        <CircularContainer
            items={gameContext.game.islands}
            renderItem={(island, itemWidth) => {
                return (
                    <Island
                        key={island.islandNumber}
                        highlight={
                            props.highlightIslandNumber === island.islandNumber
                        }
                        highlightCharacter={props.highlightCharacter}
                        island={island}
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
    );
};
