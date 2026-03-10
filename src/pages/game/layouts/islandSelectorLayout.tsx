import * as React from 'react';
import { withServerCalls } from '../../../communication/withServerCalls';
import { GameContext } from '../../../contexts/gameContext';
import type {
    GameSerialized,
    PlayerDesignator,
} from '../../../info/commonTypes';
import { CardType } from '../../../info/commonTypes';
import { GameActionType } from '../../../info/gameActionTypes';
import { GameState } from '../../../info/gameState';
import { checkNetTargetLegal } from '../../../server/actionHandlers/netAction';
import { checkPilingsTargetLegal } from '../../../server/actionHandlers/pilingsAction';
import { checkTidalSurgeTargetLegal } from '../../../server/actionHandlers/tidalSurgeAction';
import { checkTidalWaveTargetLegal } from '../../../server/actionHandlers/tidalWaveAction';
import { checkVolcanicEruptionTargetLegal } from '../../../server/actionHandlers/volcanicEruptionAction';
import { buildIslandElementID } from '../../../tutorial/elementIDs';
import { SelectionArrow } from '../arrows/selectionArrow';
import type { LayoutProps } from './gameLayoutContainers';
import { GamePageLayout } from './gameLayoutContainers';

export const IslandSelectorLayout = withServerCalls((props: LayoutProps) => {
    const gameContext = React.use(GameContext);

    const [title, action, checkerBase, cardType]: [
        string,
        (
            | GameActionType.NET_TARGET
            | GameActionType.PILINGS_TARGET
            | GameActionType.TIDAL_SURGE_TARGET
            | GameActionType.TIDAL_WAVE_TARGET
            | GameActionType.VOLCANIC_ERUPTION_TARGET
        ),
        (
            game: GameSerialized,
            playerDesignator: PlayerDesignator,
            targetIsland: number,
        ) => void,
        CardType,
    ] =
        gameContext.game.gameState === GameState.AWAIT_NET_TARGET
            ? [
                  'Choose Net target.',
                  GameActionType.NET_TARGET,
                  checkNetTargetLegal,
                  CardType.NET,
              ]
            : gameContext.game.gameState === GameState.AWAIT_PILINGS_TARGET
              ? [
                    'Choose Pilings target.',
                    GameActionType.PILINGS_TARGET,
                    checkPilingsTargetLegal,
                    CardType.PILINGS,
                ]
              : gameContext.game.gameState ===
                  GameState.AWAIT_TIDAL_SURGE_TARGET
                ? [
                      'Choose Tidal Surge target.',
                      GameActionType.TIDAL_SURGE_TARGET,
                      (
                          game: GameSerialized,
                          __: PlayerDesignator,
                          target: number,
                      ) => {
                          checkTidalSurgeTargetLegal(game, target);
                      },
                      CardType.TIDAL_SURGE,
                  ]
                : gameContext.game.gameState ===
                    GameState.AWAIT_TIDAL_WAVE_TARGET
                  ? [
                        'Choose Tidal Wave target.',
                        GameActionType.TIDAL_WAVE_TARGET,
                        (
                            game: GameSerialized,
                            __: PlayerDesignator,
                            target: number,
                        ) => {
                            checkTidalWaveTargetLegal(game, target);
                        },
                        CardType.TIDAL_WAVE,
                    ]
                  : [
                        'Choose Volcanic Eruption target.',
                        GameActionType.VOLCANIC_ERUPTION_TARGET,
                        (
                            game: GameSerialized,
                            __: PlayerDesignator,
                            target: number,
                        ) => {
                            checkVolcanicEruptionTargetLegal(game, target);
                        },
                        CardType.VOLCANIC_ERUPTION,
                    ];

    const checker = (islandNumber: number) => {
        try {
            checkerBase(gameContext.game, gameContext.you, islandNumber);
            return true;
        } catch {
            return false;
        }
    };

    const [islandChoice, setIslandChoice] = React.useState<number | null>(null);

    const selectionIsLegal =
        islandChoice === null ? false : checker(islandChoice);

    return (
        <GamePageLayout
            boardProps={{
                highlightIsland: (island) => {
                    if (islandChoice === null) {
                        return checker(island.islandNumber);
                    }
                    return island.islandNumber === islandChoice;
                },
                onCharacterClicked: (island, _) => {
                    setIslandChoice(island.islandNumber);
                },
                onIslandClicked: (island) => {
                    setIslandChoice(island.islandNumber);
                },
            }}
        >
            <div style={{ width: '600px' }}>
                {`${title} Click on an island to select it.`}
            </div>
            <p>
                {islandChoice === null
                    ? 'Selected: none'
                    : `Selected: island ${islandChoice}`}
            </p>
            <div style={{ color: selectionIsLegal ? 'green' : 'red' }}>
                {'Selection is'} {selectionIsLegal ? '' : 'not'} {'legal'}
            </div>
            <div>
                <button
                    type='button'
                    onClick={() => {
                        setIslandChoice(null);
                    }}
                >
                    Start Over
                </button>
                <button
                    disabled={islandChoice === null}
                    type='button'
                    onClick={() => {
                        if (islandChoice === null) {
                            return;
                        }
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
            </div>
            <SelectionArrow
                cardType={cardType}
                color={
                    islandChoice === null
                        ? 'magenta'
                        : selectionIsLegal
                          ? 'limegreen'
                          : 'orange'
                }
                targetElementID={
                    islandChoice === null
                        ? null
                        : buildIslandElementID(islandChoice)
                }
            />
        </GamePageLayout>
    );
}, 'IslandSelectorLayout');
