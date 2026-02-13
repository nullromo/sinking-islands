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
interface BoardProps {
    readonly onCharacterClicked?: (
        island: IslandSerialized,
        character: CharacterSerialized,
    ) => void;
    readonly onIslandClicked?: (island: IslandSerialized) => void;
    readonly highlightCharacter?: TargetCharacter;
    readonly highlightIslandNumber?: number;
}

export const Board = (props: BoardProps) => {
    const gameContext = React.use(GameContext);

    const fontSize = '18px';

    return (
        <CircularContainer
            items={gameContext.game.islands.map((island) => {
                const [islandColor, textColor] = (() => {
                    switch (island.islandType) {
                        case IslandType.SACRED:
                            return ['#ffc532', 'black'];
                        case IslandType.VOLCANO:
                            return ['crimson', 'black'];
                        case IslandType.NORMAL:
                            return ['deepskyblue', 'black'];
                        default:
                            return assertUnreachable(island.islandType);
                    }
                })();

                const highlightCharacterIndex = island.characters.findIndex(
                    (character) => {
                        return (
                            island.islandNumber ===
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
                        key={island.islandNumber}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <div
                            style={{
                                alignItems: 'flex-start',
                                backgroundImage: getIslandImage(
                                    island.islandNumber,
                                ),
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                border:
                                    island.islandNumber ===
                                    props.highlightIslandNumber
                                        ? `6px solid ${islandColor}`
                                        : `3px solid ${islandColor}`,
                                boxSizing: 'border-box',
                                cursor: props.onIslandClicked ? 'pointer' : '',
                                display: 'flex',
                                fontSize,
                                height: '100%',
                                position: 'relative',
                                width: '100%',
                            }}
                            onClick={() => {
                                if (props.onIslandClicked) {
                                    props.onIslandClicked(island);
                                }
                            }}
                        >
                            <div
                                style={{
                                    background: islandColor,
                                    borderBottom: `3px solid ${islandColor}`,
                                    borderRadius: '4px',
                                    borderRight: `3px solid ${islandColor}`,
                                    color: textColor,
                                    fontSize: '14pt',
                                    left: '-10px',
                                    padding: '3px 3px 0px 6px',
                                    position: 'absolute',
                                    top: '-12px',
                                }}
                            >
                                <b>{`${island.islandNumber} `}</b>
                                {island.islandNumber ===
                                    gameContext.game.players[
                                        PlayerDesignator.PLAYER_A
                                    ].pilingsIsland ||
                                island.islandNumber ===
                                    gameContext.game.players[
                                        PlayerDesignator.PLAYER_B
                                    ].pilingsIsland
                                    ? '🏠'
                                    : ''}
                                {island.islandNumber ===
                                    gameContext.game.players[
                                        PlayerDesignator.PLAYER_A
                                    ].netIsland ||
                                island.islandNumber ===
                                    gameContext.game.players[
                                        PlayerDesignator.PLAYER_B
                                    ].netIsland
                                    ? '🥅'
                                    : ''}
                                {island.islandNumber ===
                                gameContext.game.nextIslandToSink
                                    ? '⛈️'
                                    : ''}
                            </div>
                            <div
                                style={{
                                    background: islandColor,
                                    bottom: '-3px',
                                    fontSize: '12pt',
                                    padding: '0 1px 3px 0',
                                    position: 'absolute',
                                    right: '-3px',
                                }}
                            >
                                <span
                                    style={{
                                        color: 'transparent',
                                        textShadow: '0 0 0 black',
                                    }}
                                >
                                    {island.smallCapacity ? '👤' : '👥'}
                                </span>
                                {island.islandType === IslandType.SACRED
                                    ? '🙏🏼'
                                    : island.islandType === IslandType.VOLCANO
                                      ? '🌋'
                                      : ''}
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                            }}
                        >
                            {island.characters.map((character, index) => {
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            alignItems: 'center',
                                            background:
                                                character.playerDesignator ===
                                                gameContext.you
                                                    ? 'skyblue'
                                                    : 'indianred',
                                            border:
                                                index ===
                                                highlightCharacterIndex
                                                    ? '3px solid'
                                                    : '',
                                            boxSizing: 'border-box',
                                            cursor: props.onCharacterClicked
                                                ? 'pointer'
                                                : '',
                                            display: 'flex',
                                            fontSize,
                                            height: '27px',
                                            width: '50px',
                                        }}
                                        onClick={() => {
                                            if (props.onCharacterClicked) {
                                                props.onCharacterClicked(
                                                    island,
                                                    character,
                                                );
                                            }
                                        }}
                                    >
                                        {character.tortoise ? '🐢' : '🧍'}
                                        {character.strength}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        />
    );
};
