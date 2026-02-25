import { CardType } from './commonTypes';
import { assertUnreachable } from './util';

const getText = (cardType: CardType | null) => {
    switch (cardType) {
        case CardType.CRAB:
            return [
                'Transform your soldiers into crabs to crush weaker foes!',
                'Kills all enemy characters on islands where you have the highest total strength.',
            ];
        case CardType.FLYING_FISH:
            return [
                'Transform a character into a fish to travel long distances!',
                'Moves one of your characters to any island. The destination island must be able to support the character.',
            ];
        case CardType.FOG:
            return [
                "Cast a dense fog over your opponent's plans!",
                "Discards one of your opponent's unresolved cards from the action order track.",
            ];
        case CardType.HARPOON:
            return [
                'Impale an opposing character with a deadly harpoon!',
                'Kills an enemy character that is one island away from one of your characters. Tortoises are immune to harpoons.',
            ];
        case CardType.INDISCRETION:
            return [
                'Spy on your opponent to steal their battle plans!',
                "Causes your opponent's cards to be played face-up during the next turn.",
            ];
        case CardType.MEDITATION:
            return [
                'Focus your mind and center yourself!',
                'Shuffles your discard pile back into your deck.',
            ];
        case CardType.MOVEMENT:
            return [
                'Sail across the treacherous seas!',
                'Moves up to three of your characters a total distance of up to three. Destination islands must be able to support arriving characters. At least one movement must be made.',
            ];
        case CardType.NET:
            return [
                'Cast a constricting net over an entire island!',
                'Shuts off movement to and from one island. Flying fish can bypass nets.',
            ];
        case CardType.PILINGS:
            return [
                'Construct support to expand the battleground!',
                "Expands one island's capacity from small to large.",
            ];
        case CardType.PRAYER:
            return [
                'Seek favor from the gods!',
                'Draws one card for each of your characters that is on a sacred island.',
            ];
        case CardType.TIDAL_SURGE:
            return [
                'Shift the deadly sea!',
                'Moves the rising water marker one island clockwise or one island anti-clockwise.',
            ];
        case CardType.TIDAL_WAVE:
            return [
                'Control the deadly sea!',
                'Moves the rising water marker to any island.',
            ];
        case CardType.TORTOISE:
            return [
                'Transform a character into a tortoise for protection!',
                'Turns one of your characters into a tortoise for as long as it remains on its current island. Tortoises are immune to harpoons.',
            ];
        case CardType.VOLCANIC_ERUPTION:
            return [
                'Shake the foundations of the archipelago!',
                'Destroys one volcanic island and all characters on it. Kills all characters on adjacent islands that are unable to flee.',
            ];
        case CardType.WEAKNESS:
            return [
                'Weaken your enemies!',
                "Sets all enemy characters' strength values to 1 for the rest of the round.",
            ];
        case null:
            return ['Face-down card!', "You don't know what this card is."];
        default:
            return assertUnreachable(cardType);
    }
};

export const getCardDescription = (cardType: CardType | null) => {
    const [flavor, rules] = getText(cardType);

    return (
        <div>
            <hr style={{ borderColor: 'transparent', margin: '3px' }} />
            <div>
                <em>{flavor}</em>
            </div>
            <hr style={{ borderColor: 'black', width: '75%' }} />
            <div style={{ padding: '0 4px 0 4px' }}>{rules}</div>
            <hr style={{ borderColor: 'transparent', margin: '4px' }} />
        </div>
    );
};
