import * as React from 'react';
import { withServerCalls } from '../../../communication/withServerCalls';
import { GameContext } from '../../../contexts/gameContext';
import type {
    CharacterSerialized,
    GameSerialized,
    IslandSerialized,
    PlayerDesignator,
    TargetCharacter,
} from '../../../info/commonTypes';
import { CardType } from '../../../info/commonTypes';
import { convertTargetCharacterToIslands } from '../../../info/convertActionData';
import { GameActionType } from '../../../info/gameActionTypes';
import { GameState } from '../../../info/gameState';
import { checkHarpoonTargetLegal } from '../../../server/actionHandlers/harpoonAction';
import { checkTortoiseTargetLegal } from '../../../server/actionHandlers/tortoiseAction';
import { CharacterOperations } from '../../../server/gameObjects/characterOperations';
import { buildCharacterElementID } from '../../../tutorial/elementIDs';
import { SelectionArrow } from '../arrows/selectionArrow';
import type { LayoutProps } from './gameLayoutContainers';
import { GamePageLayout } from './gameLayoutContainers';

export const CharacterTargetLayout = withServerCalls((props: LayoutProps) => {
    const gameContext = React.use(GameContext);

    const enemy = gameContext.game.gameState === GameState.AWAIT_HARPOON_TARGET;
    const title =
        gameContext.game.gameState === GameState.AWAIT_HARPOON_TARGET
            ? 'Choose Harpoon target.'
            : 'Choose Tortoise target.';

    const [characterChoice, setCharacterChoice] = React.useState<{
        character: CharacterSerialized;
        islandNumber: number;
        playerIndex: number;
    } | null>(null);

    const [action, checkerBase, cardType]: [
        GameActionType.HARPOON_TARGET | GameActionType.TORTOISE_TARGET,
        (
            game: GameSerialized,
            playerDesignator: PlayerDesignator,
            target: {
                targetIsland: IslandSerialized;
                character: CharacterSerialized;
            },
        ) => void,
        CardType,
    ] =
        gameContext.game.gameState === GameState.AWAIT_HARPOON_TARGET
            ? [
                  GameActionType.HARPOON_TARGET,
                  checkHarpoonTargetLegal,
                  CardType.HARPOON,
              ]
            : [
                  GameActionType.TORTOISE_TARGET,
                  (
                      __: GameSerialized,
                      playerDesignator: PlayerDesignator,
                      target: {
                          targetIsland: IslandSerialized;
                          character: CharacterSerialized;
                      },
                  ) => {
                      checkTortoiseTargetLegal(playerDesignator, target);
                  },
                  CardType.TORTOISE,
              ];
    const checker = (targetCharacter: TargetCharacter) => {
        try {
            checkerBase(
                gameContext.game,
                gameContext.you,
                convertTargetCharacterToIslands(
                    gameContext.game,
                    targetCharacter,
                ),
            );
            return true;
        } catch {
            return false;
        }
    };

    const selectionIsLegal =
        characterChoice === null ? false : checker(characterChoice);

    return (
        <GamePageLayout
            boardProps={{
                highlightCharacter: (islandNumber, character, playerIndex) => {
                    if (characterChoice === null) {
                        return checker({ character, islandNumber });
                    }
                    return (
                        islandNumber === characterChoice.islandNumber &&
                        CharacterOperations.equals(
                            character,
                            characterChoice.character,
                        ) &&
                        playerIndex === characterChoice.playerIndex
                    );
                },
                onCharacterClicked: (island, character, playerIndex) => {
                    if (
                        (enemy &&
                            character.playerDesignator !== gameContext.you) ||
                        (!enemy &&
                            character.playerDesignator === gameContext.you)
                    ) {
                        setCharacterChoice({
                            character,
                            islandNumber: island.islandNumber,
                            playerIndex,
                        });
                    }
                },
            }}
        >
            <div
                style={{ width: '600px' }}
            >{`${title} Click on a character on the board to select that character.`}</div>
            <p>
                {characterChoice === null
                    ? 'Selected: none'
                    : `Selected: ${characterChoice.character.strength}-strength ${characterChoice.character.tortoise ? 'tortoise' : 'character'} on island ${characterChoice.islandNumber}`}
            </p>
            <div style={{ color: selectionIsLegal ? 'green' : 'red' }}>
                {'Selection is'} {selectionIsLegal ? '' : 'not'} {'legal'}
            </div>
            <div>
                <button
                    type='button'
                    onClick={() => {
                        setCharacterChoice(null);
                    }}
                >
                    Start Over
                </button>
                <button
                    type='button'
                    onClick={() => {
                        if (characterChoice === null) {
                            return;
                        }
                        props.serverCalls
                            .takeGameAction(gameContext.game.id, {
                                action,
                                data: {
                                    character: characterChoice.character,
                                    islandNumber: characterChoice.islandNumber,
                                },
                            })
                            .catch((error: unknown) => {
                                props.setResult(false, error);
                            })
                            .finally(() => {
                                setCharacterChoice(null);
                            });
                    }}
                >
                    Submit
                </button>
            </div>
            <SelectionArrow
                cardType={cardType}
                color={
                    characterChoice === null
                        ? 'magenta'
                        : selectionIsLegal
                          ? 'limegreen'
                          : 'orange'
                }
                targetElementID={
                    characterChoice === null
                        ? null
                        : buildCharacterElementID(
                              characterChoice.islandNumber,
                              characterChoice.character.playerDesignator,
                              characterChoice.playerIndex,
                          )
                }
            />
        </GamePageLayout>
    );
}, 'CharacterTargetLayout');
