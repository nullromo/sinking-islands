import type { CharacterSerialized, GameSerialized } from './commonTypes';
import type { CardPlacement } from './server/gameObjects/actionOrderTrack';
import type { CheckResult } from './server/checkResult';
import type {
    FlyingFishMovement,
    TargetCharacter,
    MovementSet,
} from './server/gameObjects/player';

export interface ClientToServerEvents {
    createGame: () => void;
    joinGame: (id: string) => void;
    responseCardPlacement: (cardPlacement: CardPlacement) => void;
    responseFlyingFishMovement: (
        flyingFishMovement: FlyingFishMovement,
    ) => void;
    responseFogTarget: (fogTarget: number) => void;
    responseHarpoonTarget: (harpoonTarget: TargetCharacter) => void;
    responseMovementSet: (movementSet: MovementSet) => void;
    responseNetTarget: (netTarget: number) => void;
    responsePilingsTarget: (pilingsTarget: number) => void;
    responseTidalSurgeTarget: (tidalSurgeTarget: number) => void;
    responseTidalWaveTarget: (tidalWaveTarget: number) => void;
    responseTortoiseTarget: (tortoiseTarget: TargetCharacter) => void;
    responseVolcanicEruptionTarget: (volcanicEruptionTarget: number) => void;
    responseFleeChoice: (fleeChoice: CharacterSerialized) => void;
}

export interface ServerToClientEvents {
    gameState: (gameState: GameSerialized) => void;
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
    updateStatus: (status: CheckResult) => void;
}
