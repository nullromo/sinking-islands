import type { GameSerialized } from '../../commonTypes';
import { ActionOrderTrackOperations } from '../gameObjects/actionOrderTrackOperations';
import { PlayerOperations } from '../gameObjects/playerOperations';

const checkFogTargetLegal = (game: GameSerialized, fogTarget: number) => {
    // if there is no card, that card cannot be fogged
    if (game.actionOrderTrack.cardSlots[fogTarget] === null) {
        throw new Error('Cannot fog a card that does not exist');
    }

    // a fog cannot fog itself
    if (game.activeCardIndex === fogTarget) {
        throw new Error('A fog cannot fog itself');
    }
};

export const handleFog = (game: GameSerialized, fogTarget: number) => {
    checkFogTargetLegal(game, fogTarget);

    // fog the target
    console.log(`Fogging slot ${fogTarget + 1}.`);
    const foggedCard = ActionOrderTrackOperations.resetSlot(
        game.actionOrderTrack,
        fogTarget,
    );
    if (foggedCard) {
        PlayerOperations.discardCard(
            game.players[foggedCard.playerDesignator],
            foggedCard,
        );
    }
};
