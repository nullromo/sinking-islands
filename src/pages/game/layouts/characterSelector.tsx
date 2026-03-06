import type { CharacterSerialized } from '../../../info/commonTypes';

interface CharacterSelectorProps {
    readonly character: CharacterSerialized;
    readonly setCharacter: (character: CharacterSerialized) => void;
}

export const CharacterSelector = (props: CharacterSelectorProps) => {
    return (
        <>
            {'Choose a character'}
            <select
                value={props.character.strength}
                onChange={(event) => {
                    props.setCharacter({
                        ...props.character,
                        strength: Number(event.target.value),
                    });
                }}
            >
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
            </select>
            <input
                checked={props.character.tortoise}
                type='checkbox'
                onChange={(event) => {
                    props.setCharacter({
                        ...props.character,
                        tortoise: event.target.checked,
                    });
                }}
            />
        </>
    );
};
