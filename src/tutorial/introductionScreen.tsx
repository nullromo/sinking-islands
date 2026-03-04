import { createBasicGame } from './pageData';
import { TutorialTextBox } from './styles';

const IntroductionScreen = () => {
    return (
        <div
            style={{
                alignItems: 'center',
                background: '#00000088',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                height: '100vh',
                justifyContent: 'space-around',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    justifyContent: 'space-evenly',
                    padding: '12px 30%',
                    textAlign: 'center',
                }}
            >
                <TutorialTextBox>
                    <div style={{ fontStyle: 'italic' }}>
                        {
                            "The gods are displeased! This petty human war has gone on far too long, and it's time for it to end!"
                        }
                    </div>
                    <hr style={{ margin: '12px  40px' }} />
                    <div>
                        {
                            "In Sinking Islands, battle ensues on an ever-shrinking archipelago. The gods have begun to sink the islands one at a time, and they won't stop until one army eliminates the other."
                        }
                    </div>
                    <hr style={{ margin: '12px  40px' }} />
                    <div style={{ fontStyle: 'italic' }}>
                        {
                            'Fight for survival, lest everyone sink into the stormy sea!'
                        }
                    </div>
                </TutorialTextBox>
            </div>
        </div>
    );
};

export const IntroductionScreenData = {
    createGame: createBasicGame,
    overlay: <IntroductionScreen />,
};
