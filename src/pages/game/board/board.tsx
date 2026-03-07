import * as React from 'react';
import { GameContext } from '../../../contexts/gameContext';
import type {
    CharacterSerialized,
    IslandSerialized,
    TargetCharacter,
} from '../../../info/commonTypes';
import { boardElementID } from '../../../tutorial/elementIDs';
import { CircularContainer } from '../circularContainer';
import { CharacterTooltip } from './characterTooltip';
import { Island } from './island';
import { IslandTooltip } from './islandTooltip';
import { useCoordinatesRef } from '../../../hooks/useCoordinatesRef';

interface BoardProps {
    readonly onCharacterClicked?: (
        island: IslandSerialized,
        character: CharacterSerialized,
        playerIndex: number,
    ) => void;
    readonly onIslandClicked?: (island: IslandSerialized) => void;
    readonly highlightCharacter?: TargetCharacter;
    readonly highlightIslandNumber?: number;
}

export const Board = (props: BoardProps) => {
    const gameContext = React.use(GameContext);

    const [hoveredIsland, setHoveredIsland] =
        React.useState<IslandSerialized | null>(null);
    const [hoveredCharacter, setHoveredCharacter] =
        React.useState<CharacterSerialized | null>(null);

    const boardRef = useCoordinatesRef(boardElementID);

    return (
        <div
            ref={boardRef}
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
