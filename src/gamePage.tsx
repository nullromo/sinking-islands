import * as React from 'react';
import { Navigate, useParams } from 'react-router';
import type { GameSerialized } from './commonTypes';
import { GameContext, GameContextProvider } from './gameContext';
import { GameIDBanner } from './gameIDBanner';
import { HandAndDeckInfo } from './handAndDeckInfo';
import { MessageLog } from './messageLog';
import { PageRoutes } from './pageRoutes';
import { socket } from './socket';
import { useResultMessage } from './useResultMessage';
import { WidgetSelector } from './widgetSelector';

/**
 * Attach a socket that subscribes to state changes of a given game on mount
 * and clean it up on unmount.
 */
const useGameStateSocket = (gameID: string) => {
    const gameContext = React.use(GameContext);

    React.useEffect(() => {
        // establish a socket connection
        socket.connect();

        // register game state event listener
        socket.on('gameState', (game: GameSerialized) => {
            gameContext.setGame(game);
            gameContext.setGameLoaded(true);
        });

        // emit a subscribe event
        socket.emit('subscribeToGame', gameID);

        // clean up by disconnecting
        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

const GamePageInner = () => {
    const gameContext = React.use(GameContext);

    const [result, setResult] = useResultMessage();

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <GameIDBanner gameID={gameContext.game.id} status={result} />
            <div>
                <HandAndDeckInfo />
                <MessageLog gameState={gameContext.game} />
            </div>
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                <WidgetSelector setResult={setResult} />
            </div>
        </div>
    );
};

/**
 * Renders the game page once the game data is ready.
 */
const GamePageLoader = (props: { readonly gameID: string }) => {
    const gameContext = React.use(GameContext);

    // attach socket
    useGameStateSocket(props.gameID);

    // wait for game data to be ready (supplied by socket)
    if (!gameContext.gameLoaded) {
        return <>Loading...</>;
    }
    return <GamePageInner />;
};

/**
 * If the URL is properly formed, render the game page. Otherwise, navigate
 * back to the dashboard.
 */
export const GamePage = () => {
    // get game ID from URL
    const { gameID } = useParams();

    // redirect on malformed URL
    if (gameID === undefined) {
        return <Navigate to={PageRoutes.DASHBOARD} />;
    }

    return (
        <GameContextProvider>
            <GamePageLoader gameID={gameID} />
        </GameContextProvider>
    );
};
