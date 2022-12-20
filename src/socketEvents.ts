import type { GameStateGame } from './commonTypes';
import type { CardPlacement } from './server/actionOrderTrack';
import type { Character } from './server/character';
import type {
    FlyingFishMovement,
    HarpoonTarget,
    MovementSet,
    TortoiseTarget,
} from './server/player';

export interface ClientToServerEvents {
    createGame: () => void;
    joinGame: (id: string) => void;
    responseCardPlacement: (cardPlacement: CardPlacement) => void;
    responseFlyingFishMovement: (
        flyingFishMovement: FlyingFishMovement,
    ) => void;
    responseFogTarget: (fogTarget: number) => void;
    responseHarpoonTarget: (harpoonTarget: HarpoonTarget) => void;
    responseMovementSet: (movementSet: MovementSet) => void;
    responseNetTarget: (netTarget: number) => void;
    responsePilingsTarget: (pilingsTarget: number) => void;
    responseTidalSurgeTarget: (tidalSurgeTarget: number) => void;
    responseTidalWaveTarget: (tidalWaveTarget: number) => void;
    responseTortoiseTarget: (tortoiseTarget: TortoiseTarget) => void;
    responseVolcanicEruptionTarget: (volcanicEruptionTarget: number) => void;
    responseFleeChoice: (fleeChoice: Character) => void;
}

export interface ServerToClientEvents {
    gameState: (gameState: GameStateGame) => void;
    joinFail: () => void;
    requestCardPlacement: () => void;
    requestFlyingFishMovement: () => void;
    requestFogTarget: () => void;
    requestHarpoonTarget: () => void;
    requestMovementSet: () => void;
    requestNetTarget: () => void;
    requestPilingsTarget: () => void;
    requestTidalSurgeTarget: () => void;
    requestTidalWaveTarget: () => void;
    requestTortoiseTarget: () => void;
    requestVolcanicEruptionTarget: () => void;
    requestFleeChoice: () => void;
}
