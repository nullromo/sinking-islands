import type { PlayerDesignator } from '../../info/commonTypes';

export const buildCharacterElementID = (
    islandNumber: number,
    playerDesignator: PlayerDesignator,
    playerIndex: number,
) => {
    return `character-${islandNumber}-${playerDesignator}-${playerIndex}`;
};
