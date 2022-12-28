import type { GameSerialized } from './commonTypes';

interface ActionOrderTrackProps {
    gameState: GameSerialized;
    onSlotClicked: (slotIndex: number) => void;
}

export const ActionOrderTrack = (props: ActionOrderTrackProps) => {
    return (
        <div style={{ display: 'flex', textAlign: 'center' }}>
            {props.gameState.actionOrderTrack.cardSlots.map(
                (slot, slotIndex) => {
                    return (
                        <div
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
                                width: '100px',
                            }}
                            onClick={() => {
                                props.onSlotClicked(slotIndex);
                            }}
                        >
                            {slot ? `${slot.cardType ?? 'Face Down'}` : 'Empty'}
                        </div>
                    );
                },
            )}
        </div>
    );
};
