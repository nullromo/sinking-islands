import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import type { CharacterSerialized, GameSerialized } from '../commonTypes';
import { otherPlayerDesignator } from '../commonTypes';
import { GameContext } from '../gameContext';
import { Hand } from '../hand';
import type { TargetCharacter } from '../server/gameObjects/player';

interface CharacterTargetWidgetProps {
    readonly gameState: GameSerialized;
    readonly submit: (target: TargetCharacter) => void;
    readonly title: string;
    readonly enemy: boolean;
}

export const CharacterTargetWidget = (props: CharacterTargetWidgetProps) => {
    const gameContext = React.use(GameContext);

    const [characterChoice, setCharacterChoice] =
        React.useState<CharacterSerialized>(() => {
            return {
                playerDesignator: otherPlayerDesignator(gameContext.you),
                strength: 20,
                tortoise: false,
            };
        });
    const [islandNumberChoice, setIslandNumberChoice] = React.useState(1);

    return (
        <>
            <Board
                gameState={props.gameState}
                highlightCharacter={{
                    character: characterChoice,
                    islandNumber: islandNumberChoice,
                }}
                onCharacterClicked={(island, character) => {
                    if (
                        (props.enemy &&
                            character.playerDesignator !== gameContext.you) ||
                        (!props.enemy &&
                            character.playerDesignator === gameContext.you)
                    ) {
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
