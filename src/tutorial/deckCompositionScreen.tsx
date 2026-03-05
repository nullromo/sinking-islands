import { getCardText } from '../cardDescription';
import { CardType, PlayerDesignator } from '../commonTypes';
import { MousePositionContextProvider } from '../mousePositionContext';
import { OnScreenCard } from '../onScreenCard';
import { createBasicGameWithCharacters } from './pageData';
import { TutorialDimOverlay, TutorialTextBox } from './styles';

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
            style={{ display: 'flex', flexDirection: 'column', rowGap: '20px' }}
        >
            {props.children}
        </div>
    );
};

const DeckCompositionScreen = () => {
    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                height: '100vh',
                justifyContent: 'center',
                width: '100vw',
            }}
        >
            <TutorialDimOverlay clipPath='' />
            <TutorialTextBox
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '800px',
                    position: 'relative',
                    width: '1200px',
                }}
            >
                {"Each player's deck contains the following cards."}
                <div style={{ color: 'limegreen', paddingTop: '4px' }}>
                    <b>Hover over the cards for descriptions.</b>
                </div>
                <hr style={{ width: '100%' }} />
                <div
                    style={{
                        columnGap: '30px',
                        display: 'flex',
                        justifyContent: 'space-around',
                        width: '100%',
                    }}
                >
                    <CardBoxContainer>
                        <CardBox cardType={CardType.CRAB} count={3} />
                        <CardBox cardType={CardType.FLYING_FISH} count={1} />
                        <CardBox cardType={CardType.FOG} count={2} />
                        <CardBox cardType={CardType.HARPOON} count={2} />
                        <CardBox cardType={CardType.INDISCRETION} count={1} />
                    </CardBoxContainer>
                    <CardBoxContainer>
                        <CardBox cardType={CardType.MEDITATION} count={1} />
                        <CardBox cardType={CardType.MOVEMENT} count={6} />
                        <CardBox cardType={CardType.NET} count={1} />
                        <CardBox cardType={CardType.PILINGS} count={1} />
                        <CardBox cardType={CardType.PRAYER} count={1} />
                    </CardBoxContainer>
                    <CardBoxContainer>
                        <CardBox cardType={CardType.TIDAL_SURGE} count={2} />
                        <CardBox cardType={CardType.TIDAL_WAVE} count={1} />
                        <CardBox cardType={CardType.TORTOISE} count={1} />
                        <CardBox
                            cardType={CardType.VOLCANIC_ERUPTION}
                            count={1}
                        />
                        <CardBox cardType={CardType.WEAKNESS} count={1} />
                    </CardBoxContainer>
                </div>
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
