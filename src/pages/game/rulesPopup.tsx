import { AllCardsDisplay } from '../../tutorial/screens/deckCompositionScreen';
import { TutorialTextBox } from '../../tutorial/styles';

interface PopupProps {
    readonly hide: () => void;
}

export const RulesPopup = (props: PopupProps) => {
    return (
        <div
            style={{
                background: '#00000099',
                height: '100vh',
                left: 0,
                position: 'absolute',
                top: 0,
                width: '100vw',
                zIndex: 50,
            }}
            onClick={() => {
                props.hide();
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '4px',
                    boxShadow: '0px 0px 10px 10px black',
                    left: '50%',
                    maxHeight: '80%',
                    maxWidth: '80%',
                    overflow: 'auto',
                    padding: '10px',
                    position: 'relative',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <h1>Rules Reference</h1>
                <p>
                    <em>
                        This is a reference guide. Please use the tutorial for
                        learning the game.
                    </em>
                </p>
                <h3>
                    <b>Objective</b>
                </h3>
                <p>You win by killing all the enemy characters.</p>
                <h3>
                    <b>Islands</b>
                </h3>
                <p>The game starts with 16 islands, as follows:</p>
                <ol>
                    <li>Normal island, limited capacity</li>
                    <li>Normal island, unlimited capacity</li>
                    <li>Normal island, unlimited capacity</li>
                    <li>Normal island, small capacity</li>
                    <li>Normal island, unlimited capacity</li>
                    <li>Volcanic island, unlimited capacity</li>
                    <li>Normal island, small capacity</li>
                    <li>Normal island, unlimited capacity</li>
                    <li>Volcanic island, unlimited capacity</li>
                    <li>Normal island, small capacity</li>
                    <li>Sacred island, unlimited capacity</li>
                    <li>Volcanic island, unlimited capacity</li>
                    <li>Normal island, small capacity</li>
                    <li>Sacred island, unlimited capacity</li>
                    <li>Volcanic island, unlimited capacity</li>
                    <li>Normal island, small capacity</li>
                </ol>
                <p>
                    The islands start in a random order. The Rising Waters start
                    on island 1. The Rising Waters always move to the
                    next-highest numbered island. If there is no such island,
                    they move to the lowest-numbered island.
                </p>
                <h3>
                    <b>Characters</b>
                </h3>
                <p>Each player starts with the following characters:</p>
                <ul>
                    <li>One 4-strength character</li>
                    <li>Three 3-strength characters</li>
                    <li>Four 2-strength characters</li>
                </ul>
                <p>
                    Each character is randomly assigned to an island when the
                    game starts.
                </p>
                <h3>
                    <b>Action Order Track</b>
                </h3>
                <p>
                    The player with the initiative places 3 cards face down,
                    then the other player places 3 cards face down. No player
                    may place two cards in the same section of the track. Each
                    player draws 3 cards at the end of the round.
                </p>
                <h3>
                    <b>Card Notes and Clarifications</b>
                </h3>
                <p>a</p>
            </div>
        </div>
    );
};

export const CardReferencePopup = (props: PopupProps) => {
    return (
        <div
            style={{
                background: '#00000099',
                height: '100vh',
                left: 0,
                position: 'fixed',
                top: 0,
                width: '100vw',
                zIndex: 50,
            }}
        >
            <div>
                <div
                    style={{
                        background: 'white',
                        borderRadius: '10px',
                        marginLeft: '20px',
                        padding: '0 12px 0 12px',
                        width: 'fit-content',
                    }}
                >
                    <h1>
                        <b>Card Reference</b>
                    </h1>
                </div>
                <div
                    style={{
                        height: '100%',
                        position: 'fixed',
                        top: 0,
                        width: '100vw',
                        zIndex: 50,
                    }}
                    onClick={() => {
                        props.hide();
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            height: '100vh',
                            justifyContent: 'center',
                            width: '100vw',
                        }}
                    >
                        <TutorialTextBox
                            style={{
                                alignItems: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '880px',
                                marginTop: '20px',
                                padding: '20px',
                                position: 'relative',
                                width: '1200px',
                            }}
                        >
                            <div
                                onClick={(event) => {
                                    event.stopPropagation();
                                }}
                            >
                                <AllCardsDisplay />
                            </div>
                        </TutorialTextBox>
                    </div>
                </div>
            </div>
        </div>
    );
};
