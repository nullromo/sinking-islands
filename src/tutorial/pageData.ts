import { IslandType, PlayerDesignator } from '../commonTypes';
import { GameState } from '../gameState';
import { GameOperations } from '../server/gameObjects/gameOperations';

export const createBasicGame = () => {
    const game = GameOperations.create();
    game.gameState = GameState.AWAIT_CARD_PLACEMENT;
    game.waitingForPlayer = PlayerDesignator.PLAYER_B;
    game.nextIslandToSink = 0;
    game.islands = [
        {
            characters: [],
            islandNumber: 9,
            islandType: IslandType.VOLCANO,
            smallCapacity: false,
        },
        {
            characters: [],
            islandNumber: 12,
            islandType: IslandType.VOLCANO,
            smallCapacity: false,
        },
        {
            characters: [],
            islandNumber: 16,
            islandType: IslandType.NORMAL,
            smallCapacity: true,
        },
        {
            characters: [],
            islandNumber: 1,
            islandType: IslandType.NORMAL,
            smallCapacity: true,
        },
        {
            characters: [],
            islandNumber: 15,
            islandType: IslandType.VOLCANO,
            smallCapacity: false,
        },
        {
            characters: [],
            islandNumber: 5,
            islandType: IslandType.NORMAL,
            smallCapacity: false,
        },
        {
            characters: [],
            islandNumber: 4,
            islandType: IslandType.NORMAL,
            smallCapacity: true,
        },
        {
            characters: [],
            islandNumber: 13,
            islandType: IslandType.NORMAL,
            smallCapacity: true,
        },
        {
            characters: [],
            islandNumber: 10,
            islandType: IslandType.NORMAL,
            smallCapacity: true,
        },
        {
            characters: [],
            islandNumber: 11,
            islandType: IslandType.SACRED,
            smallCapacity: false,
        },
        {
            characters: [],
            islandNumber: 3,
            islandType: IslandType.NORMAL,
            smallCapacity: false,
        },
        {
            characters: [],
            islandNumber: 8,
            islandType: IslandType.NORMAL,
            smallCapacity: false,
        },
        {
            characters: [],
            islandNumber: 14,
            islandType: IslandType.SACRED,
            smallCapacity: false,
        },
        {
            characters: [],
            islandNumber: 6,
            islandType: IslandType.VOLCANO,
            smallCapacity: false,
        },
        {
            characters: [],
            islandNumber: 7,
            islandType: IslandType.NORMAL,
            smallCapacity: true,
        },
        {
            characters: [],
            islandNumber: 2,
            islandType: IslandType.NORMAL,
            smallCapacity: false,
        },
    ];

    game.messages = [
        'Welcome to the tutorial!',
        'Game messages will appear here.',
        'For the tutorial, there are no messages to show.',
    ];
    return game;
};
