import { CircularContainer } from './circularContainer';
import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
} from './commonTypes';
import { IslandType } from './commonTypes';

interface BoardProps {
    gameState: GameSerialized;
    onCharacterClicked?: (
        island: IslandSerialized,
        character: CharacterSerialized,
    ) => void;
    onIslandClicked?: (island: IslandSerialized) => void;
}

export const Board = (props: BoardProps) => {
    const fontSize = '18px';

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
                                cursor: props.onIslandClicked ? 'pointer' : '',
                                fontSize,
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
                                            props.gameState.you
                                                ? 'skyblue'
                                                : 'indianred',
                                        cursor: props.onCharacterClicked
                                            ? 'pointer'
                                            : '',
                                        fontSize,
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
                );
            })}
        />
    );
};
