import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import type { CharacterSerialized } from '../commonTypes';
import { GameActionType } from '../gameActionTypes';
import { GameContext } from '../gameContext';
import { GameInfo } from '../gameInfo';
import { Hand } from '../hand';
import { MessageLog } from '../messageLog';
import type { SetResultProps } from '../useResultMessage';
import type { InjectedServerCallsProps } from '../withServerCalls';
import { withServerCalls } from '../withServerCalls';
import { GameLayout, RightSidePanelLayout } from './gameLayoutContainers';

interface FlyingFishMovementWidgetProps
    extends SetResultProps, InjectedServerCallsProps {
    //
}

export const FlyingFishMovementWidget = withServerCalls(
    (props: FlyingFishMovementWidgetProps) => {
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
            <GameLayout>
                <Board
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
                <RightSidePanelLayout>
                    <GameInfo />
                    <MessageLog gameState={gameContext.game} />
                    <ActionOrderTrack />
                    <Hand />
                    <div style={{ width: '600px' }}>
                        Choose a Flying Fish movement. Click on a character to
                        move it. Click on an island to choose the movement
                        destination. Click Submit when finished.
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
                            props.serverCalls
                                .takeGameAction(gameContext.game.id, {
                                    action: GameActionType.FLYING_FISH_MOVEMENT,
                                    data: {
                                        character: characterChoice,
                                        fromIslandNumber: fromIslandChoice,
                                        toIslandNumber: toIslandChoice,
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
    'FlyingFishMovementWidget',
);
