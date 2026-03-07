import * as React from 'react';
import { GameContext } from '../../contexts/gameContext';
import type { SetResultProps } from '../../hooks/useResultMessage';
import { GameState } from '../../info/gameState';
import { assertUnreachable } from '../../util/util';
import { CardPlacementLayout } from './layouts/cardPlacementLayout';
import { CharacterTargetLayout } from './layouts/characterTargetLayout';
import { FogTargetLayout } from './layouts/fogTargetLayout';
import { IslandSelectorLayout } from './layouts/islandSelectorLayout';
import { MovementSetLayout } from './layouts/movementSetLayout';
import { WaitingForPlayerLayout } from './layouts/waitingForPlayerLayout';

export const LayoutSelector = (props: SetResultProps) => {
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
        return <WaitingForPlayerLayout />;
    }

    switch (gameContext.game.gameState) {
        case GameState.AWAIT_CARD_PLACEMENT:
            return <CardPlacementLayout setResult={props.setResult} />;
        case GameState.AWAIT_FOG_TARGET:
            return <FogTargetLayout setResult={props.setResult} />;
        case GameState.AWAIT_HARPOON_TARGET:
        case GameState.AWAIT_TORTOISE_TARGET:
            return <CharacterTargetLayout setResult={props.setResult} />;
        case GameState.AWAIT_NET_TARGET:
        case GameState.AWAIT_PILINGS_TARGET:
        case GameState.AWAIT_TIDAL_SURGE_TARGET:
        case GameState.AWAIT_TIDAL_WAVE_TARGET:
        case GameState.AWAIT_VOLCANIC_ERUPTION_TARGET:
            return <IslandSelectorLayout setResult={props.setResult} />;
        case GameState.AWAIT_FLYING_FISH_MOVEMENT:
        case GameState.AWAIT_MOVEMENT_SET:
            return <MovementSetLayout setResult={props.setResult} />;
        default:
            return assertUnreachable(gameContext.game.gameState);
    }
};
