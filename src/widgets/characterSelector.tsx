import type { CharacterSerialized } from '../commonTypes';

interface CharacterSelectorProps {
    character: CharacterSerialized;
    setCharacter: (character: CharacterSerialized) => void;
}

export const CharacterSelector = (props: CharacterSelectorProps) => {
    return (
        <>
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
