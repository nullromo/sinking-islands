import type { Socket } from 'socket.io-client';
import { ActionOrderTrack } from './actionOrderTrack';
import { Board } from './board';
import type { GameSerialized } from './commonTypes';
import { Hand } from './hand';
import type { ServerToClientEvents } from './socketEvents';
import { assertUnreachable } from './util';
import { CardPlacementWidget } from './widgets/cardPlacementWidget';
import { CharacterTargetWidget } from './widgets/characterTargetWidget';
import { FleeChoiceWidget } from './widgets/fleeChoiceWidget';
import { FlyingFishMovementWidget } from './widgets/flyingFishMovementWidget';
import { FogTargetWidget } from './widgets/fogTargetWidget';
import { IslandSelectorWidget } from './widgets/islandSelectorWidget';
import { MovementSetWidget } from './widgets/movementSetWidget';

export const WidgetSelector = (props: {
    readonly interfaceState: keyof ServerToClientEvents | null;
    readonly setInterfaceState: (
        value: keyof ServerToClientEvents | null,
    ) => void;
    readonly gameState: GameSerialized;
    readonly socket: Socket;
}) => {
    const interfaceState = props.interfaceState;
    const setInterfaceState = props.setInterfaceState;
    const gameState = props.gameState;
    switch (interfaceState) {
        case 'requestCardPlacement':
            return (
                <>
                    <Board gameState={gameState} />
                    <CardPlacementWidget
                        gameState={gameState}
                        submit={(cardPlacement) => {
                            props.socket.emit(
                                'responseCardPlacement',
                                cardPlacement,
                            );
                            setInterfaceState(null);
                        }}
                    />
                </>
            );
        case 'requestFlyingFishMovement':
            return (
                <FlyingFishMovementWidget
                    gameState={gameState}
                    submit={(flyingFishMovement) => {
                        props.socket.emit(
                            'responseFlyingFishMovement',
                            flyingFishMovement,
                        );
                        setInterfaceState(null);
                    }}
                />
            );
        case 'requestFogTarget':
            return (
                <>
                    <Board gameState={gameState} />
                    <FogTargetWidget
                        gameState={gameState}
                        submit={(fogTarget) => {
                            props.socket.emit('responseFogTarget', fogTarget);
                            setInterfaceState(null);
                        }}
                    />
                </>
            );
        case 'requestHarpoonTarget':
        case 'requestTortoiseTarget':
            return (
                <CharacterTargetWidget
                    enemy={interfaceState === 'requestHarpoonTarget'}
                    gameState={gameState}
                    submit={(target) => {
                        props.socket.emit(
                            (() => {
                                switch (interfaceState) {
                                    case 'requestHarpoonTarget':
                                        return 'responseHarpoonTarget';
                                    case 'requestTortoiseTarget':
                                        return 'responseTortoiseTarget';
                                    default:
                                        return assertUnreachable(
                                            interfaceState,
                                        );
                                }
                            })(),
                            target,
                        );
                        setInterfaceState(null);
                    }}
                    title={
                        interfaceState === 'requestHarpoonTarget'
                            ? 'Choose Harpoon target.'
                            : 'Choose Tortoise target.'
                    }
                />
            );
        case 'requestNetTarget':
        case 'requestPilingsTarget':
        case 'requestTidalSurgeTarget':
        case 'requestTidalWaveTarget':
        case 'requestVolcanicEruptionTarget':
            return (
                <IslandSelectorWidget
                    gameState={gameState}
                    submit={(islandNumber) => {
                        props.socket.emit(
                            (() => {
                                switch (interfaceState) {
                                    case 'requestNetTarget':
                                        return 'responseNetTarget';
                                    case 'requestPilingsTarget':
                                        return 'responsePilingsTarget';
                                    case 'requestTidalSurgeTarget':
                                        return 'responseTidalSurgeTarget';
                                    case 'requestTidalWaveTarget':
                                        return 'responseTidalWaveTarget';
                                    case 'requestVolcanicEruptionTarget':
                                        return 'responseVolcanicEruptionTarget';
                                    default:
                                        return assertUnreachable(
                                            interfaceState,
                                        );
                                }
                            })(),
                            islandNumber,
                        );
                        setInterfaceState(null);
                    }}
                    title={
                        interfaceState === 'requestNetTarget'
                            ? 'Choose Net target.'
                            : interfaceState === 'requestPilingsTarget'
                              ? 'Choose Pilings target.'
                              : interfaceState === 'requestTidalSurgeTarget'
                                ? 'Choose Tidal Surge target.'
                                : interfaceState === 'requestTidalWaveTarget'
                                  ? 'Choose Tidal Wave target.'
                                  : 'Choose Volcanic Eruption target.'
                    }
                />
            );
        case 'requestFleeChoice':
            return (
                <FleeChoiceWidget
                    gameState={gameState}
                    submit={(character) => {
                        props.socket.emit('responseFleeChoice', character);
                        setInterfaceState(null);
                    }}
                />
            );
        case 'requestMovementSet':
            return (
                <MovementSetWidget
                    gameState={gameState}
                    submit={(movementSet) => {
                        props.socket.emit('responseMovementSet', movementSet);
                        setInterfaceState(null);
                    }}
                />
            );
        case 'joinFail':
            return <>{'j f'}</>;
        case 'gameState':
        case 'updateStatus':
        case null:
            return (
                <>
                    <div>
                        <Board gameState={gameState} />
                    </div>
                    <div
                        style={{
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <ActionOrderTrack gameState={gameState} />
                        <Hand gameState={gameState} />
                        Waiting for opponent
                    </div>
                </>
            );
        default:
            return assertUnreachable(interfaceState);
    }
};
