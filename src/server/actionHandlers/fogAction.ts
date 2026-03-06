import type { GameSerialized } from '../../info/commonTypes';
import { ActionOrderTrackOperations } from '../gameObjects/actionOrderTrackOperations';
import { GameOperations } from '../gameObjects/gameOperations';
import { PlayerOperations } from '../gameObjects/playerOperations';

const checkFogTargetLegal = (game: GameSerialized, fogTarget: number) => {
    if (fogTarget < 0 || fogTarget > 5) {
        throw new Error('Must choose a valid fog target.');
    }
    // if there is no card, that card cannot be fogged
    if (!game.actionOrderTrack.cardSlots[fogTarget]) {
        throw new Error('Cannot fog an empty card slot.');
    }

    // a fog cannot fog itself
    if (game.activeCardIndex === fogTarget) {
        throw new Error('A fog cannot fog itself.');
    }
};

export const handleFog = (game: GameSerialized, fogTarget: number) => {
    checkFogTargetLegal(game, fogTarget);

    // fog the target
    GameOperations.log(game, `Fogging slot ${fogTarget + 1}.`);
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
