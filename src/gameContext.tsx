import * as React from 'react';
import type { GameSerialized } from './commonTypes';
import { PlayerDesignator } from './commonTypes';
import { createBlankGame } from './createBlankGame';
import { LoggedInUserContext } from './loggedInUserContext';

type GameContextData = {
    game: GameSerialized;
    gameLoaded: boolean;
    setGame: (value: GameSerialized) => void;
    setGameLoaded: (value: boolean) => void;
    you: PlayerDesignator;
};

export const GameContext = React.createContext<GameContextData>({
    game: createBlankGame(),
    gameLoaded: false,
    setGame: () => {
        throw new Error('Unmounted context');
    },
    setGameLoaded: () => {
        throw new Error('Unmounted context');
    },
    you: PlayerDesignator.PLAYER_A,
});
GameContext.displayName = 'GameContext';

export const GameContextProvider = (props: React.PropsWithChildren) => {
    const loggedInUserContext = React.use(LoggedInUserContext);

    const [game, setGame] = React.useState<GameSerialized>(() => {
        return createBlankGame();
    });
    const [gameLoaded, setGameLoaded] = React.useState(false);

    const you = (() => {
        // if the game is not loaded yet, then just choose player A
        if (!gameLoaded) {
            return PlayerDesignator.PLAYER_A;
        }
        if (
            game.players[PlayerDesignator.PLAYER_A].username ===
            loggedInUserContext.loggedInUser
        ) {
            return PlayerDesignator.PLAYER_A;
        }
        if (
            game.players[PlayerDesignator.PLAYER_B].username ===
            loggedInUserContext.loggedInUser
        ) {
            return PlayerDesignator.PLAYER_B;
        }
        // TODO: do not throw here. Should redirect or something instead
        throw new Error('You are not a player in this game.');
    })();

    const value = React.useMemo(() => {
        return {
            game,
            gameLoaded,
            setGame: (value: GameSerialized) => {
                setGame(value);
            },
            setGameLoaded,
            you,
        };
    }, [gameLoaded, game, you]);

    return <GameContext value={value}>{props.children}</GameContext>;
};
