import type { GameSerialized, PlayerDesignator } from '../../info/commonTypes';
import { otherPlayerDesignator } from '../../info/commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';

const checkPilingsTargetLegal = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    pilingsTarget: number,
) => {
    // find the island
    const island = GameOperations.findIsland(game, pilingsTarget);

    // the island must exist
    if (island === undefined) {
        throw new Error('Cannot put pilings on an island that does not exist.');
    }

    // the island must have small capacity
    if (!island.smallCapacity) {
        throw new Error('Cannot put pilings on a large capacity island.');
    }

    // the island must not already have pilings on it
    if (
        pilingsTarget ===
        game.players[otherPlayerDesignator(playerDesignator)].pilingsIsland
    ) {
        throw new Error(
            'Cannot put pilings on an island that already has pilings on it.',
        );
    }
};

export const handlePilings = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    pilingsTarget: number,
) => {
    checkPilingsTargetLegal(game, playerDesignator, pilingsTarget);

    // construct the pilings
    GameOperations.log(
        game,
        `Player ${playerDesignator} constructs pilings on island ${pilingsTarget}.`,
    );
    game.players[playerDesignator].pilingsIsland = pilingsTarget;
};
