import type { GameSerialized } from './commonTypes';

interface ActionOrderTrackProps {
    gameState: GameSerialized;
    onSlotClicked: (slotIndex: number) => void;
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
                            (slot, slotIndex) => {
                                return (
                                    <td
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={slotIndex}
                                        style={{
                                            background:
                                                slot?.playerDesignator ===
                                                props.gameState.you
                                                    ? 'skyblue'
                                                    : slot
                                                    ? 'indianred'
                                                    : 'lightgray',
                                            height: '60px',
                                            width: '100px',
                                        }}
                                        onClick={() => {
                                            props.onSlotClicked(slotIndex);
                                        }}
                                    >
                                        {slot
                                            ? `${slot.cardType ?? 'Face Down'}`
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
