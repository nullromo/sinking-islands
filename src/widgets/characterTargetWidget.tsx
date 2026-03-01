import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import type { CharacterSerialized } from '../commonTypes';
import { otherPlayerDesignator } from '../commonTypes';
import { GameActionType } from '../gameActionTypes';
import { GameContext } from '../gameContext';
import { GameInfo } from '../gameInfo';
import { GameState } from '../gameState';
import { Hand } from '../hand';
import { MessageLog } from '../messageLog';
import type { SetResultProps } from '../useResultMessage';
import type { InjectedServerCallsProps } from '../withServerCalls';
import { withServerCalls } from '../withServerCalls';
import { GameLayout, RightSidePanelLayout } from './gameLayoutContainers';

interface CharacterTargetWidgetProps
    extends InjectedServerCallsProps, SetResultProps {
    //
}
export const CharacterTargetWidget = withServerCalls(
    (props: CharacterTargetWidgetProps) => {
        const gameContext = React.use(GameContext);

        const enemy =
            gameContext.game.gameState === GameState.AWAIT_HARPOON_TARGET;
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
            <GameLayout>
                <Board
                    highlightCharacter={{
                        character: characterChoice,
                        islandNumber: islandNumberChoice,
                    }}
                    onCharacterClicked={(island, character) => {
                        if (
                            (enemy &&
                                character.playerDesignator !==
                                    gameContext.you) ||
                            (!enemy &&
                                character.playerDesignator === gameContext.you)
                        ) {
                            setCharacterChoice(character);
                            setIslandNumberChoice(island.islandNumber);
                        }
                    }}
                />
                <RightSidePanelLayout>
                    <GameInfo />
                    <MessageLog gameState={gameContext.game} />
                    <ActionOrderTrack />
                    <Hand />
                    <div
                        style={{ width: '600px' }}
                    >{`${title} Click on a character on the board to select that character. Click Submit when ready.`}</div>
                    <button
                        type='button'
                        onClick={() => {
                            props.serverCalls
                                .takeGameAction(gameContext.game.id, {
                                    action: (() => {
                                        if (
                                            gameContext.game.gameState ===
                                            GameState.AWAIT_HARPOON_TARGET
                                        ) {
                                            return GameActionType.HARPOON_TARGET;
                                        }
                                        if (
                                            gameContext.game.gameState ===
                                            GameState.AWAIT_TORTOISE_TARGET
                                        ) {
                                            return GameActionType.TORTOISE_TARGET;
                                        }
                                        throw new Error(
                                            'Invalid game state for this kind of action.',
                                        );
                                    })(),
                                    data: {
                                        character: characterChoice,
                                        islandNumber: islandNumberChoice,
                                    },
                                })
                                .catch((error: unknown) => {
                                    props.setResult(false, error);
                                });
                        }}
                    >
                        Submit
                    </button>
                </RightSidePanelLayout>
            </GameLayout>
        );
    },
    'CharacterTargetWidget',
);
