import React from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { CircularContainer } from './circularContainer';
import type { GameSerialized } from './commonTypes';
import {
    PlayerDesignator,
    IslandType,
    otherPlayerDesignator,
} from './commonTypes';
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

const CreateOrJoinPage = (props: {
    emitCreate: () => void;
    emitJoin: (id: string) => void;
}) => {
    const [joinID, setJoinID] = React.useState('');

    return (
        <div>
            <button
                type='button'
                onClick={() => {
                    props.emitCreate();
                }}
            >
                Create Game
            </button>
            <input
                type='text'
                value={joinID}
                onChange={(event) => {
                    setJoinID(event.target.value);
                }}
            />
            <button
                type='button'
                onClick={() => {
                    props.emitJoin(joinID);
                }}
            >
                Join Game
            </button>
        </div>
    );
};

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
        <div>
            <textarea
                style={{ height: '1000px', width: '700px' }}
                value={JSON.stringify(gameState, null, 4)}
            />
            <br />
            {(() => {
                switch (interfaceState) {
                    case 'requestCardPlacement':
                        return (
                            <CardPlacementWidget
                                submit={(cardPlacement) => {
                                    socket.emit(
                                        'responseCardPlacement',
                                        cardPlacement,
                                    );
                                    setInterfaceState(null);
                                }}
                                you={gameState.you}
                                yourHand={gameState.yourHand}
                            />
                        );
                    case 'requestFlyingFishMovement':
                        return (
                            <FlyingFishMovementWidget
                                submit={(flyingFishMovement) => {
                                    socket.emit(
                                        'responseFlyingFishMovement',
                                        flyingFishMovement,
                                    );
                                    setInterfaceState(null);
                                }}
                                you={gameState.you}
                            />
                        );
                    case 'requestFogTarget':
                        return (
                            <FogTargetWidget
                                submit={(fogTarget) => {
                                    socket.emit('responseFogTarget', fogTarget);
                                    setInterfaceState(null);
                                }}
                            />
                        );
                    case 'requestHarpoonTarget':
                    case 'requestTortoiseTarget':
                        return (
                            <CharacterTargetWidget
                                player={
                                    interfaceState === 'requestHarpoonTarget'
                                        ? otherPlayerDesignator(gameState.you)
                                        : gameState.you
                                }
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
                            />
                        );
                    case 'requestNetTarget':
                    case 'requestPilingsTarget':
                    case 'requestTidalSurgeTarget':
                    case 'requestTidalWaveTarget':
                    case 'requestVolcanicEruptionTarget':
                        return (
                            <IslandSelectorWidget
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
                            />
                        );
                    case 'requestFleeChoice':
                        return (
                            <FleeChoiceWidget
                                submit={(character) => {
                                    socket.emit(
                                        'responseFleeChoice',
                                        character,
                                    );
                                    setInterfaceState(null);
                                }}
                                you={gameState.you}
                            />
                        );
                    case 'requestMovementSet':
                        return (
                            <MovementSetWidget
                                submit={(movementSet) => {
                                    socket.emit(
                                        'responseMovementSet',
                                        movementSet,
                                    );
                                    setInterfaceState(null);
                                }}
                                you={gameState.you}
                            />
                        );
                    case 'joinFail':
                        return 'j f';
                    case 'gameState':
                    case null:
                        return null;
                    default:
                        return assertUnreachable(interfaceState);
                }
            })()}
        </div>
    );
};
