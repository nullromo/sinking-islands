import * as React from 'react';
import { otherPlayerDesignator } from './commonTypes';
import { CardPileWindow } from './discardPileWindow';
import { GameContext } from './gameContext';

export const HandAndDeckInfo = () => {
    const gameContext = React.use(GameContext);
    return (
        <div
            style={{
                background: 'tan',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '270px',
                padding: '4px',
                width: '100%',
            }}
        >
            <table>
                <thead>
                    <tr>
                        <th>You</th>
                        <th>Your Opponent</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div>{`Cards in deck: ${gameContext.game.players[gameContext.you].deck.length}`}</div>
                        </td>
                        <td>
                            <div>{`Cards in deck: ${gameContext.game.players[otherPlayerDesignator(gameContext.you)].deck.length}`}</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div>{`Cards in hand: ${gameContext.game.players[gameContext.you].hand.length}`}</div>
                        </td>
                        <td>
                            <div>{`Cards in hand: ${gameContext.game.players[otherPlayerDesignator(gameContext.you)].hand.length}`}</div>
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
