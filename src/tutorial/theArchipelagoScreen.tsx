import { buildCutout } from './buildCutout';
import { boardElementID, getElementBoundingRect } from './elementIDs';
import { createBasicGame } from './pageData';
import { TutorialDimOverlay, TutorialTextBox } from './styles';

const TheArchipelagoScreen = () => {
    const boardBox = getElementBoundingRect(boardElementID);
    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <TutorialDimOverlay clipPath={buildCutout(boardBox, 20)} />
            <TutorialTextBox
                style={{
                    left: boardBox.left + boardBox.width / 2 - 260,
                    maxHeight: '130px',
                    maxWidth: '520px',
                    position: 'absolute',
                    top: boardBox.top + boardBox.height / 2 - 65,
                }}
            >
                The Archipelago
                <hr />
                This ring of 16 islands is all the ground your people have to
                stand on. The islands begin the game in a random order.
            </TutorialTextBox>
        </div>
    );
};

export const TheArchipelagoScreenData = {
    createGame: createBasicGame,
    overlay: <TheArchipelagoScreen />,
};
