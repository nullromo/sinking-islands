import { otherPlayerDesignator, type GameSerialized } from '../../commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';

export const handleIndiscretion = (game: GameSerialized) => {
    const card = GameOperations.getCurrentlyResolvingCard(game);
    const player = card.playerDesignator;
    const opponent = otherPlayerDesignator(player);

    console.log(`Player ${opponent} is put under the effects of indiscretion.`);
    game.players[opponent].indiscretion = true;
};
