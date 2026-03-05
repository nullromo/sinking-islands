export const boardElementID = 'board';
export const actionOrderTrackElementID = 'action-order-track';
export const island3ElementID = 'island-3';
export const island1ElementID = 'island-1';
export const gameInfoElementID = 'game-info';

export const getElementBoundingRect = (id: string) => {
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
