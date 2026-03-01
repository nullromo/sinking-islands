import * as React from 'react';

export const useMousePosition = () => {
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

    const mouseQuadrant = (() => {
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

    return { mousePosition, mouseQuadrant };
};
