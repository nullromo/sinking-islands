import * as React from 'react';

type MouseQuadrant = 1 | 2 | 3 | 4;

type MousePositionContextData = {
    mousePosition: { x: number; y: number };
    mouseQuadrant: MouseQuadrant;
};

export const MousePositionContext =
    React.createContext<MousePositionContextData>({
        mousePosition: { x: 0, y: 0 },
        mouseQuadrant: 2,
    });
MousePositionContext.displayName = 'MousePositionContext';

export const MousePositionContextProvider = (
    props: React.PropsWithChildren,
) => {
    const [mousePosition, setMousePosition] = React.useState<{
        x: number;
        y: number;
    }>({ x: 0, y: 0 });

    React.useEffect(() => {
        const updateMousePosition = (event: MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    const mouseQuadrant: MouseQuadrant = (() => {
        if (mousePosition.x > window.innerWidth / 2) {
            if (mousePosition.y > window.innerHeight / 2) {
                return 4;
            }
            return 1;
        }
        if (mousePosition.y > window.innerHeight / 2) {
            return 3;
        }
        return 2;
    })();

    const value = React.useMemo(() => {
        return { mousePosition, mouseQuadrant };
    }, [mousePosition, mouseQuadrant]);

    return (
        <MousePositionContext value={value}>
            {props.children}
        </MousePositionContext>
    );
};
