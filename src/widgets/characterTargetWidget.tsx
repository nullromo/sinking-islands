import React from 'react';
import type { CharacterSerialized, PlayerDesignator } from '../commonTypes';
import type { HarpoonTarget, TortoiseTarget } from '../server/player';
import { CharacterSelector } from './characterSelector';
import { IslandSelector } from './islandSelector';

interface CharacterTargetWidgetProps {
    submit: (target: HarpoonTarget | TortoiseTarget) => void;
    player: PlayerDesignator;
}

export const CharacterTargetWidget = (props: CharacterTargetWidgetProps) => {
    const [characterChoice, setCharacterChoice] =
        React.useState<CharacterSerialized>({
            playerDesignator: props.player,
            strength: 20,
            tortoise: false,
        });
    const [islandNumberChoice, setIslandNumberChoice] = React.useState(1);

    return (
        <>
            {'Target a character'}
            <CharacterSelector
                character={characterChoice}
                setCharacter={setCharacterChoice}
            />
            <IslandSelector
                islandNumber={islandNumberChoice}
                setIslandNumber={setIslandNumberChoice}
            />
            <button
                type='button'
                onClick={() => {
                    props.submit({
                        character: characterChoice,
                        islandNumber: islandNumberChoice,
                    });
                }}
            >
                Submit
            </button>
        </>
    );
};
