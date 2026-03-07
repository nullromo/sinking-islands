import * as React from 'react';
import { CoordinatesContext } from '../contexts/coordinatesContext';

export const useCoordinatesRef = (id: string | null) => {
    const coordinatesContext = React.use(CoordinatesContext);

    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const element = ref.current;
        if (id === null || element === null) {
            return () => {
                //
            };
        }
        const observer = new ResizeObserver(() => {
            coordinatesContext.setCoordinates(
                id,
                element.getBoundingClientRect(),
            );
        });
        observer.observe(element);
        return () => {
            observer.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);

    return ref;
};
