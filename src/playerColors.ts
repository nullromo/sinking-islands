import type { PlayerDesignator } from './commonTypes';

export const getPlayerColor = (
    player: PlayerDesignator,
    you: PlayerDesignator,
) => {
    return player === you
        ? { bright: 'dodgerblue', dim: 'lightblue' }
        : { bright: 'red', dim: 'indianred' };
};
