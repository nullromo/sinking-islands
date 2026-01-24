import React from 'react';
import { Board } from '../board';
import type { CharacterSerialized, GameSerialized } from '../commonTypes';
import { GameContext } from '../gameContext';

interface FleeChoiceWidgetProps {
    submit: (character: CharacterSerialized) => void;
    gameState: GameSerialized;
}

export const FleeChoiceWidget = (props: FleeChoiceWidgetProps) => {
    const gameContext = React.useContext(GameContext);

    const [characterChoice, setCharacterChoice] =
        React.useState<CharacterSerialized>({
            playerDesignator: gameContext.you,
            strength: 20,
            tortoise: false,
        });

    return (
        <>
            <Board
                gameState={props.gameState}
                onCharacterClicked={(_, character) => {
                    setCharacterChoice(character);
                }}
                onIslandClicked={(_) => {
                    //
                }}
            />
            <br />
            {`Character: ${characterChoice.tortoise ? '🐢' : '🧍'}${
                characterChoice.strength
            }`}
            <br />
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
