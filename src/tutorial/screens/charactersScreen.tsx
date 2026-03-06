import { PlayerDesignator } from '../../info/commonTypes';
import type { CharacterProps } from '../../pages/game/board/character';
import { Character } from '../../pages/game/board/character';
import { createBasicGame } from '../pageData';
import { TutorialDimOverlay, TutorialTextBox } from '../styles';

const baseCharacterProps: CharacterProps = {
    character: {
        playerDesignator: PlayerDesignator.PLAYER_A,
        strength: 2,
        tortoise: false,
    },
    highlight: false,
    hoverHighlight: false,
    onClick: undefined,
    setCharacterHover: () => {
        //
    },
    shift: 0,
    width: 80,
};

const CharacterItem = (props: {
    readonly strength: number;
    readonly playerDesignator: PlayerDesignator;
}) => {
    return (
        <div style={{ height: '80px', position: 'relative', width: '80px' }}>
            <Character
                {...baseCharacterProps}
                character={{
                    ...baseCharacterProps.character,
                    playerDesignator: props.playerDesignator,
                    strength: props.strength,
                }}
            />
            {[
                ...new Array(
                    props.strength === 4 ? 0 : props.strength === 3 ? 2 : 3,
                ).keys(),
            ].map((key) => {
                return (
                    <Character
                        key={key}
                        {...baseCharacterProps}
                        character={{
                            ...baseCharacterProps.character,
                            playerDesignator: props.playerDesignator,
                            strength: props.strength,
                        }}
                        shift={50 * (key + 1)}
                    />
                );
            })}
        </div>
    );
};

const CharacterBox = (props: {
    readonly playerDesignator: PlayerDesignator;
}) => {
    return (
        <div
            style={{
                display: 'flex',
                height: '80px',
                justifyContent: 'space-between',
                padding: '0 16px',
                width: '90%',
            }}
        >
            <CharacterItem
                playerDesignator={props.playerDesignator}
                strength={2}
            />
            <CharacterItem
                playerDesignator={props.playerDesignator}
                strength={3}
            />
            <CharacterItem
                playerDesignator={props.playerDesignator}
                strength={4}
            />
        </div>
    );
};

const CharactersScreen = () => {
    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                height: '100vh',
                justifyContent: 'center',
                width: '100vw',
            }}
        >
            <TutorialDimOverlay clipPath='' />
            <TutorialTextBox
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '400px',
                    justifyContent: 'space-between',
                    position: 'relative',
                    width: '700px',
                }}
            >
                <CharacterBox playerDesignator={PlayerDesignator.PLAYER_A} />
                <div
                    style={{
                        alignItems: 'center',
                        columnGap: '10px',
                        display: 'flex',
                        paddingTop: '20px',
                        width: '90%',
                    }}
                >
                    <hr style={{ flexGrow: 1, height: 0 }} />
                    <div style={{ margin: 'auto' }}>Your characters</div>
                    <hr style={{ flexGrow: 1, height: 0 }} />
                </div>
                <div style={{ margin: 'auto', padding: '0 40px' }}>
                    Each player has 8 characters ranging in strength from 2 to
                    4. The characters begin the game spread out randomly across
                    the islands, with one character on each island. The game
                    ends when all of one player’s characters have been
                    eliminated.
                </div>
                <div
                    style={{
                        alignItems: 'center',
                        columnGap: '10px',
                        display: 'flex',
                        margin: '0 40px ',
                        paddingBottom: '20px',
                        width: '90%',
                    }}
                >
                    <hr style={{ flexGrow: 1, height: 0 }} />
                    <div style={{ margin: 'auto' }}>Enemy characters</div>
                    <hr style={{ flexGrow: 1, height: 0 }} />
                </div>
                <CharacterBox playerDesignator={PlayerDesignator.PLAYER_B} />
            </TutorialTextBox>
        </div>
    );
};

export const CharactersScreenData = {
    createGame: createBasicGame,
    overlay: <CharactersScreen />,
};
