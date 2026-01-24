import type { GameSerialized } from './commonTypes';
import { PlayerDesignator } from './commonTypes';
import { GameState } from './gameState';

export const createBlankGame = (): GameSerialized => {
    return {
        actionOrderTrack: { cardSlots: [], faceUpCards: [] },
        activeCardIndex: null,
        gameState: GameState.INITIAL_STATE,
        id: '',
        indiscretion: {
            [PlayerDesignator.PLAYER_A]: false,
            [PlayerDesignator.PLAYER_B]: false,
        },
        initiative: PlayerDesignator.PLAYER_A,
        islandModifiers: {
            playerANet: NaN,
            playerAPilings: NaN,
            playerBNet: NaN,
            playerBPilings: NaN,
        },
        islands: [],
        messages: [],
        nextIslandToSink: 1,
        players: {
            [PlayerDesignator.PLAYER_A]: {
                deck: [],
                discardPile: [],
                hand: [],
                indiscretion: false,
                netIsland: 0,
                pilingsIsland: 0,
                playerDesignator: PlayerDesignator.PLAYER_A,
                setAsideCards: [],
                username: null,
                weakness: false,
            },
            [PlayerDesignator.PLAYER_B]: {
                deck: [],
                discardPile: [],
                hand: [],
                indiscretion: false,
                netIsland: 0,
                pilingsIsland: 0,
                playerDesignator: PlayerDesignator.PLAYER_A,
                setAsideCards: [],
                username: null,
                weakness: false,
            },
        },
    };
};
