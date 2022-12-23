import { CircularContainer } from './circularContainer';
import type { GameSerialized } from './commonTypes';
import { IslandType, PlayerDesignator } from './commonTypes';

interface BoardProps {
    gameState: GameSerialized;
}

export const Board = (props: BoardProps) => {
    return (
        <CircularContainer
            items={props.gameState.islands.map((island) => {
                return (
                    <div key={island.islandNumber}>
                        <div
                            style={{
                                background:
                                    island.islandType === IslandType.SACRED
                                        ? 'gold'
                                        : island.islandType ===
                                          IslandType.VOLCANO
                                        ? 'sandybrown'
                                        : 'mediumseagreen',
                                border: '1px solid',
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
                                props.gameState.islandModifiers
                                    .playerAPilings ||
                            island.islandNumber ===
                                props.gameState.islandModifiers.playerBPilings
                                ? '🏠'
                                : ''}
                            {island.islandNumber ===
                                props.gameState.islandModifiers.playerANet ||
                            island.islandNumber ===
                                props.gameState.islandModifiers.playerBNet
                                ? '🥅'
                                : ''}
                            {island.islandNumber ===
                            props.gameState.nextIslandToSink
                                ? '⛈️'
                                : ''}
                        </div>
                        {island.characters.map((character, index) => {
                            return (
                                <div
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                    style={{
                                        background:
                                            character.playerDesignator ===
                                            PlayerDesignator.PLAYER_A
                                                ? 'skyblue'
                                                : 'indianred',
                                    }}
                                    onClick={() => {
                                        console.log(
                                            'Clicked',
                                            island,
                                            character,
                                        );
                                    }}
                                >
                                    {character.tortoise ? '🐢' : '🧍'}
                                    {character.strength}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        />
    );
};
