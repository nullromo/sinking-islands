import React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import type { CharacterSerialized, GameSerialized } from '../commonTypes';
import { otherPlayerDesignator } from '../commonTypes';
import { Hand } from '../hand';
import type { HarpoonTarget, TortoiseTarget } from '../server/player';

interface CharacterTargetWidgetProps {
    gameState: GameSerialized;
    submit: (target: HarpoonTarget | TortoiseTarget) => void;
    title: string;
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
            />
            <ActionOrderTrack gameState={props.gameState} />
            <Hand gameState={props.gameState} />
            <div
                style={{ width: '600px' }}
            >{`${props.title} Click on a character on the baord to select that character. Click Submit when ready.`}</div>
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
