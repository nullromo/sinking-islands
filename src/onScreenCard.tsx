import { CardType, cardTypeToString, type CardSerialized } from './commonTypes';
import { getCardImage } from './images/cardImages';

interface OnScreenCardProps {
    readonly card: CardSerialized;
    readonly onClick?: () => void;
    readonly highlight: boolean;
}

export const OnScreenCard = (props: OnScreenCardProps) => {
    return (
        <div
            style={{
                alignItems: 'center',
                background: 'lightblue',
                //border: props.highlight ? '3px solid' : '',
                border: '2px solid',
                borderRadius: '4px',
                boxSizing: 'border-box',
                cursor: props.onClick ? 'pointer' : '',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100px',
            }}
            onClick={props.onClick}
        >
            <div
                style={{
                    borderBottom: '2px solid',
                    height: '20px',
                    //marginBottom: '2px',
                    width: '100%',
                }}
            >
                <span>
                    {props.card.cardType === CardType.VOLCANIC_ERUPTION
                        ? 'Volcano'
                        : cardTypeToString(props.card.cardType)}
                </span>
            </div>
            <div
                style={{
                    alignItems: 'center',
                    backgroundImage: getCardImage(props.card.cardType),
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    height: '100px',
                    width: '100%',
                }}
            />
        </div>
    );
};
