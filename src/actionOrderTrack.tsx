import type { CardSerialized, GameSerialized } from './commonTypes';
import { upperSnakeToTitle } from './util';

interface ActionOrderTrackProps {
    gameState: GameSerialized;
    onSlotClicked: (slotIndex: number) => void;
    overrideCards?: Array<CardSerialized | null>;
}

export const ActionOrderTrack = (props: ActionOrderTrackProps) => {
    return (
        <div style={{ display: 'flex', textAlign: 'center' }}>
            <table>
                <thead>
                    <tr>
                        <th style={{ background: 'khaki' }}>1</th>
                        <th style={{ background: 'khaki' }}>2</th>
                        <th style={{ background: 'lightpink' }}>3</th>
                        <th style={{ background: 'lightpink' }}>4</th>
                        <th style={{ background: 'palegreen' }}>5</th>
                        <th style={{ background: 'palegreen' }}>6</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {props.gameState.actionOrderTrack.cardSlots.map(
                            (card, slotIndex) => {
                                const overrideCard = props.overrideCards
                                    ? props.overrideCards[slotIndex]
                                    : null;
                                return (
                                    <td
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={slotIndex}
                                        style={{
                                            background:
                                                overrideCard?.playerDesignator ===
                                                    props.gameState.you ||
                                                card?.playerDesignator ===
                                                    props.gameState.you
                                                    ? 'skyblue'
                                                    : overrideCard || card
                                                    ? 'indianred'
                                                    : 'lightgray',
                                            height: '60px',
                                            width: '100px',
                                        }}
                                        onClick={() => {
                                            props.onSlotClicked(slotIndex);
                                        }}
                                    >
                                        {overrideCard
                                            ? upperSnakeToTitle(
                                                  overrideCard.cardType,
                                              )
                                            : card
                                            ? upperSnakeToTitle(
                                                  card.cardType ?? 'Face Down',
                                              )
                                            : 'Empty'}
                                    </td>
                                );
                            },
                        )}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
