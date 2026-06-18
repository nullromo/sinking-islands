import type { GameSerialized } from '../../info/commonTypes';
import { CardType, otherPlayerDesignator } from '../../info/commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';
import { IslandOperations } from '../gameObjects/islandOperations';
import { PlayerOperations } from '../gameObjects/playerOperations';

export const handleCrab = (game: GameSerialized) => {
    const card = GameOperations.getCurrentlyResolvingCard(game);
    const player = card.playerDesignator;
    const opponent = otherPlayerDesignator(player);

    // handle fights on all the islands
    game.islands.forEach((island) => {
        // compute the strength of each player
        const { playerStrength, opponentStrength } = island.characters.reduce(
            (totals, character) => {
                return {
                    opponentStrength:
                        totals.opponentStrength +
                        (character.playerDesignator === player
                            ? 0
                            : game.players[opponent].weakness
                              ? 1
                              : character.strength),
                    playerStrength:
                        totals.playerStrength +
                        (character.playerDesignator === player
                            ? game.players[player].weakness
                                ? 1
                                : character.strength
                            : 0),
                };
            },
            { opponentStrength: 0, playerStrength: 0 },
        );

        // kill necessary characters
        if (playerStrength > opponentStrength && opponentStrength > 0) {
            GameOperations.log(
                game,
                `Player ${opponent}'s characters are crabbed on island ${island.islandNumber}.`,
            );

            // if a tortoise died, reclaim the appropriate card
            if (
                island.characters.some((character) => {
                    return (
                        character.playerDesignator === opponent &&
                        character.tortoise
                    );
                })
            ) {
                PlayerOperations.reclaim(
                    game.players[opponent],
                    CardType.TORTOISE,
                );
            }

            // remove the dead characters
            IslandOperations.removeCharactersOfPlayer(island, opponent);
        }
    });
};
