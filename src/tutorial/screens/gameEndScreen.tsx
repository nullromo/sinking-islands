import { createBasicGameWithCharacters } from '../pageData';
import { TutorialDimOverlay, TutorialTextBox } from '../styles';

const GameEndScreen = () => {
    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: '100vw',
            }}
        >
            <TutorialDimOverlay clipPath='' />
            <TutorialTextBox
                style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '200px',
                    position: 'relative',
                    width: '700px',
                }}
            >
                Game End
                <hr />
                <p>Once you eliminate all the enemy characters, you win!</p>
                <p>
                    In rare cases there can be a tie if the last island sinks
                    with characters of both players still on it. In this case,
                    nobody wins, so kill your enemies as fast as possible to
                    quell the gods’ anger and save as many islands as possible!
                </p>
            </TutorialTextBox>
        </div>
    );
};

export const GameEndScreenData = {
    createGame: createBasicGameWithCharacters,
    overlay: <GameEndScreen />,
};
