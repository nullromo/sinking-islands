import * as React from 'react';

type CoordinatesContextData = {
    getCoordinates: (key: string) => DOMRect;
    setCoordinates: (key: string, value: DOMRect) => void;
};

export const CoordinatesContext = React.createContext<CoordinatesContextData>({
    getCoordinates: () => {
        throw new Error('Unmounted context');
    },
    setCoordinates: () => {
        throw new Error('Unmounted context');
    },
});
CoordinatesContext.displayName = 'CoordinatesContext';

export const CoordinatesContextProvider = (props: React.PropsWithChildren) => {
    const [map, setMap] = React.useState<Partial<Record<string, DOMRect>>>({});

    const getCoordinates = React.useCallback(
        (key: string) => {
            const value = map[key];
            return (
                value ?? {
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
        },
        [map],
    );

    const setCoordinates = (key: string, value: DOMRect) => {
        setMap((previousMap) => {
            return { ...previousMap, [key]: value };
        });
    };

    const value = React.useMemo(() => {
        return { getCoordinates, setCoordinates };
    }, [getCoordinates]);

    return (
        <CoordinatesContext value={value}>{props.children}</CoordinatesContext>
    );
};
