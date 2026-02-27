import { ActionOrderTrack } from '../actionOrderTrack';
import { Board } from '../board';
import { Hand } from '../hand';

export const WaitingForPlayerWidget = () => {
    return (
        <>
            <Board />
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <ActionOrderTrack />
                <Hand />
                Waiting for opponent
            </div>
        </>
    );
};
