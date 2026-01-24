import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import type { CharacterSerialized, GameSerialized } from '../commonTypes';
import { GameContext } from '../gameContext';
import { Hand } from '../hand';
import type { FlyingFishMovement } from '../server/gameObjects/player';

interface FlyingFishMovementWidgetProps {
    readonly submit: (flyingFishMovement: FlyingFishMovement) => void;
    readonly gameState: GameSerialized;
}

export const FlyingFishMovementWidget = (
    props: FlyingFishMovementWidgetProps,
) => {
    const gameContext = React.use(GameContext);

    const [fromIslandChoice, setFromIslandChoice] = React.useState(0);
    const [toIslandChoice, setToIslandChoice] = React.useState(0);
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
                highlightCharacter={{
                    character: characterChoice,
                    islandNumber: fromIslandChoice,
                }}
                highlightIslandNumber={toIslandChoice}
                onCharacterClicked={(island, character) => {
                    if (character.playerDesignator === gameContext.you) {
                        setCharacterChoice(character);
                        setFromIslandChoice(island.islandNumber);
                    }
                }}
                onIslandClicked={(island) => {
                    setToIslandChoice(island.islandNumber);
                }}
            />
            <ActionOrderTrack gameState={props.gameState} />
            <Hand gameState={props.gameState} />
            <div style={{ width: '600px' }}>
                Choose a Flying Fish movement. Click on a character to move it.
                Click on an island to choose the movement destination. Click
                Submit when finished.
            </div>
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
