import * as React from 'react';
import { CoordinatesContext } from '../../contexts/coordinatesContext';
import { buildCutout } from '../buildCutout';
import { buildIslandElementID } from '../elementIDs';
import { createBasicGameWithCharacters } from '../pageData';
import { TutorialDimOverlay, TutorialTextBox } from '../styles';

const RisingWatersScreen = () => {
    const coordinatesContext = React.use(CoordinatesContext);
    const islandBox = coordinatesContext.getCoordinates(
        buildIslandElementID(1),
    );

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <TutorialDimOverlay clipPath={buildCutout(islandBox, 30)} />
            <TutorialTextBox
                style={{
                    left: islandBox.left + islandBox.width,
                    position: 'absolute',
                    top: islandBox.top + islandBox.height,
                    width: '500px',
                }}
            >
                This island is about to sink!
                <hr />
                Each round, the island marked by Rising Waters will sink,
                removing it from the game and killing any characters on it. The
                Rising Waters will then advance to the next island in island
                number sequence (or to the lowest numbered island if there is no
                higher numbered island)
            </TutorialTextBox>
        </div>
    );
};

export const RisingWatersScreenData = {
    createGame: createBasicGameWithCharacters,
    overlay: <RisingWatersScreen />,
};
