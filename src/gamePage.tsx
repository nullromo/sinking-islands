import React from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { GameStateGame } from './commonTypes';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from './socketEvents';
import { assertUnreachable } from './util';

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

export const GamePage = () => {
    const [gameState, setGameState] = React.useState<GameStateGame | null>(
        null,
    );
    const [interfaceState, setInterfaceState] = React.useState<
        keyof ServerToClientEvents | null
    >(null);

    let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
        null;

    React.useEffect(() => {
        socket = io('http://localhost:5151');
        console.log('Registering event listeners.');
        socket.on('gameState', (gameState: GameStateGame) => {
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
            socket?.on(eventName, () => {
                setInterfaceState(eventName);
            });
        });
        socket.on('joinFail', () => {
            console.log('Join failed');
        });
        return () => {
            console.log('Un-registering event listeners');
            socket?.removeAllListeners();
            console.log('Closing socket');
            socket?.close();
        };
    }, []);

    if (gameState === null) {
        return (
            <CreateOrJoinPage
                emitCreate={() => {
                    socket?.emit('createGame');
                }}
                emitJoin={(id) => {
                    socket?.emit('joinGame', id);
                }}
            />
        );
    }

    return (
        <div>
            <div>{JSON.stringify(gameState)}</div>
            <br />
            {(() => {
                switch (interfaceState) {
                    case 'requestCardPlacement':
                    case 'requestFlyingFishMovement':
                    case 'requestFogTarget':
                    case 'requestHarpoonTarget':
                    case 'requestMovementSet':
                    case 'requestNetTarget':
                    case 'requestPilingsTarget':
                    case 'requestTidalSurgeTarget':
                    case 'requestTidalWaveTarget':
                    case 'requestTortoiseTarget':
                    case 'requestVolcanicEruptionTarget':
                    case 'requestFleeChoice':
                        return <>{interfaceState}</>;
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
