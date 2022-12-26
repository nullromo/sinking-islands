import React from 'react';
import { Board } from '../board';
import type { CharacterSerialized, GameSerialized } from '../commonTypes';
import { otherPlayerDesignator } from '../commonTypes';
import type { HarpoonTarget, TortoiseTarget } from '../server/player';

interface CharacterTargetWidgetProps {
    submit: (target: HarpoonTarget | TortoiseTarget) => void;
    gameState: GameSerialized;
}

export const CharacterTargetWidget = (props: CharacterTargetWidgetProps) => {
    const [characterChoice, setCharacterChoice] =
        React.useState<CharacterSerialized>({
            playerDesignator: otherPlayerDesignator(props.gameState.you),
            strength: 20,
            tortoise: false,
        });
    const [islandNumberChoice, setIslandNumberChoice] = React.useState(1);

    return (
        <>
            <Board
                gameState={props.gameState}
                onCharacterClicked={(island, character) => {
                    if (character.playerDesignator !== props.gameState.you) {
                        setCharacterChoice(character);
                        setIslandNumberChoice(island.islandNumber);
                    }
                }}
                onIslandClicked={(_) => {
                    //
                }}
            />
            {`Character: ${characterChoice.tortoise ? '🐢' : '🧍'}${
                characterChoice.strength
            }`}
            <br />
            {`Island: ${islandNumberChoice}`}
            <br />
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
