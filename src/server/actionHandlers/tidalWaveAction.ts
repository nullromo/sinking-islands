import type { GameSerialized } from '../../info/commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';

export const checkTidalWaveTargetLegal = (
    game: GameSerialized,
    tidalWaveTarget: number,
) => {
    // find the island
    const island = GameOperations.findIsland(game, tidalWaveTarget);

    // the island must exist
    if (!island) {
        throw new Error('Cannot tidal wave to an island that does not exist.');
    }
};

export const handleTidalWave = (
    game: GameSerialized,
    tidalWaveTarget: number,
) => {
    checkTidalWaveTargetLegal(game, tidalWaveTarget);

    // move the rising waters marker
    GameOperations.log(
        game,
        `A tidal wave moves upon island ${tidalWaveTarget}.`,
    );
    game.nextIslandToSink = tidalWaveTarget;
};
