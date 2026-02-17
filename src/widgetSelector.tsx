import * as React from 'react';
import { ActionOrderTrack } from './actionOrderTrack';
import { GameContext } from './gameContext';
import { GameState } from './gameState';
import { Hand } from './hand';
import type { SetResultProps } from './useResultMessage';
import { assertUnreachable } from './util';
import { CardPlacementWidget } from './widgets/cardPlacementWidget';
import { CharacterTargetWidget } from './widgets/characterTargetWidget';
import { FlyingFishMovementWidget } from './widgets/flyingFishMovementWidget';
import { FogTargetWidget } from './widgets/fogTargetWidget';
import { IslandSelectorWidget } from './widgets/islandSelectorWidget';
import { MovementSetWidget } from './widgets/movementSetWidget';

export const WidgetSelector = (props: SetResultProps) => {
    const gameContext = React.use(GameContext);

    if (gameContext.game.gameState === GameState.FINISHED) {
        return (
            <>{`The game is over. ${gameContext.game.players[gameContext.game.waitingForPlayer].username} wins!`}</>
        );
    }

    if (gameContext.game.gameState === GameState.INITIAL_STATE) {
        return <>{'The game has not started yet.'}</>;
    }

    if (gameContext.game.waitingForPlayer !== gameContext.you) {
        return (
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <ActionOrderTrack />
                <Hand />
                Waiting for opponent
            </div>
        );
    }

    switch (gameContext.game.gameState) {
        case GameState.AWAIT_CARD_PLACEMENT:
            return <CardPlacementWidget setResult={props.setResult} />;
        case GameState.AWAIT_FLYING_FISH_MOVEMENT:
            return <FlyingFishMovementWidget setResult={props.setResult} />;
        case GameState.AWAIT_FOG_TARGET:
            return <FogTargetWidget setResult={props.setResult} />;
        case GameState.AWAIT_HARPOON_TARGET:
        case GameState.AWAIT_TORTOISE_TARGET:
            return <CharacterTargetWidget setResult={props.setResult} />;
        case GameState.AWAIT_NET_TARGET:
        case GameState.AWAIT_PILINGS_TARGET:
        case GameState.AWAIT_TIDAL_SURGE_TARGET:
        case GameState.AWAIT_TIDAL_WAVE_TARGET:
        case GameState.AWAIT_VOLCANIC_ERUPTION_TARGET:
            return <IslandSelectorWidget setResult={props.setResult} />;
        case GameState.AWAIT_MOVEMENT_SET:
            return <MovementSetWidget setResult={props.setResult} />;
        default:
            return assertUnreachable(gameContext.game.gameState);
    }
};
