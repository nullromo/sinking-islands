import * as React from 'react';

export const useDynamicSize = (
    computeSize: (element: HTMLElement) => number,
) => {
    const [size, setSize] = React.useState(0);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const updateSize = () => {
            if (ref.current) {
                setSize(computeSize(ref.current));
            }
        };
        updateSize();
        const observer = new ResizeObserver(updateSize);
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            observer.disconnect();
        };
    });

    return { ref, size };
};
