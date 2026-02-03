import type { GameSerialized, PlayerDesignator } from '../../commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';

const checkNetTargetLegal = (game: GameSerialized, netTarget: number) => {
    // find the island
    const island = GameOperations.findIsland(game, netTarget);

    // the island must exist
    if (island === undefined) {
        throw new Error('Cannot net an island that does not exist.');
    }
};

export const handleNet = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    netTarget: number,
) => {
    checkNetTargetLegal(game, netTarget);

    // place the net
    console.log(
        `Player ${playerDesignator} casts a net over island ${netTarget}.`,
    );
    game.players[playerDesignator].netIsland = netTarget;
};
