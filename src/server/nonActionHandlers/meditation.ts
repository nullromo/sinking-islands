import type { GameSerialized } from '../../commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';
import { PlayerOperations } from '../gameObjects/playerOperations';

export const handleMeditation = (game: GameSerialized) => {
    const card = GameOperations.getCurrentlyResolvingCard(game);
    const player = card.playerDesignator;

    console.log(`Player ${player} meditates.`);
    PlayerOperations.reshuffle(game.players[player]);
};
