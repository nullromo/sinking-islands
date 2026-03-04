import { actionOrderTrackElementID } from '../actionOrderTrack';
import { createBasicGame } from './pageData';

const buildCutout = (box: DOMRect, pad: number) => {
    return `polygon(0% 0%, 0% 100%, ${box.left - pad}px 100%, ${box.left - pad}px ${box.top - pad}px, ${box.right + pad}px ${box.top - pad}px, ${box.right + pad}px ${box.bottom + pad}px, ${box.left - pad}px ${box.bottom + pad}px, ${box.left - pad}px 100%, 100% 100%, 100% 0%)`;
};

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
    const actionOrderTrackBox = getElementBoundingRect(
        actionOrderTrackElementID,
    );
    return (
        <div
            style={{
                background: '#00000088',
                clipPath: buildCutout(actionOrderTrackBox, 20),
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
