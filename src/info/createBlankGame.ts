import type { GameSerialized } from './commonTypes';
import { PlayerDesignator } from './commonTypes';
import { GameState } from './gameState';

export const createBlankGame = (): GameSerialized => {
    return {
        actionOrderTrack: { cardSlots: [], faceUpCards: [] },
        activeCardIndex: null,
        gameState: GameState.INITIAL_STATE,
        id: '',
        initiative: PlayerDesignator.PLAYER_A,
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
        roundsCompleted: 0,
        waitingForPlayer: PlayerDesignator.PLAYER_A,
    };
};
