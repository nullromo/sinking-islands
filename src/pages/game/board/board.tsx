import * as React from 'react';
import { GameContext } from '../../../contexts/gameContext';
import type {
    CharacterSerialized,
    IslandSerialized,
} from '../../../info/commonTypes';
import { CircularContainer } from '../circularContainer';
import { CharacterTooltip } from './characterTooltip';
import { Island } from './island';
import { IslandTooltip } from './islandTooltip';

interface BoardProps {
    readonly onCharacterClicked?: (
        island: IslandSerialized,
        character: CharacterSerialized,
        playerIndex: number,
    ) => void;
    readonly onIslandClicked?: (island: IslandSerialized) => void;
    readonly highlightCharacter?: (
        islandNumber: number,
        character: CharacterSerialized,
        playerIndex: number,
    ) => boolean;
    readonly highlightIsland?: (island: IslandSerialized) => boolean;
}

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
                                props.highlightIsland
                                    ? props.highlightIsland(island)
                                    : false
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
                                    ? (character, playerIndex) => {
                                          if (props.onCharacterClicked) {
                                              props.onCharacterClicked(
                                                  island,
                                                  character,
                                                  playerIndex,
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
