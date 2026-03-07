import type { PlayerDesignator } from '../info/commonTypes';

export const boardElementID = 'board';
export const actionOrderTrackElementID = 'action-order-track';
export const island3ElementID = 'island-3';
export const island1ElementID = 'island-1';
export const gameInfoElementID = 'game-info';
export const buildCharacterElementID = (
    islandNumber: number,
    playerDesignator: PlayerDesignator,
    playerIndex: number,
) => {
    return `character-${islandNumber}-${playerDesignator}-${playerIndex}`;
};
