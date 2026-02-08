import {
    otherPlayerDesignator,
    type GameSerialized,
    type PlayerDesignator,
} from '../../commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';

const checkNetTargetLegal = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    netTarget: number,
) => {
    // find the island
    const island = GameOperations.findIsland(game, netTarget);

    // the island must exist
    if (island === undefined) {
        throw new Error('Cannot net an island that does not exist.');
    }

    // the island must not already have a net on it
    if (
        netTarget ===
        game.players[otherPlayerDesignator(playerDesignator)].netIsland
    ) {
        throw new Error('Cannot net an island that is already netted.');
    }
};

export const handleNet = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    netTarget: number,
) => {
    checkNetTargetLegal(game, playerDesignator, netTarget);

    // place the net
    console.log(
        `Player ${playerDesignator} casts a net over island ${netTarget}.`,
    );
    game.players[playerDesignator].netIsland = netTarget;
};
