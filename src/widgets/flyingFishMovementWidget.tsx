import React from 'react';
import type { CharacterSerialized, PlayerDesignator } from '../commonTypes';
import type { FlyingFishMovement } from '../server/player';
import { NormalMovementSelector } from './normalMovementSelector';

interface FlyingFishMovementWidgetProps {
    submit: (flyingFishMovement: FlyingFishMovement) => void;
    you: PlayerDesignator;
}

export const FlyingFishMovementWidget = (
    props: FlyingFishMovementWidgetProps,
) => {
    const [fromIslandChoice, setFromIslandChoice] = React.useState(1);
    const [toIslandChoice, setToIslandChoice] = React.useState(1);
    const [characterChoice, setCharacterChoice] =
        React.useState<CharacterSerialized>({
            playerDesignator: props.you,
            strength: 20,
            tortoise: false,
        });

    return (
        <>
            <NormalMovementSelector
                character={characterChoice}
                fromIsland={fromIslandChoice}
                setCharacter={setCharacterChoice}
                setFromIsland={setFromIslandChoice}
                setToIsland={setToIslandChoice}
                toIsland={toIslandChoice}
            />
            <button
                type='button'
                onClick={() => {
                    props.submit({
                        character: characterChoice,
                        fromIslandNumber: fromIslandChoice,
                        toIslandNumber: toIslandChoice,
                    });
                }}
            >
                Submit
            </button>
        </>
    );
};
