import { CardType } from '../commonTypes';
import { assertUnreachable } from '../util';
import crab from './cards/crab.jpg';
import flyingFish from './cards/flying-fish.jpg';
import fog from './cards/fog.jpg';
import harpoon from './cards/harpoon.jpg';
import indiscretion from './cards/indiscretion.jpg';
import meditation from './cards/meditation.png';
import movement from './cards/movement.jpg';
import net from './cards/net.png';
import pilings from './cards/pilings.jpg';
import prayer from './cards/prayer.png';
import tidalSurge from './cards/tidal-surge.jpg';
import tidalWave from './cards/tidal-wave.jpg';
import tortoise from './cards/tortoise.png';
import volcanicEruption from './cards/volcanic-eruption.png';
import weakness from './cards/weakness.png';

export const getCardImage = (cardType: CardType) => {
    const image = (() => {
        switch (cardType) {
            case CardType.CRAB:
                return crab;
            case CardType.FLYING_FISH:
                return flyingFish;
            case CardType.FOG:
                return fog;
            case CardType.HARPOON:
                return harpoon;
            case CardType.INDISCRETION:
                return indiscretion;
            case CardType.MEDITATION:
                return meditation;
            case CardType.MOVEMENT:
                return movement;
            case CardType.NET:
                return net;
            case CardType.PILINGS:
                return pilings;
            case CardType.PRAYER:
                return prayer;
            case CardType.TIDAL_SURGE:
                return tidalSurge;
            case CardType.TIDAL_WAVE:
                return tidalWave;
            case CardType.TORTOISE:
                return tortoise;
            case CardType.VOLCANIC_ERUPTION:
                return volcanicEruption;
            case CardType.WEAKNESS:
                return weakness;
            default:
                return assertUnreachable(cardType);
        }
    })();

    return `url(${image})`;
};
