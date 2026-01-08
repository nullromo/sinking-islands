import React from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { ActionOrderTrack } from './actionOrderTrack';
import { Board } from './board';
import type { GameSerialized, PlayerDesignator } from './commonTypes';
import { CreateOrJoinPage } from './createOrJoinPage';
import { Hand } from './hand';
import type { CheckResult } from './server/checkResult';
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
import { MessageLog } from './messageLog';

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

const WidgetSelector = (props: {
    readonly interfaceState: keyof ServerToClientEvents | null;
    readonly setInterfaceState: (
        value: keyof ServerToClientEvents | null,
    ) => void;
    readonly gameState: GameSerialized;
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
                            socket.emit('responseCardPlacement', cardPlacement);
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
                            socket.emit('responseFogTarget', fogTarget);
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
                        socket.emit('responseFleeChoice', character);
                        setInterfaceState(null);
                    }}
                />
            );
        case 'requestMovementSet':
            return (
                <MovementSetWidget
                    gameState={gameState}
                    submit={(movementSet) => {
                        socket.emit('responseMovementSet', movementSet);
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

const GameIDBanner = (props: {
    readonly gameID: string;
    readonly status: CheckResult;
    readonly you: PlayerDesignator;
}) => {
    return (
        <>
            <div
                style={{
                    alignItems: 'flex-end',
                    background: 'lightgray',
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '10pt',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                }}
            >
                <div>{`You are ${props.you}`}</div>
                <div
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: '6px',
                    }}
                >
                    <div>Game ID</div>
                    <button
                        style={{ fontSize: '8pt' }}
                        type='button'
                        onClick={() => {
                            navigator.clipboard
                                .writeText(props.gameID)
                                .catch(console.error);
                        }}
                    >
                        Copy
                    </button>
                </div>
                <div>{props.gameID}</div>
            </div>
            <div
                style={{
                    alignItems: 'flex-end',
                    background: props.status.success ? 'lightgreen' : 'tomato',
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '10pt',
                    position: 'absolute',
                    right: '10px',
                    top: '70px',
                }}
            >
                {props.status.message}
            </div>
        </>
    );
};

export const GamePage = () => {
    const [gameState, setGameState] = React.useState<GameSerialized | null>(
        null,
    );
    const [interfaceState, setInterfaceState] = React.useState<
        keyof ServerToClientEvents | null
    >(null);
    const [status, setStatus] = React.useState<CheckResult>({
        message: '',
        success: true,
    });

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
        socket.on('updateStatus', (status) => {
            console.log(
                `${status.success ? 'Status' : 'Error'}: ${status.message}`,
            );
            setStatus(status);
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
        <div style={{ display: 'flex', height: '100%' }}>
            <GameIDBanner
                gameID={gameState.id}
                status={status}
                you={gameState.you}
            />
            <div>
            </div>
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <WidgetSelector
                    gameState={gameState}
                    interfaceState={interfaceState}
                    setInterfaceState={setInterfaceState}
                />
                {/*
            <br />
            <br />
            <br />
            <textarea
                readOnly={true}
                style={{ height: '1000px', width: '700px' }}
                value={JSON.stringify(gameState, null, 4)}
            />
            */}
            </div>
        </div>
    );
};
