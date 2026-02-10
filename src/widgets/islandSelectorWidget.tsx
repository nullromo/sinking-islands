import * as React from 'react';
import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import { Hand } from '../hand';
import { GameContext } from '../gameContext';
import { GameState } from '../gameState';

interface IslandSelectorWidgetProps {
    readonly submit: (islandNumber: number) => void;
}

export const IslandSelectorWidget = (props: IslandSelectorWidgetProps) => {
    const gameContext = React.use(GameContext);

    const title =
        gameContext.game.gameState === GameState.AWAIT_NET_TARGET
            ? 'Choose Net target.'
            : gameContext.game.gameState === GameState.AWAIT_PILINGS_TARGET
              ? 'Choose Pilings target.'
              : gameContext.game.gameState ===
                  GameState.AWAIT_TIDAL_SURGE_TARGET
                ? 'Choose Tidal Surge target.'
                : gameContext.game.gameState ===
                    GameState.AWAIT_TIDAL_WAVE_TARGET
                  ? 'Choose Tidal Wave target.'
                  : 'Choose Volcanic Eruption target.';

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
                    props.submit(islandChoice);
                }}
            >
                Submit
            </button>
        </>
    );
};
