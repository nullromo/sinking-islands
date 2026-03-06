import { buildCutout } from '../buildCutout';
import { gameInfoElementID } from '../elementIDs';
import { createBasicGameWithCharacters } from '../pageData';
import { TutorialDimOverlay, TutorialTextBox } from '../styles';
import { useBoundingBox } from '../useBoundingBox';

const CardsScreen = () => {
    const gameInfoBox = useBoundingBox(gameInfoElementID);
    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <TutorialDimOverlay clipPath={buildCutout(gameInfoBox, 10)} />
            <TutorialTextBox
                style={{
                    left: gameInfoBox.left - 630,
                    position: 'absolute',
                    top: gameInfoBox.top + gameInfoBox.height,
                    width: '600px',
                }}
            >
                Cards
                <hr />
                <p>
                    Each player has a deck of 25 cards that begins the game face
                    down in a random order. The contents of the two decks are
                    the same. At the beginning of the game, each player draws 6
                    cards.
                </p>
                <p>
                    Cards are played from players’ hands onto the action order
                    track. After a player’s card resolves from the action order
                    track, it is put into that player’s discard pile.*
                </p>
                <p>
                    When a player’s deck is empty, but they need to draw a card,
                    they shuffle their discard pile into their deck.
                </p>
                <p style={{ marginBottom: 0 }}>
                    Each round, each player will play 3 cards. At the end of the
                    round, they will draw 3 cards.
                </p>
                <div
                    style={{
                        fontSize: '10pt',
                        fontStyle: 'italic',
                        marginTop: '12px',
                        textAlign: 'right',
                    }}
                >
                    *Some cards get set aside instead of going to the discard
                    pile.
                </div>
            </TutorialTextBox>
        </div>
    );
};

export const CardsScreenData = {
    createGame: createBasicGameWithCharacters,
    overlay: <CardsScreen />,
};
