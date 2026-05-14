import * as React from 'react';
import { Link } from 'react-router';
import { GameContext } from '../../contexts/gameContext';
import { useCoordinatesRef } from '../../hooks/useCoordinatesRef';
import type { PlayerDesignator } from '../../info/commonTypes';
import { otherPlayerDesignator } from '../../info/commonTypes';
import { getPlayerColor } from '../../info/playerColors';
import { PageRoutes } from '../../router/pageRoutes';
import { gameInfoElementID } from '../../tutorial/elementIDs';
import { DeckIcon } from './gameInfoIcons/deckIcon';
import { DiscardPileIcon } from './gameInfoIcons/discardPileIcon';
import { HandIcon } from './gameInfoIcons/handIcon';
import { SetAsideCardsIcon } from './gameInfoIcons/setAsideCardsIcon';
import { RulesPopup } from './rulesPopup';

const PlayerDetails = (props: {
    readonly playerDesignator: PlayerDesignator;
}) => {
    return (
        <div style={{ columnGap: '10px', display: 'flex', paddingTop: '6px' }}>
            <DeckIcon playerDesignator={props.playerDesignator} />
            <HandIcon playerDesignator={props.playerDesignator} />
            <DiscardPileIcon playerDesignator={props.playerDesignator} />
            <SetAsideCardsIcon playerDesignator={props.playerDesignator} />
        </div>
    );
};

export const GameInfo = () => {
    const gameContext = React.use(GameContext);

    const [showRules, setShowRules] = React.useState(false);

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
                <div
                    style={{
                        columnGap: '10px',
                        display: 'flex',
                        paddingBottom: '6px',
                    }}
                >
                    <button
                        type='button'
                        onClick={() => {
                            setShowRules(true);
                        }}
                    >
                        Show game rules
                    </button>
                    <Link to={PageRoutes.DASHBOARD}>
                        <button type='button'>Exit to Dashboard</button>
                    </Link>
                </div>
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
                            <PlayerDetails playerDesignator={you} />
                        </td>
                        <td>
                            <PlayerDetails playerDesignator={opponent} />
                        </td>
                    </tr>
                </tbody>
            </table>
            {showRules ? (
                <RulesPopup
                    hide={() => {
                        setShowRules(false);
                    }}
                />
            ) : null}
        </div>
    );
};
