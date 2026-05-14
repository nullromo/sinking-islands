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
                <p>
                    The card tooltips explain the cards, but the information
                    below answers some frequently asked questions.
                </p>
                <ul>
                    <li>
                        <b>Movement</b>: At least one character must move at
                        least one space. Characters may sail past islands that
                        they would not be able to stop on due to capacity
                        restrictions. Moving a tortoise returns the character to
                        human form and returns the set aside Tortoise card to
                        your discard pile. You cannot move onto a netted island.
                    </li>
                    <li>
                        <b>Flying Fish</b>: This card ignores nets, allowing a
                        character to enter or leave a netted island.
                    </li>
                    <li>
                        <b>Net</b>: The net is only removed and the card
                        returned to its {"owner's"} discard pile when the netted
                        island sinks. Characters fleeing from lava flows cannot
                        escape a netted island, nor can they flee to it. The
                        only escape from a netted island is death or Flying
                        Fish.
                    </li>
                    <li>
                        <b>Pilings</b>: The Pilings card returns to its{' '}
                        {"owner's"} discard pile when the target island sinks.
                    </li>
                    <li>
                        <b>Tortoise</b>: The tortoise cannot be targeted by
                        harpoons. Crab effects still work normally. The tortoise
                        ceases to be a tortoise when it moves for any reason
                        (Movement, Flying Fish, or lava flow). The Tortoise card
                        is returned to its {"owner's"} discard pile when the
                        tortoise moves or dies.
                    </li>
                    <li>
                        <b>Crab</b>: Only your characters turn into crabs. You
                        cannot lose your own characters to an ill-timed Crab
                        play.
                    </li>
                    <li>
                        <b>Weakness</b>: Characters that already died this round
                        due to a Crab card remain dead.
                    </li>
                    <li>
                        <b>Harpoon</b>: You cannot harpoon a character from the
                        same island. Harpoons can go through nets.
                    </li>
                    <li>
                        <b>Prayer</b>: Your hand size will permanently increase,
                        since you always play 3 cards each round and you always
                        draw 3 cards each round.
                    </li>
                    <li>
                        <b>Meditation</b>: The Meditation card is not shuffled
                        into the deck.
                    </li>
                    <li>
                        <b>Indiscretion</b>: Playing this while your opponent
                        has the initiative will be less effective, since you
                        will place your cards first in the next round.
                    </li>
                    <li>
                        <b>Fog</b>: If this is the last card played, it has no
                        effect.
                    </li>
                    <li>
                        <b>Volcanic Eruption</b>: If the erupting volcano had
                        the Rising Waters on it, the Rising Waters immediately
                        move to the next island in number order as if the
                        volcano sank normally. Only the two adjacent islands are
                        affected by lava flows. Any characters on these adjacent
                        islands are automatically pushed to the next adjacent
                        island. If that island is also affected by lava flows
                        (because there are only a few islands left), then
                        fleeing is impossible. If there is only one available
                        slot for a group of fleeing characters to go, the player
                        who played the Volcanic Eruption gets to choose which of
                        their characters takes the slot; the rest of the fleeing
                        characters are killed.
                    </li>
                </ul>
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
