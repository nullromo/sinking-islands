import * as React from 'react';
import { Link } from 'react-router';
import { GameContext } from '../../contexts/gameContext';
import { useCoordinatesRef } from '../../hooks/useCoordinatesRef';
import { otherPlayerDesignator } from '../../info/commonTypes';
import { getPlayerColor } from '../../info/playerColors';
import { PageRoutes } from '../../router/pageRoutes';
import { gameInfoElementID } from '../../tutorial/elementIDs';
import { CardPileWindow } from './discardPileWindow';
import { DeckIcon } from './gameInfoIcons/deckIcon';

export const GameInfo = () => {
    const gameContext = React.use(GameContext);

    const you = gameContext.you;
    const opponent = otherPlayerDesignator(gameContext.you);

    const gameInfoRef = useCoordinatesRef(gameInfoElementID);

    return (
        <div
            ref={gameInfoRef}
            style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '270px',
                paddingBottom: '4px',
                width: '100%',
            }}
        >
            <div
                style={{
                    alignItems: 'flex-end',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                }}
            >
                <Link to={PageRoutes.DASHBOARD}>
                    <button type='button'>Exit to Dashboard</button>
                </Link>
                <div
                    style={{
                        fontSize: '10px',
                        marginBottom: '6px',
                        textAlign: 'right',
                        width: '100%',
                    }}
                >
                    Game ID: <b>{gameContext.game.id}</b>
                </div>
            </div>
            <table style={{ background: 'darkgray', border: '1px solid' }}>
                <thead>
                    <tr>
                        <th
                            style={{
                                background: getPlayerColor(you, you).dim,
                                textAlign: 'left',
                                width: '50%',
                            }}
                        >
                            You — {gameContext.game.players[you].username} (
                            {you})
                        </th>
                        <th
                            style={{
                                background: getPlayerColor(opponent, you).dim,
                                textAlign: 'left',
                                width: '50%',
                            }}
                        >
                            Opponent —{' '}
                            {gameContext.game.players[opponent].username} (
                            {opponent})
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-evenly',
                                }}
                            >
                                <DeckIcon
                                    label={
                                        gameContext.game.players[you].deck
                                            .length
                                    }
                                />
                                <DeckIcon
                                    label={
                                        gameContext.game.players[you].hand
                                            .length
                                    }
                                />
                                <DeckIcon
                                    label={
                                        gameContext.game.players[you]
                                            .discardPile.length
                                    }
                                />
                                <DeckIcon
                                    label={
                                        gameContext.game.players[you]
                                            .setAsideCards.length
                                    }
                                />
                            </div>
                            <div>{`Cards in deck: ${gameContext.game.players[you].deck.length}`}</div>
                        </td>
                        <td>
                            <div>{`Cards in deck: ${gameContext.game.players[opponent].deck.length}`}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>{`Cards in hand: ${gameContext.game.players[you].hand.length}`}</div>
                        </td>
                        <td>
                            <div>{`Cards in hand: ${gameContext.game.players[opponent].hand.length}`}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                <CardPileWindow
                                    cardPile='discardPile'
                                    gameState={gameContext.game}
                                    opponent={false}
                                />
                            </div>
                        </td>
                        <td>
                            <div>
                                <CardPileWindow
                                    cardPile='discardPile'
                                    gameState={gameContext.game}
                                    opponent={true}
                                />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>
                                <CardPileWindow
                                    cardPile='setAsideCards'
                                    gameState={gameContext.game}
                                    opponent={false}
                                />
                            </div>
                        </td>
                        <td>
                            <div>
                                <CardPileWindow
                                    cardPile='setAsideCards'
                                    gameState={gameContext.game}
                                    opponent={true}
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
