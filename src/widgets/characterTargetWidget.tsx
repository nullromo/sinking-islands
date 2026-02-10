import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import type { CharacterSerialized, TargetCharacter } from '../commonTypes';
import { otherPlayerDesignator } from '../commonTypes';
import { GameContext } from '../gameContext';
import { GameState } from '../gameState';
import { Hand } from '../hand';

interface CharacterTargetWidgetProps {
    readonly submit: (target: TargetCharacter) => void;
}
export const CharacterTargetWidget = (props: CharacterTargetWidgetProps) => {
    const gameContext = React.use(GameContext);

    const enemy = gameContext.game.gameState === GameState.AWAIT_HARPOON_TARGET;
    const title =
        gameContext.game.gameState === GameState.AWAIT_HARPOON_TARGET
            ? 'Choose Harpoon target.'
            : 'Choose Tortoise target.';

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
                highlightCharacter={{
                    character: characterChoice,
                    islandNumber: islandNumberChoice,
                }}
                onCharacterClicked={(island, character) => {
                    if (
                        (enemy &&
                            character.playerDesignator !== gameContext.you) ||
                        (!enemy &&
                            character.playerDesignator === gameContext.you)
                    ) {
                        setCharacterChoice(character);
                        setIslandNumberChoice(island.islandNumber);
                    }
                }}
            />
            <ActionOrderTrack />
            <Hand />
            <div
                style={{ width: '600px' }}
            >{`${title} Click on a character on the board to select that character. Click Submit when ready.`}</div>
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
