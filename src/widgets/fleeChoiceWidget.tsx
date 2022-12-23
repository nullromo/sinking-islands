import React from 'react';
import type { CharacterSerialized, PlayerDesignator } from '../commonTypes';
import { CharacterSelector } from './characterSelector';

interface FleeChoiceWidgetProps {
    submit: (character: CharacterSerialized) => void;
    you: PlayerDesignator;
}

export const FleeChoiceWidget = (props: FleeChoiceWidgetProps) => {
    const [characterChoice, setCharacterChoice] =
        React.useState<CharacterSerialized>({
            playerDesignator: props.you,
            strength: 20,
            tortoise: false,
        });

    return (
        <>
            {'Choose a character to flee'}
            <CharacterSelector
                character={characterChoice}
                setCharacter={setCharacterChoice}
            />

            <button
                type='button'
                onClick={() => {
                    props.submit(characterChoice);
                }}
            >
                Submit
            </button>
        </>
    );
};
