import type { GameSerialized, PlayerDesignator } from '../../commonTypes';
import { CardType, IslandType, otherPlayerDesignator } from '../../commonTypes';
import { GameOperations } from '../gameObjects/gameOperations';
import { IslandOperations } from '../gameObjects/islandOperations';
import { PlayerOperations } from '../gameObjects/playerOperations';

const checkVolcanicEruptionTargetLegal = (
    game: GameSerialized,
    volcanicEruptionTarget: number,
) => {
    // find the island
    const island = GameOperations.findIsland(game, volcanicEruptionTarget);

    // the island must exist
    if (!island) {
        throw new Error('Cannot erupt an island that does not exist.');
    }

    // the island must be a volcano
    if (island.islandType !== IslandType.VOLCANO) {
        throw new Error('Cannot erupt an island that is not a volcano.');
    }
};

export const handleVolcanicEruption = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    volcanicEruptionTarget: number,
) => {
    checkVolcanicEruptionTargetLegal(game, volcanicEruptionTarget);

    // start to erupt the volcano
    console.log(`Island ${volcanicEruptionTarget} erupts.`);

    // find islands affected by lava flows
    const lavaFlowIslands = GameOperations.getAdjacentIslands(
        game,
        volcanicEruptionTarget,
    );

    // handle fleeing from lava flows
    for (const lavaFlowIsland of lavaFlowIslands) {
        // find the safe island to flee to
        const safeIsland = (() => {
            const safeIslandList = GameOperations.getAdjacentIslands(
                game,
                lavaFlowIsland.islandNumber,
            ).filter((island) => {
                return island.islandNumber !== volcanicEruptionTarget;
            });
            if (safeIslandList.length <= 0) {
                return null;
            }
            if (safeIslandList.length > 1) {
                throw new Error(
                    'There cannot be two safe islands for characters to flee to.',
                );
            }
            return safeIslandList[0];
        })();

        // if there is no safe island, no fleeing can occur
        if (safeIsland === null) {
            continue;
        }

        // if the safe island is full or if the lava flow island is netted,
        // then fleeing is not possible
        if (
            GameOperations.islandIsFull(game, safeIsland) ||
            GameOperations.islandIsNetted(game, lavaFlowIsland.islandNumber)
        ) {
            continue;
        }

        // if the safe island can only accommodate one character, then only
        // one character can flee. Otherwise, everyone flees
        if (
            safeIsland.smallCapacity &&
            !GameOperations.islandHasPilings(game, safeIsland.islandNumber)
        ) {
            // if only one character can flee, then the volcano erupter
            // flees first. If they don't flee, then the other player can
            for (const playerToFlee of [
                playerDesignator,
                otherPlayerDesignator(playerDesignator),
            ]) {
                // Find out how many characters this player has on the island
                const playerCharactersOnLavaFlowIsland =
                    lavaFlowIsland.characters.filter((character) => {
                        return character.playerDesignator === playerToFlee;
                    });

                // if this player has multiple characters on the island,
                // choose the strongest one to flee. If they only have one
                // character there, that character will flee. If they have
                // none, then none of their characters flee
                const characterToFlee =
                    playerCharactersOnLavaFlowIsland.length === 1
                        ? playerCharactersOnLavaFlowIsland[0]
                        : playerCharactersOnLavaFlowIsland.length > 1
                          ? playerCharactersOnLavaFlowIsland.reduce(
                                (largestCharacter, character) => {
                                    if (
                                        character.strength >
                                        largestCharacter.strength
                                    ) {
                                        return character;
                                    }
                                    return largestCharacter;
                                },
                            )
                          : null;

                // if no character flees, skip this player
                if (characterToFlee === null) {
                    continue;
                }

                // move the character
                GameOperations.moveCharacter(
                    game,
                    characterToFlee,
                    lavaFlowIsland,
                    safeIsland,
                    'flees',
                );

                // done fleeing from this island
                break;
            }
        } else {
            // the island is not small or has pilings, so everyone flees

            // move all characters
            lavaFlowIsland.characters.forEach((character) => {
                GameOperations.moveCharacter(
                    game,
                    character,
                    lavaFlowIsland,
                    safeIsland,
                    'flees',
                );
            });
        }
    }

    // now that everyone has fled, burn anyone who didn't flee
    lavaFlowIslands.forEach((lavaFlowIsland) => {
        lavaFlowIsland.characters.forEach((character) => {
            // remove the character
            console.log(
                `Player ${character.playerDesignator}'s ${
                    character.strength
                }-strength ${
                    character.tortoise ? 'tortoise' : 'character'
                } burns to death in the lava flow on island ${lavaFlowIsland.islandNumber}.`,
            );
            IslandOperations.removeCharacter(lavaFlowIsland, character);

            // reset tortoise and reclaim card if necessary
            if (character.tortoise) {
                character.tortoise = false;
                PlayerOperations.reclaim(
                    game.players[character.playerDesignator],
                    CardType.TORTOISE,
                );
            }
        });
    });

    // remove the volcano itself
    console.log(`Island ${volcanicEruptionTarget} erupts and sinks.`);
    game.islands = game.islands.filter((island) => {
        return island.islandNumber !== volcanicEruptionTarget;
    });

    // if there are no islands left, then the game is a draw
    if (game.islands.length < 1) {
        // TODO
        throw new Error('The last remaining island erupted and sank.');
    }

    // if the rising waters marker was on the volcano, move it to
    // the next island
    if (game.nextIslandToSink === volcanicEruptionTarget) {
        console.log('Starting sink loop');
        while (!GameOperations.findIsland(game, game.nextIslandToSink)) {
            game.nextIslandToSink = (game.nextIslandToSink % 16) + 1;
        }
    }
};
