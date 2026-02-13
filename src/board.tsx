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

export const Board = (props: BoardProps) => {
    const gameContext = React.use(GameContext);

    const fontSize = '18px';

    return (
        <CircularContainer
            items={gameContext.game.islands.map((island) => {
                const colors = getIslandColors(island);

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
                                        ? `6px solid ${colors.island}`
                                        : `3px solid ${colors.island}`,
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
                            <IslandNumberChip island={island} />
                            <TypeAndCapacityChip island={island} />
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
                                        {character.tortoise
                                            ? Emoji.tortoise
                                            : Emoji.person}
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
