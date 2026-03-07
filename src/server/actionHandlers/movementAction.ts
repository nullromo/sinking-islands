import type {
    GameSerialized,
    MovementSet,
    PlayerDesignator,
} from '../../info/commonTypes';
import { computeMovementSteps } from '../../info/computeMovementSteps';
import type { ConvertedMovementSet } from '../../info/convertActionData';
import { convertMovementToIslands } from '../../info/convertActionData';
import { CharacterOperations } from '../gameObjects/characterOperations';
import { GameOperations } from '../gameObjects/gameOperations';
import { IslandOperations } from '../gameObjects/islandOperations';

export const checkMovementSetLegal = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    convertedMovementSet: ConvertedMovementSet,
) => {
    // there must be at least one movement
    if (convertedMovementSet.length < 1) {
        throw new Error('Must include at least 1 movement.');
    }

    // check all movements
    for (const convertedMovement of convertedMovementSet) {
        // the player must move their own character
        if (convertedMovement.character.playerDesignator !== playerDesignator) {
            throw new Error("Cannot move a character that isn't yours.");
        }

        // can't move a character that is not there
        if (
            !IslandOperations.findCharacter(
                convertedMovement.fromIsland,
                convertedMovement.character,
            )
        ) {
            throw new Error("Cannot move a character that isn't there.");
        }

        // can't move to a netted island
        if (
            GameOperations.islandIsNetted(
                game,
                convertedMovement.toIsland.islandNumber,
            )
        ) {
            throw new Error('Cannot move to a netted island.');
        }

        // can't move off a netted island
        if (
            GameOperations.islandIsNetted(
                game,
                convertedMovement.fromIsland.islandNumber,
            )
        ) {
            throw new Error('Cannot move off a netted island.');
        }

        // movements cannot start and end on the same island
        if (
            convertedMovement.fromIsland.islandNumber ===
            convertedMovement.toIsland.islandNumber
        ) {
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
        const numberOfCharactersThatLeft = convertedMovementSet.reduce(
            (total, convertedMovement) => {
                return (
                    total +
                    (convertedMovement.fromIsland.islandNumber ===
                    island.islandNumber
                        ? 1
                        : 0)
                );
            },
            0,
        );

        // find out how many characters were removed from the island
        const numberOfCharactersThatArrived = convertedMovementSet.reduce(
            (total, convertedMovement) => {
                return (
                    total +
                    (convertedMovement.toIsland.islandNumber ===
                    island.islandNumber
                        ? 1
                        : 0)
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
    for (const convertedMovement of convertedMovementSet) {
        // find the number of potential characters on the from island that
        // this movement could refer to
        const numberOfMatchingCharacters =
            convertedMovement.fromIsland.characters.filter((character) => {
                return CharacterOperations.equals(
                    character,
                    convertedMovement.character,
                );
            }).length;

        // find the number of movements in the movement set that refer to
        // this type of character on this from island
        const numberOfMovesUsingThisTypeOfCharacter =
            convertedMovementSet.filter((otherConvertedMovement) => {
                return (
                    CharacterOperations.equals(
                        otherConvertedMovement.character,
                        convertedMovement.character,
                    ) &&
                    otherConvertedMovement.fromIsland.islandNumber ===
                        convertedMovement.fromIsland.islandNumber
                );
            }).length;

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
    const totalMovement = computeMovementSteps(
        game.islands,
        convertedMovementSet,
    );
    if (totalMovement < 1) {
        throw new Error('Not enough movement points spent.');
    }
    if (totalMovement > 3) {
        throw new Error('Too many movement points spent.');
    }
};

export const handleMovement = (
    game: GameSerialized,
    playerDesignator: PlayerDesignator,
    movementSet: MovementSet,
) => {
    const convertedMovementSet: ConvertedMovementSet = movementSet.map(
        (movement) => {
            return convertMovementToIslands(game, movement);
        },
    );
    checkMovementSetLegal(game, playerDesignator, convertedMovementSet);

    // make the moves
    convertedMovementSet.forEach((convertedMovement) => {
        GameOperations.moveCharacter(
            game,
            convertedMovement.character,
            convertedMovement.fromIsland,
            convertedMovement.toIsland,
            'sails',
        );
    });
};
