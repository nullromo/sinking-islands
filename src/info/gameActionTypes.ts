import type {
    CardPlacement,
    FlyingFishMovement,
    MovementSet,
    TargetCharacter,
} from './commonTypes';

export enum GameActionType {
    CARD_PLACEMENT = 'CARD_PLACEMENT',
    FLYING_FISH_MOVEMENT = 'FLYING_FISH_MOVEMENT',
    FOG_TARGET = 'FOG_TARGET',
    HARPOON_TARGET = 'HARPOON_TARGET',
    MOVEMENT_SET = 'MOVEMENT_SET',
    NET_TARGET = 'NET_TARGET',
    PILINGS_TARGET = 'PILINGS_TARGET',
    TIDAL_SURGE_TARGET = 'TIDAL_SURGE_TARGET',
    TIDAL_WAVE_TARGET = 'TIDAL_WAVE_TARGET',
    TORTOISE_TARGET = 'TORTOISE_TARGET',
    VOLCANIC_ERUPTION_TARGET = 'VOLCANIC_ERUPTION_TARGET',
}

export type CardPlacementAction = {
    action: GameActionType.CARD_PLACEMENT;
    data: CardPlacement;
};

type FlyingFishMovementAction = {
    action: GameActionType.FLYING_FISH_MOVEMENT;
    data: FlyingFishMovement;
};
type FogTargetAction = { action: GameActionType.FOG_TARGET; data: number };
type HarpoonTargetAction = {
    action: GameActionType.HARPOON_TARGET;
    data: TargetCharacter;
};
type MovementSetAction = {
    action: GameActionType.MOVEMENT_SET;
    data: MovementSet;
};
type NetTargetAction = { action: GameActionType.NET_TARGET; data: number };
type PilingsTargetAction = {
    action: GameActionType.PILINGS_TARGET;
    data: number;
};
type TidalSurgeTargetAction = {
    action: GameActionType.TIDAL_SURGE_TARGET;
    data: number;
};
type TidalWaveTargetAction = {
    action: GameActionType.TIDAL_WAVE_TARGET;
    data: number;
};
type TortoiseTargetAction = {
    action: GameActionType.TORTOISE_TARGET;
    data: TargetCharacter;
};
type VolcanicEruptionTargetAction = {
    action: GameActionType.VOLCANIC_ERUPTION_TARGET;
    data: number;
};

export type GameAction =
    | CardPlacementAction
    | FlyingFishMovementAction
    | FogTargetAction
    | HarpoonTargetAction
    | MovementSetAction
    | NetTargetAction
    | PilingsTargetAction
    | TidalSurgeTargetAction
    | TidalWaveTargetAction
    | TortoiseTargetAction
    | VolcanicEruptionTargetAction;
