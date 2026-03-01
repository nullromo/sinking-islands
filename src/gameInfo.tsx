import * as React from 'react';
import { otherPlayerDesignator } from './commonTypes';
import { CardPileWindow } from './discardPileWindow';
import { GameContext } from './gameContext';

export const GameInfo = () => {
    const gameContext = React.use(GameContext);

    const you = gameContext.you;
    const opponent = otherPlayerDesignator(gameContext.you);

    return (
        <div
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
                    fontSize: '10px',
                    marginBottom: '6px',
                    textAlign: 'right',
                    width: '100%',
                }}
            >
                Game ID: <b>{gameContext.game.id}</b>
            </div>
            <table style={{ background: 'darkgray', border: '1px solid' }}>
                <thead>
                    <tr>
                        <th
                            style={{
                                background: 'lightblue',
                                textAlign: 'left',
                                width: '50%',
                            }}
                        >
                            You — {gameContext.game.players[you].username} (
                            {you})
                        </th>
                        <th
                            style={{
                                background: 'indianred',
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
