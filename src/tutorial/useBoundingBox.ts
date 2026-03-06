import * as React from 'react';
import { getElementBoundingRect } from './elementIDs';

export const useBoundingBox = (elementID: string) => {
    const [box, setBox] = React.useState(() => {
        return getElementBoundingRect(elementID);
    });

    React.useEffect(() => {
        let timeout: NodeJS.Timeout | null = null;
        const onResize = () => {
            // for some reason, there needs to be a delay here to let the DOM
            // update in time. It's not ideal, but it works okay
            timeout = setTimeout(() => {
                setBox(getElementBoundingRect(elementID));
            }, 1);
        };
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    });

    return box;
};
