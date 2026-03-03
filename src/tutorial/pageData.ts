import { PlayerDesignator } from '../commonTypes';
import { GameState } from '../gameState';
import { GameOperations } from '../server/gameObjects/gameOperations';

export const createBasicGame = () => {
    const game = GameOperations.create();
    game.gameState = GameState.AWAIT_CARD_PLACEMENT;
    game.waitingForPlayer = PlayerDesignator.PLAYER_B;
    game.nextIslandToSink = 0;
    game.islands.forEach((island) => {
        island.characters = [];
    });
    game.messages = [
        'Welcome to the tutorial!',
        'Game messages will appear here.',
        'For the tutorial, there are no messages to show.',
    ];
    return game;
};
