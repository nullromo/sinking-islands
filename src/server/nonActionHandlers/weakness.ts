import { otherPlayerDesignator, type GameSerialized } from '../../commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';

export const handleWeakness = (game: GameSerialized) => {
    const card = GameOperations.getCurrentlyResolvingCard(game);
    const player = card.playerDesignator;
    const opponent = otherPlayerDesignator(player);

    GameOperations.log(
        game,
        `Player ${player}'s characters are afflicted with weakness.`,
    );
    game.players[opponent].weakness = true;
};
