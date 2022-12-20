import type { CardType } from './server/card';
import type { IslandType } from './server/island';
import type { PlayerDesignator } from './server/player';

export type GameStatePlayerGamePiece = {
    playerDesignator: PlayerDesignator;
};

export interface GameStateCharacter extends GameStatePlayerGamePiece {
    strength: number;
    tortoise: boolean;
}

export type GameStateIsland = {
    islandNumber: number;
    islandType: IslandType;
    smallCapacity: boolean;
    characters: GameStateCharacter[];
};

export interface GameStateCard extends GameStatePlayerGamePiece {
    cardType: CardType;
}

export type GameStateActionOrderTrack = {
    cardSlots: Array<GameStateCard | null>;
    faceUpCards: number[];
};

export type GameStateGame = {
    actionOrderTrack: GameStateActionOrderTrack;
    id: string;
    initiative: PlayerDesignator;
    islands: GameStateIsland[];
    nextIslandToSink: number;
};
