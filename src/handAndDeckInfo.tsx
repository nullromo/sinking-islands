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
                display: 'flex',
                flexDirection: 'column',
                minWidth: '270px',
                padding: '4px',
            }}
        >
            <div>{`Cards in your deck: ${gameContext.game.players[gameContext.you].deck.length}`}</div>
            <div>{`Cards in your opponent's deck: ${gameContext.game.players[otherPlayerDesignator(gameContext.you)].deck.length}`}</div>
            <div>{`Cards in your opponent's hand: ${gameContext.game.players[otherPlayerDesignator(gameContext.you)].hand.length}`}</div>
            <div>
                <CardPileWindow
                    cardPile='discardPile'
                    gameState={gameContext.game}
                    opponent={false}
                />
            </div>
            <div>
                <CardPileWindow
                    cardPile='discardPile'
                    gameState={gameContext.game}
                    opponent={true}
                />
            </div>
            <div>
                <CardPileWindow
                    cardPile='setAsideCards'
                    gameState={gameContext.game}
                    opponent={false}
                />
            </div>
            <div>
                <CardPileWindow
                    cardPile='setAsideCards'
                    gameState={gameContext.game}
                    opponent={true}
                />
            </div>
        </div>
    );
};
