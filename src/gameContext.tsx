import React from 'react';
import type { GameSerialized } from './commonTypes';
import { PlayerDesignator } from './commonTypes';
import { createBlankGame } from './createBlankGame';
import { LoggedInUserContext } from './loggedInUserContext';

type GameContextData = {
    gameState: GameSerialized;
    setGameState: (value: GameSerialized) => void;
    you: PlayerDesignator;
};

export const GameContext = React.createContext<GameContextData>({
    gameState: createBlankGame(),
    setGameState: () => {
        throw new Error('Unmounted context');
    },
    you: PlayerDesignator.PLAYER_A,
});

export const GameContextProvider = (props: React.PropsWithChildren) => {
    const loggedInUserContext = React.useContext(LoggedInUserContext);

    const [gameState, setGameState] =
        React.useState<GameSerialized>(createBlankGame());

    const you = (() => {
        if (
            gameState.players[PlayerDesignator.PLAYER_A].username ===
            loggedInUserContext.loggedInUser
        ) {
            return PlayerDesignator.PLAYER_A;
        }
        if (
            gameState.players[PlayerDesignator.PLAYER_B].username ===
            loggedInUserContext.loggedInUser
        ) {
            return PlayerDesignator.PLAYER_B;
        }
        throw new Error('You are not a player in this game.');
    })();

    const value = React.useMemo(() => {
        return {
            gameState,
            setGameState: (value: GameSerialized) => {
                setGameState(value);
            },
            you,
        };
    }, [gameState, you]);

    return (
        <GameContext.Provider value={value}>
            {props.children}
        </GameContext.Provider>
    );
};
