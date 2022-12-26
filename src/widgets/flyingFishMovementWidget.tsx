import React from 'react';
import { Board } from '../board';
import type { CharacterSerialized, GameSerialized } from '../commonTypes';
import type { FlyingFishMovement } from '../server/player';

interface FlyingFishMovementWidgetProps {
    submit: (flyingFishMovement: FlyingFishMovement) => void;
    gameState: GameSerialized;
}

export const FlyingFishMovementWidget = (
    props: FlyingFishMovementWidgetProps,
) => {
    const [fromIslandChoice, setFromIslandChoice] = React.useState(0);
    const [toIslandChoice, setToIslandChoice] = React.useState(0);
    const [characterChoice, setCharacterChoice] =
        React.useState<CharacterSerialized>({
            playerDesignator: props.gameState.you,
            strength: 20,
            tortoise: false,
        });

    return (
        <>
            <Board
                gameState={props.gameState}
                onCharacterClicked={(island, character) => {
                    if (character.playerDesignator !== props.gameState.you) {
                        setCharacterChoice(character);
                        setFromIslandChoice(island.islandNumber);
                    }
                }}
                onIslandClicked={(island) => {
                    setToIslandChoice(island.islandNumber);
                }}
            />
            <br />
            {`Character: ${characterChoice.tortoise ? '🐢' : '🧍'}${
                characterChoice.strength
            }`}
            <br />
            {`from ${fromIslandChoice}`}
            <br />
            {`to ${toIslandChoice}`}
            <br />
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
