import type {
    CardSerialized,
    CardType,
    PlayerDesignator,
} from '../../commonTypes';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CardOperations {
    export const create = (
        playerDesignator: PlayerDesignator,
        cardType: CardType,
    ): CardSerialized => {
        return { cardType, playerDesignator };
    };
}
