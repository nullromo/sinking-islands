import * as React from 'react';
import type { GameSerialized } from '../info/commonTypes';
import { PlayerDesignator } from '../info/commonTypes';
import { createBlankGame } from '../info/createBlankGame';
import { LoggedInUserContext } from './loggedInUserContext';

export type GameContextData = {
    game: GameSerialized;
    gameLoaded: boolean;
    setGame: (value: GameSerialized) => void;
    setGameLoaded: (value: boolean) => void;
    you: PlayerDesignator;
    spectator: boolean;
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
    spectator: false,
    you: PlayerDesignator.PLAYER_A,
});
GameContext.displayName = 'GameContext';

export const GameContextProvider = (props: React.PropsWithChildren) => {
    const loggedInUserContext = React.use(LoggedInUserContext);

    const [game, setGame] = React.useState<GameSerialized>(() => {
        return createBlankGame();
    });
    const [gameLoaded, setGameLoaded] = React.useState(false);

    const realYou: PlayerDesignator | null = (() => {
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
        // the player is spectating
        return null;
    })();

    const value = React.useMemo(() => {
        return {
            game,
            gameLoaded,
            setGame: (value: GameSerialized) => {
                setGame(value);
            },
            setGameLoaded,
            spectator: realYou === null,
            you: realYou ?? PlayerDesignator.PLAYER_A,
        };
    }, [gameLoaded, game, realYou]);

    return <GameContext value={value}>{props.children}</GameContext>;
};
