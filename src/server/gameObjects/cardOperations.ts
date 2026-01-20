import type { CardSerialized, PlayerDesignator } from '../../commonTypes';
import type { CardType } from './card';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CardOperations {
    export const create = (
        playerDesignator: PlayerDesignator,
        cardType: CardType,
    ): CardSerialized => {
        return {
            cardType,
            playerDesignator,
        };
    };
}
