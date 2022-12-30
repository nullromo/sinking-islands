import React from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { ActionOrderTrack } from './actionOrderTrack';
import { Board } from './board';
import type { GameSerialized } from './commonTypes';
import { CreateOrJoinPage } from './createOrJoinPage';
import { Hand } from './hand';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from './socketEvents';
import { assertUnreachable } from './util';
import { CardPlacementWidget } from './widgets/cardPlacementWidget';
import { CharacterTargetWidget } from './widgets/characterTargetWidget';
import { FleeChoiceWidget } from './widgets/fleeChoiceWidget';
import { FlyingFishMovementWidget } from './widgets/flyingFishMovementWidget';
import { FogTargetWidget } from './widgets/fogTargetWidget';
import { IslandSelectorWidget } from './widgets/islandSelectorWidget';
import { MovementSetWidget } from './widgets/movementSetWidget';

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;
const connectSocket = () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!socket?.connected) {
        console.log('Connecting socket');
        socket = io('http://localhost:5151');
    } else {
        console.log('Socket already connected.');
    }
    return socket;
};
connectSocket();

export const GamePage = () => {
    const [gameState, setGameState] = React.useState<GameSerialized | null>(
        null,
    );
    const [interfaceState, setInterfaceState] = React.useState<
        keyof ServerToClientEvents | null
    >(null);

    React.useEffect(() => {
        connectSocket();
        console.log('Registering event listeners.');
        socket.on('gameState', (gameState: GameSerialized) => {
            console.log('Got game state:', gameState);
            setGameState(gameState);
        });
        (
            [
                'requestCardPlacement',
                'requestFlyingFishMovement',
                'requestFogTarget',
                'requestHarpoonTarget',
                'requestMovementSet',
                'requestNetTarget',
                'requestPilingsTarget',
                'requestTidalSurgeTarget',
                'requestTidalWaveTarget',
                'requestTortoiseTarget',
                'requestVolcanicEruptionTarget',
                'requestFleeChoice',
            ] as Array<keyof ServerToClientEvents>
        ).forEach((eventName) => {
            socket.on(eventName, () => {
                setInterfaceState(eventName);
            });
        });
        socket.on('joinFail', () => {
            console.log('Join failed');
        });
        return () => {
            console.log('Un-registering event listeners');
            socket.removeAllListeners();
            console.log('Closing socket');
            socket.close();
        };
    }, []);

    if (gameState === null) {
        return (
            <CreateOrJoinPage
                emitCreate={() => {
                    socket.emit('createGame');
                }}
                emitJoin={(id) => {
                    socket.emit('joinGame', id);
                }}
            />
        );
    }

    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {interfaceState === null ? gameState.id : ''}
            {(() => {
                switch (interfaceState) {
                    case 'requestCardPlacement':
                        return (
                            <>
                                <Board gameState={gameState} />
                                <CardPlacementWidget
                                    gameState={gameState}
                                    submit={(cardPlacement) => {
                                        socket.emit(
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
                                    socket.emit(
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
                                        socket.emit(
                                            'responseFogTarget',
                                            fogTarget,
                                        );
                                        setInterfaceState(null);
                                    }}
                                />
                            </>
                        );
                    case 'requestHarpoonTarget':
                    case 'requestTortoiseTarget':
                        return (
                            <CharacterTargetWidget
                                gameState={gameState}
                                submit={(target) => {
                                    socket.emit(
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
                                    socket.emit(
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
                                        : interfaceState ===
                                          'requestPilingsTarget'
                                        ? 'Choose Pilings target.'
                                        : interfaceState ===
                                          'requestTidalSurgeTarget'
                                        ? 'Choose Tidal Surge target.'
                                        : interfaceState ===
                                          'requestTidalWaveTarget'
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
                                    socket.emit(
                                        'responseFleeChoice',
                                        character,
                                    );
                                    setInterfaceState(null);
                                }}
                            />
                        );
                    case 'requestMovementSet':
                        return (
                            <MovementSetWidget
                                gameState={gameState}
                                submit={(movementSet) => {
                                    socket.emit(
                                        'responseMovementSet',
                                        movementSet,
                                    );
                                    setInterfaceState(null);
                                }}
                            />
                        );
                    case 'joinFail':
                        return 'j f';
                    case 'gameState':
                    case null:
                        return (
                            <>
                                <Board gameState={gameState} />
                                <ActionOrderTrack gameState={gameState} />
                                <Hand gameState={gameState} />
                                Waiting for opponent
                            </>
                        );
                    default:
                        return assertUnreachable(interfaceState);
                }
            })()}
            <br />
            <br />
            <br />
            {/*
            <textarea
                readOnly={true}
                style={{ height: '1000px', width: '700px' }}
                value={JSON.stringify(gameState, null, 4)}
            />
            */}
        </div>
    );
};
