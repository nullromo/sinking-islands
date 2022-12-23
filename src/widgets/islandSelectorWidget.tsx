import React from 'react';
import { IslandSelector } from './islandSelector';

interface IslandSelectorWidgetProps {
    submit: (islandNumber: number) => void;
}

export const IslandSelectorWidget = (props: IslandSelectorWidgetProps) => {
    const [islandChoice, setIslandChoice] = React.useState(1);

    return (
        <>
            {'Choose island'}
            <IslandSelector
                islandNumber={islandChoice}
                setIslandNumber={setIslandChoice}
            />
            <button
                type='button'
                onClick={() => {
                    props.submit(islandChoice);
                }}
            >
                Submit
            </button>
        </>
    );
};
