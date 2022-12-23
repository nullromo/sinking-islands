import type { CharacterSerialized } from '../commonTypes';
import { CharacterSelector } from './characterSelector';
import { IslandSelector } from './islandSelector';

interface NormalMovementSelectorProps {
    fromIsland: number;
    setFromIsland: (islandNumber: number) => void;
    toIsland: number;
    setToIsland: (islandNumber: number) => void;
    character: CharacterSerialized;
    setCharacter: (character: CharacterSerialized) => void;
}

export const NormalMovementSelector = (props: NormalMovementSelectorProps) => {
    return (
        <>
            {'Choose normal movement'}
            <IslandSelector
                islandNumber={props.fromIsland}
                setIslandNumber={props.setFromIsland}
            />
            <IslandSelector
                islandNumber={props.toIsland}
                setIslandNumber={props.setToIsland}
            />
            <CharacterSelector
                character={props.character}
                setCharacter={props.setCharacter}
            />
        </>
    );
};
