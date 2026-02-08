import * as React from 'react';
import { CircularContainer } from './circularContainer';
import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
} from './commonTypes';
import { IslandType, PlayerDesignator } from './commonTypes';
import { GameContext } from './gameContext';
import { Character } from './server/gameObjects/character';
import type { TargetCharacter } from './server/gameObjects/player';

interface BoardProps {
    readonly gameState: GameSerialized;
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
            items={props.gameState.islands.map((island) => {
                const highlightCharacterIndex = island.characters.findIndex(
                    (character) => {
                        return (
                            island.islandNumber ===
                                props.highlightCharacter?.islandNumber &&
                            Character.deserialize(character).equals(
                                props.highlightCharacter.character,
                            )
                        );
                    },
                );
                return (
                    <div key={island.islandNumber}>
                        <div
                            style={{
                                alignItems: 'center',
                                background:
                                    island.islandType === IslandType.SACRED
                                        ? 'gold'
                                        : island.islandType ===
                                            IslandType.VOLCANO
                                          ? 'sandybrown'
                                          : 'mediumseagreen',
                                border:
                                    island.islandNumber ===
                                    props.highlightIslandNumber
                                        ? '3px solid'
                                        : '1px solid',
                                boxSizing: 'border-box',
                                cursor: props.onIslandClicked ? 'pointer' : '',
                                display: 'flex',
                                fontSize,
                                height: '28px',
                            }}
                            onClick={() => {
                                if (props.onIslandClicked) {
                                    props.onIslandClicked(island);
                                }
                            }}
                        >
                            <b>{`${island.islandNumber}`}</b>
                            {island.smallCapacity ? '👤' : '👥'}
                            {island.islandType === IslandType.SACRED
                                ? '🙏'
                                : island.islandType === IslandType.VOLCANO
                                  ? '🌋'
                                  : ''}
                            {island.islandNumber ===
                                props.gameState.players[
                                    PlayerDesignator.PLAYER_A
                                ].pilingsIsland ||
                            island.islandNumber ===
                                props.gameState.players[
                                    PlayerDesignator.PLAYER_B
                                ].pilingsIsland
                                ? '🏠'
                                : ''}
                            {island.islandNumber ===
                                props.gameState.players[
                                    PlayerDesignator.PLAYER_A
                                ].netIsland ||
                            island.islandNumber ===
                                props.gameState.players[
                                    PlayerDesignator.PLAYER_B
                                ].netIsland
                                ? '🥅'
                                : ''}
                            {island.islandNumber ===
                            props.gameState.nextIslandToSink
                                ? '⛈️'
                                : ''}
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
                                            height: '28px',
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
