import * as React from 'react';
import { withServerCalls } from '../../../communication/withServerCalls';
import { GameContext } from '../../../contexts/gameContext';
import { GameActionType } from '../../../info/gameActionTypes';
import { GameState } from '../../../info/gameState';
import type { LayoutProps } from './gameLayoutContainers';
import { GamePageLayout } from './gameLayoutContainers';

export const IslandSelectorLayout = withServerCalls((props: LayoutProps) => {
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
        <GamePageLayout
            boardProps={{
                highlightIslandNumber: islandChoice,
                onCharacterClicked: (island, _) => {
                    setIslandChoice(island.islandNumber);
                },
                onIslandClicked: (island) => {
                    setIslandChoice(island.islandNumber);
                },
            }}
        >
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
        </GamePageLayout>
    );
}, 'IslandSelectorLayout');
