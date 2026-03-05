import { buildCutout } from './buildCutout';
import {
    actionOrderTrackElementID,
    getElementBoundingRect,
} from './elementIDs';
import { createBasicGameWithCharacters } from './pageData';
import { TutorialDimOverlay, TutorialTextBox } from './styles';

const RoundStructureScreen = () => {
    const actionOrderTrackBox = getElementBoundingRect(
        actionOrderTrackElementID,
    );
    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <TutorialDimOverlay
                clipPath={buildCutout(actionOrderTrackBox, 16)}
            />
            <TutorialTextBox
                style={{
                    left: actionOrderTrackBox.left - 750,
                    position: 'absolute',
                    top: actionOrderTrackBox.top,
                    width: '700px',
                }}
            >
                Round Structure
                <hr />
                At the start of the game, the player who has a character on
                island number 1 gets{' '}
                <em style={{ color: 'orange' }}>the initiative</em>.
                <ol>
                    <li style={{ paddingBottom: '30px' }}>
                        <b style={{ textDecoration: 'underline' }}>
                            Card placement
                        </b>{' '}
                        — The player with{' '}
                        <em style={{ color: 'orange' }}>the initiative</em>{' '}
                        places 3 cards face down on the action order track. Then
                        the other player places 3 cards face down on the action
                        order track.
                    </li>
                    <li style={{ paddingBottom: '30px' }}>
                        <b style={{ textDecoration: 'underline' }}>
                            Card resolution
                        </b>{' '}
                        — The action order track resolves 1 card at a time.
                    </li>
                    <li>
                        <b style={{ textDecoration: 'underline' }}>
                            End of round
                        </b>{' '}
                        — The island marked by Rising Waters sinks and the
                        Rising Waters advances.{' '}
                        <em style={{ color: 'orange' }}>The initiative</em>{' '}
                        shifts to the other player. Each player draws 3 cards.
                    </li>
                </ol>
            </TutorialTextBox>
        </div>
    );
};

export const RoundStructureScreenData = {
    createGame: createBasicGameWithCharacters,
    overlay: <RoundStructureScreen />,
};
