import type { CharacterSerialized, PlayerDesignator } from '../commonTypes';
import blue20 from './characters/blue20.jpg';
import blue30 from './characters/blue30.jpg';
import blue40 from './characters/blue40.jpg';
import red20 from './characters/red20.jpg';
import red30 from './characters/red30.jpg';
import red40 from './characters/red40.jpg';

export const getCharacterImage = (
    you: PlayerDesignator,
    character: CharacterSerialized,
) => {
    const image = (() => {
        if (character.playerDesignator === you) {
            switch (character.strength) {
                case 20:
                    return blue20;
                case 30:
                    return blue30;
                case 40:
                    return blue40;
                default:
                    throw new Error('Invalid strength value');
            }
        }
        switch (character.strength) {
            case 20:
                return red20;
            case 30:
                return red30;
            case 40:
                return red40;
            default:
                throw new Error('Invalid strength value');
        }
    })();
    return `url(${image})`;
};
