import type { GameSerialized } from '../info/commonTypes';

export interface ClientToServerEvents {
    subscribeToGame: (gameID: string) => void;
}

export interface ServerToClientEvents {
    gameState: (gameState: GameSerialized) => void;
    updateStatus: (status: { success: boolean; message: string }) => void;
}
