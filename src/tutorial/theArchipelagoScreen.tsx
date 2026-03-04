import { actionOrderTrackElementID } from '../actionOrderTrack';
import { createBasicGame } from './pageData';

const getElementBoundingRect = (id: string) => {
    const element = document.getElementById(id);
    const boundingRect = element?.getBoundingClientRect();
    return (
        boundingRect ?? {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            toJSON: () => {
                //
            },
            top: 0,
            width: 0,
            x: 0,
            y: 0,
        }
    );
};

const TheArchipelagoScreen = () => {
    const x = getElementBoundingRect(actionOrderTrackElementID);
    return (
        <div
            style={{
                background: '#00000088',
                clipPath: `polygon(0% 0%, 0% 100%, ${x.left}px 100%, ${x.left}px ${x.top}px, ${x.right}px ${x.top}px, ${x.right}px ${x.bottom}px, ${x.left}px ${x.bottom}px, ${x.left}px 100%, 100% 100%, 100% 0%)`,
                height: '100%',
                width: '100%',
            }}
        >
            a
        </div>
    );
};

export const TheArchipelagoScreenData = {
    createGame: createBasicGame,
    overlay: <TheArchipelagoScreen />,
};
