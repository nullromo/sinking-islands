import type {
    GameSerialized,
    IslandSerialized,
    PlayerDesignator,
} from '../../commonTypes';
import { computeMovementSteps } from '../../computeMovementSteps';
import { CardType } from '../gameObjects/card';
import { CharacterOperations } from '../gameObjects/characterOperations';
import { GameOperations } from '../gameObjects/gameOperations';
import { IslandOperations } from '../gameObjects/islandOperations';
import type { MovementSet } from '../gameObjects/player';
import { PlayerOperations } from '../gameObjects/playerOperations';

const checkMovementSetLegal = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    movementSet: MovementSet,
) => {
    // there must be at least one movement
    if (movementSet.length < 1) {
        throw new Error('Must include at least 1 movement.');
    }

    // check all movements
    for (const movement of movementSet) {
        // the player must move their own character
        if (movement.character.playerDesignator !== playerDesignator) {
            throw new Error("Cannot move a character that isn't yours.");
        }

        const toIsland = GameOperations.findIsland(
            game,
            movement.toIslandNumber,
        );

        // can't move to an island that already sank
        if (!toIsland) {
            throw new Error("Cannot move to an island that doesn't exist.");
        }

        const fromIsland = GameOperations.findIsland(
            game,
            movement.fromIslandNumber,
        );

        // can't move from an island that doesn't exist
        if (!fromIsland) {
            throw new Error("Cannot move from an island that doesn't exist.");
        }

        // can't move a character that is not there
        if (!IslandOperations.findCharacter(fromIsland, movement.character)) {
            throw new Error("Cannot move a character that isn't there.");
        }

        // can't move to a netted island
        if (GameOperations.islandIsNetted(game, movement.toIslandNumber)) {
            throw new Error('Cannot move to a netted island.');
        }

        // can't move off a netted island
        if (GameOperations.islandIsNetted(game, movement.fromIslandNumber)) {
            throw new Error('Cannot move off a netted island.');
        }

        // movements cannot start and end on the same island
        if (movement.fromIslandNumber === movement.toIslandNumber) {
            throw new Error('Cannot move from an island to the same island.');
        }
    }

    // the positioning of the characters after the movement must be legal
    for (const island of game.islands) {
        // if the island is not a small capacity island or if it has
        // pilings, then there won't be a problem
        if (
            !island.smallCapacity ||
            GameOperations.islandHasPilings(game, island.islandNumber)
        ) {
            continue;
        }

        // find out how many characters were added to the island
        const numberOfCharactersThatLeft = movementSet.reduce(
            (total, movement) => {
                return (
                    total +
                    (movement.fromIslandNumber === island.islandNumber ? 1 : 0)
                );
            },
            0,
        );

        // find out how many characters were removed from the island
        const numberOfCharactersThatArrived = movementSet.reduce(
            (total, movement) => {
                return (
                    total +
                    (movement.toIslandNumber === island.islandNumber ? 1 : 0)
                );
            },
            0,
        );

        // determine how many characters will be left on the island
        const numberOfCharactersAfterMovement =
            island.characters.length +
            numberOfCharactersThatArrived -
            numberOfCharactersThatLeft;

        // make sure the number of characters left is legal. We already
        // know it's a small capacity island with no pilings, so the
        // character limit will always be 1 here
        if (numberOfCharactersAfterMovement > 1) {
            throw new Error(
                'Movement results in too many characters on an island.',
            );
        }
    }

    // each movement must be for a different character
    for (const movement of movementSet) {
        const fromIsland = GameOperations.findIsland(
            game,
            movement.fromIslandNumber,
        );

        // can't move from an island that doesn't exist
        if (!fromIsland) {
            throw new Error("Cannot move from an island that doesn't exist.");
        }
        // find the number of potential characters on the from island that
        // this movement could refer to
        const numberOfMatchingCharacters = fromIsland.characters.filter(
            (character) => {
                return CharacterOperations.equals(
                    character,
                    movement.character,
                );
            },
        ).length;

        // find the number of movements in the movement set that refer to
        // this type of character on this from island
        const numberOfMovesUsingThisTypeOfCharacter = movementSet.filter(
            (otherMovement) => {
                return (
                    CharacterOperations.equals(
                        otherMovement.character,
                        movement.character,
                    ) &&
                    otherMovement.fromIslandNumber === movement.fromIslandNumber
                );
            },
        ).length;

        // if there are not enough of the type of character in question on
        // the from island in question, then at least two of the movements
        // in the movement set are trying to refer to the same character
        if (
            numberOfMovesUsingThisTypeOfCharacter > numberOfMatchingCharacters
        ) {
            throw new Error('Two movements tried to move the same character.');
        }
    }

    // the total movement must be at least 1 and no more than 3
    const totalMovement = computeMovementSteps(game.islands, movementSet);
    if (totalMovement < 1 || totalMovement > 3) {
        throw new Error('Too many or not enough movement points spent.');
    }
};

export const handleMovement = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    movementSet: MovementSet,
) => {
    checkMovementSetLegal(game, playerDesignator, movementSet);

    // make the moves
    movementSet.forEach((movement) => {
        console.log(
            `Player ${playerDesignator} moves their ${
                movement.character.strength
            }-strength ${
                movement.character.tortoise ? 'tortoise' : 'character'
            } from island ${movement.fromIslandNumber} to island ${
                movement.toIslandNumber
            }.`,
        );
        IslandOperations.removeCharacter(
            GameOperations.findIsland(
                game,
                movement.fromIslandNumber,
            ) as IslandSerialized,
            movement.character,
        );
        // reset tortoise and reclaim card if necessary
        if (movement.character.tortoise) {
            movement.character.tortoise = false;
            PlayerOperations.reclaim(
                game.players[movement.character.playerDesignator],
                CardType.TORTOISE,
            );
        }
        IslandOperations.addCharacter(
            GameOperations.findIsland(
                game,
                movement.toIslandNumber,
            ) as IslandSerialized,
            movement.character,
        );
    });
};
