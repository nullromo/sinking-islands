import type { PlayerDesignator } from '../info/commonTypes';

export const boardElementID = 'board';
export const actionOrderTrackElementID = 'action-order-track';
export const gameInfoElementID = 'game-info';

export const buildCharacterElementID = (
    islandNumber: number,
    playerDesignator: PlayerDesignator,
    playerIndex: number,
) => {
    return `character-${islandNumber}-${playerDesignator}-${playerIndex}`;
};

export const buildIslandElementID = (islandNumber: number) => {
    return `island-${islandNumber}`;
};
