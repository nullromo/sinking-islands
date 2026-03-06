import type { GameSerialized } from '../../info/commonTypes';
import { otherPlayerDesignator } from '../../info/commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';

export const handleIndiscretion = (game: GameSerialized) => {
    const card = GameOperations.getCurrentlyResolvingCard(game);
    const player = card.playerDesignator;
    const opponent = otherPlayerDesignator(player);

    GameOperations.log(
        game,
        `Player ${opponent} is put under the effects of indiscretion.`,
    );
    game.players[opponent].indiscretion = true;
};
