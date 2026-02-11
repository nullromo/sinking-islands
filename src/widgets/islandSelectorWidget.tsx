import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import { GameContext } from '../gameContext';
import { GameState } from '../gameState';
import { Hand } from '../hand';
import type { SetResultProps } from '../useResultMessage';
import type { InjectedServerCallsProps } from '../withServerCalls';
import { withServerCalls } from '../withServerCalls';
import { GameActionType } from '../gameActionTypes';

interface IslandSelectorWidgetProps
    extends InjectedServerCallsProps,
        SetResultProps {
    //
}

export const IslandSelectorWidget = withServerCalls(
    (props: IslandSelectorWidgetProps) => {
        const gameContext = React.use(GameContext);

        const [title, action]: [
            string,
            (
                | GameActionType.NET_TARGET
                | GameActionType.PILINGS_TARGET
                | GameActionType.TIDAL_SURGE_TARGET
                | GameActionType.TIDAL_WAVE_TARGET
                | GameActionType.VOLCANIC_ERUPTION_TARGET
            ),
        ] =
            gameContext.game.gameState === GameState.AWAIT_NET_TARGET
                ? ['Choose Net target.', GameActionType.NET_TARGET]
                : gameContext.game.gameState === GameState.AWAIT_PILINGS_TARGET
                  ? ['Choose Pilings target.', GameActionType.PILINGS_TARGET]
                  : gameContext.game.gameState ===
                      GameState.AWAIT_TIDAL_SURGE_TARGET
                    ? [
                          'Choose Tidal Surge target.',
                          GameActionType.TIDAL_SURGE_TARGET,
                      ]
                    : gameContext.game.gameState ===
                        GameState.AWAIT_TIDAL_WAVE_TARGET
                      ? [
                            'Choose Tidal Wave target.',
                            GameActionType.TIDAL_WAVE_TARGET,
                        ]
                      : [
                            'Choose Volcanic Eruption target.',
                            GameActionType.VOLCANIC_ERUPTION_TARGET,
                        ];

        const [islandChoice, setIslandChoice] = React.useState(1);

        return (
            <>
                <Board
                    highlightIslandNumber={islandChoice}
                    onCharacterClicked={(island, _) => {
                        setIslandChoice(island.islandNumber);
                    }}
                    onIslandClicked={(island) => {
                        setIslandChoice(island.islandNumber);
                    }}
                />
                <ActionOrderTrack />
                <Hand />
                <div style={{ width: '600px' }}>
                    {`${title} Click on an island to select it. Click Submit when ready.`}
                </div>
                <br />
                {`Island: ${islandChoice}`}
                <br />
                <button
                    type='button'
                    onClick={() => {
                        props.serverCalls
                            .takeGameAction(gameContext.game.id, {
                                action,
                                data: islandChoice,
                            })
                            .catch((error: unknown) => {
                                props.setResult(false, error);
                            });
                    }}
                >
                    Submit
                </button>
            </>
        );
    },
    'IslandSelectorWidget',
);
