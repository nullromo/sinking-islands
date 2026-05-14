import { MousePositionContextProvider } from '../../contexts/mousePositionContext';
import { getCardText } from '../../info/cardDescription';
import { CardType, PlayerDesignator } from '../../info/commonTypes';
import { OnScreenCard } from '../../pages/game/onScreenCard';
import { createBasicGameWithCharacters } from '../pageData';
import { TutorialDimOverlay, TutorialTextBox } from '../styles';

const CardBox = (props: {
    readonly cardType: CardType;
    readonly count: number;
}) => {
    return (
        <div
            style={{ alignItems: 'center', columnGap: '20px', display: 'flex' }}
        >
            <div
                style={{
                    alignItems: 'center',
                    columnGap: '6px',
                    display: 'flex',
                }}
            >
                <span style={{ whiteSpace: 'nowrap' }}>{props.count} x</span>
                <div
                    style={{
                        color: 'black',
                        fontSize: '12pt',
                        textAlign: 'center',
                    }}
                >
                    <OnScreenCard
                        card={{
                            cardType: props.cardType,
                            playerDesignator: PlayerDesignator.PLAYER_A,
                        }}
                        highlight={false}
                        onClick={undefined}
                    />
                </div>
            </div>
            {getCardText(props.cardType)[0]}
        </div>
    );
};

const CardBoxContainer = (props: React.PropsWithChildren) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                rowGap: '20px',
            }}
        >
            {props.children}
        </div>
    );
};

const GroupBox = (
    props: {
        readonly label: React.ReactNode;
        readonly color: string;
    } & React.PropsWithChildren,
) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <div
                style={{
                    background: '#222222',
                    borderRadius: '20px',
                    boxSizing: 'content-box',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '6px',
                    outline: `4px solid ${props.color}`,
                    padding: '10px',
                    rowGap: '10px',
                }}
            >
                {props.children}
            </div>
            <span style={{ color: props.color }}>{props.label}</span>
        </div>
    );
};

export const AllCardsDisplay = () => {
    return (
        <div
            style={{
                columnGap: '30px',
                display: 'flex',
                justifyContent: 'space-around',
                width: '100%',
            }}
        >
            <CardBoxContainer>
                <GroupBox color='limegreen' label='Move your characters'>
                    <CardBox cardType={CardType.MOVEMENT} count={6} />
                    <CardBox cardType={CardType.FLYING_FISH} count={1} />
                </GroupBox>
                <GroupBox
                    color='cyan'
                    label={
                        <div
                            style={{
                                alignItems: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            Modify characters or islands.
                            <div
                                style={{
                                    fontSize: '12pt',
                                    fontStyle: 'italic',
                                    fontWeight: 'bold',
                                    paddingTop: '4px',
                                    width: '75%',
                                }}
                            >
                                These cards are set aside after use and are put
                                into the discard pile later
                            </div>
                        </div>
                    }
                >
                    <CardBox cardType={CardType.NET} count={1} />
                    <CardBox cardType={CardType.PILINGS} count={1} />
                    <CardBox cardType={CardType.TORTOISE} count={1} />
                </GroupBox>
            </CardBoxContainer>
            <CardBoxContainer>
                <GroupBox color='red' label='Attack enemy characters'>
                    <CardBox cardType={CardType.CRAB} count={3} />
                    <CardBox cardType={CardType.WEAKNESS} count={1} />
                    <CardBox cardType={CardType.HARPOON} count={2} />
                </GroupBox>
                <GroupBox color='limegreen' label='Improve your hand or deck'>
                    <CardBox cardType={CardType.PRAYER} count={1} />
                    <CardBox cardType={CardType.MEDITATION} count={1} />
                </GroupBox>
            </CardBoxContainer>
            <CardBoxContainer>
                <GroupBox color='limegreen' label='Move the Rising Waters'>
                    <CardBox cardType={CardType.TIDAL_SURGE} count={2} />
                    <CardBox cardType={CardType.TIDAL_WAVE} count={1} />
                </GroupBox>
                <GroupBox color='orange' label="Disrupt your opponent's plans">
                    <CardBox cardType={CardType.INDISCRETION} count={1} />
                    <CardBox cardType={CardType.FOG} count={2} />
                </GroupBox>
                <GroupBox color='red' label='Destroy an island'>
                    <CardBox cardType={CardType.VOLCANIC_ERUPTION} count={1} />
                </GroupBox>
            </CardBoxContainer>
        </div>
    );
};

const DeckCompositionScreen = () => {
    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                justifyContent: 'center',
                width: '100vw',
            }}
        >
            <TutorialDimOverlay clipPath='' />
            <TutorialTextBox
                style={{
                    borderRadius: '16px 0px 0px 16px',
                    height: 'fit-content',
                    marginTop: '100px',
                    paddingRight: '10px',
                    position: 'relative',
                }}
            >
                <div>{"Each player's deck contains the following cards."}</div>
                <hr />
                <div
                    style={{
                        color: 'limegreen',
                        padding: '4px 0',
                        textAlign: 'center',
                    }}
                >
                    <b>Hover over the cards for descriptions.</b>
                </div>
            </TutorialTextBox>
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
                <AllCardsDisplay />
                <hr style={{ width: '100%' }} />
                <em style={{ fontSize: '14pt' }}>
                    You can view this information at any time during a game.
                </em>
            </TutorialTextBox>
        </div>
    );
};

export const DeckCompositionScreenData = {
    createGame: createBasicGameWithCharacters,
    overlay: (
        <MousePositionContextProvider>
            <DeckCompositionScreen />
        </MousePositionContextProvider>
    ),
};
