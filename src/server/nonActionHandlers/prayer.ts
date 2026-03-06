import type { GameSerialized } from '../../info/commonTypes';
import { IslandType } from '../../info/commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';
import { PlayerOperations } from '../gameObjects/playerOperations';

export const handlePrayer = (game: GameSerialized) => {
    const card = GameOperations.getCurrentlyResolvingCard(game);
    const player = card.playerDesignator;

    // determine the prayer value
    const cardsToDraw = game.islands
        .filter((island) => {
            return island.islandType === IslandType.SACRED;
        })
        .reduce((total, island) => {
            return (
                total +
                island.characters.filter((character) => {
                    return character.playerDesignator === player;
                }).length
            );
        }, 0);

    // draw the cards
    GameOperations.log(
        game,
        `Player ${player} prays for ${cardsToDraw} card${
            cardsToDraw === 1 ? '' : 's'
        }.`,
    );
    PlayerOperations.draw(game, game.players[player], cardsToDraw);
};
