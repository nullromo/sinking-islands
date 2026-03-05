import * as React from 'react';
import { Link, Navigate } from 'react-router';
import type { GameSerialized } from '../commonTypes';
import { PlayerDesignator } from '../commonTypes';
import type { GameContextData } from '../gameContext';
import { GameContext } from '../gameContext';
import { GamePageInner } from '../gamePage';
import { PageRoutes } from '../pageRoutes';
import { useDynamicSize } from '../useDynamicSize';
import { ActionOrderTrackScreenData } from './actionOrderTrackScreen';
import { CardsScreenData } from './cardsScreen';
import { CharactersScreenData } from './charactersScreen';
import { DeckCompositionScreenData } from './deckCompositionScreen';
import { GameEndScreenData } from './gameEndScreen';
import { IntroductionScreenData } from './introductionScreen';
import { IslandsScreenData } from './islandsScreen';
import { RisingWatersScreenData } from './risingWatersScreen';
import { RoundStructureScreenData } from './roundStructureScreen';
import { TheArchipelagoScreenData } from './theArchipelagoScreen';

/**
 * Each tutorial screen has a function that sets up the game state for that
 * screen and an element to render on top of the screen.
 */
const screens: Partial<
    Array<{ createGame: () => GameSerialized; overlay: React.JSX.Element }>
> = [
    IntroductionScreenData,
    TheArchipelagoScreenData,
    IslandsScreenData,
    CharactersScreenData,
    RisingWatersScreenData,
    RoundStructureScreenData,
    ActionOrderTrackScreenData,
    CardsScreenData,
    DeckCompositionScreenData,
    GameEndScreenData,
];

export const TutorialPage = () => {
    const [screenID, setScreenID] = React.useState(1);

    // get data for the current screen
    const screenData = React.useMemo(() => {
        const item = screens[screenID - 1];
        if (item === undefined) {
            return null;
        }

        // prepare data for the game context provider
        const gameContextData: GameContextData = {
            game: item.createGame(),
            gameLoaded: true,
            setGame: () => {
                //
            },
            setGameLoaded: () => {
                //
            },
            you: PlayerDesignator.PLAYER_A,
        };
        return { gameContextData, overlay: item.overlay };
    }, [screenID]);

    const { ref: gamePageRef, size: gamePageHeight } = useDynamicSize(
        (element) => {
            return element.getBoundingClientRect().height;
        },
    );

    // if there is no data for the screen ID, just go back to the dashboard
    if (screenData === null) {
        return <Navigate to={PageRoutes.DASHBOARD} />;
    }

    const buttonStyle: React.CSSProperties = {
        background: 'black',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16pt',
        padding: '0 12px',
    };

    const tutorialNavbar = (
        <div
            style={{
                border: '12px solid transparent',
                bottom: 0,
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'space-between',
                position: 'absolute',
                width: '100vw',
            }}
        >
            <button
                disabled={screenID <= 1}
                style={{
                    ...buttonStyle,
                    background: screenID <= 1 ? 'gray' : 'black',
                    cursor: screenID <= 1 ? 'default' : 'pointer',
                }}
                type='button'
                onClick={() => {
                    setScreenID((screenID) => {
                        return screenID - 1;
                    });
                }}
            >
                {'< Prev'}
            </button>
            {Array(screens.length)
                .keys()
                .map((index) => {
                    const id = index + 1;
                    const active = screenID === id;
                    return (
                        <div key={id}>
                            <div
                                style={{
                                    alignItems: 'center',
                                    background: 'black',
                                    borderRadius: '50%',
                                    boxShadow: active
                                        ? '0px 0px 6px 3px yellow'
                                        : '',
                                    color: active ? 'yellow' : 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    fontSize: '16pt',
                                    height: '32px',
                                    justifyContent: 'center',
                                    width: '32px',
                                }}
                                onClick={() => {
                                    setScreenID(id);
                                }}
                            >
                                {id}
                            </div>
                        </div>
                    );
                })}
            {screenID === screens.length ? (
                <Link style={{ display: 'contents' }} to={PageRoutes.DASHBOARD}>
                    <button style={buttonStyle} type='button'>
                        Home
                    </button>
                </Link>
            ) : (
                <button
                    style={buttonStyle}
                    type='button'
                    onClick={() => {
                        setScreenID((screenID) => {
                            return screenID + 1;
                        });
                    }}
                >
                    {'Next >'}
                </button>
            )}
        </div>
    );

    return (
        <GameContext value={screenData.gameContextData}>
            <div style={{ margin: '12px', position: 'absolute', zIndex: 100 }}>
                <Link to={PageRoutes.DASHBOARD}>
                    <button
                        style={{ ...buttonStyle, height: '32px' }}
                        type='button'
                    >
                        Home
                    </button>
                </Link>
            </div>
            <div ref={gamePageRef}>
                <GamePageInner />
            </div>
            <div
                style={{
                    height: gamePageHeight,
                    position: 'fixed',
                    top: 0,
                    width: '100vw',
                }}
            >
                {screenData.overlay}
            </div>
            {tutorialNavbar}
        </GameContext>
    );
};
