import { CircularContainer } from './circularContainer';
import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
} from './commonTypes';
import { IslandType } from './commonTypes';
import { Character } from './server/character';
import type { HarpoonTarget } from './server/player';

interface BoardProps {
    gameState: GameSerialized;
    onCharacterClicked?: (
        island: IslandSerialized,
        character: CharacterSerialized,
    ) => void;
    onIslandClicked?: (island: IslandSerialized) => void;
    highlightCharacter?: HarpoonTarget;
    highlightIslandNumber?: number;
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
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={index}
                                        style={{
                                            alignItems: 'center',
                                            background:
                                                character.playerDesignator ===
                                                props.gameState.you
                                                    ? 'skyblue'
                                                    : 'indianred',
                                            border:
                                                island.islandNumber ===
                                                    props.highlightCharacter
                                                        ?.islandNumber &&
                                                Character.deserialize(
                                                    character,
                                                ).equals(
                                                    props.highlightCharacter
                                                        .character,
                                                )
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
