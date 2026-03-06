import type { IslandSerialized } from '../../info/commonTypes';
import { IslandType } from '../../info/commonTypes';
import { getIslandColors } from '../../info/islandColors';
import type { IslandProps } from '../../pages/game/board/island';
import { Island } from '../../pages/game/board/island';
import { Emoji } from '../../util/emoji';
import { buildCutout } from '../buildCutout';
import { island3ElementID } from '../elementIDs';
import { createBasicGame } from '../pageData';
import { TutorialDimOverlay, TutorialTextBox } from '../styles';
import { useBoundingBox } from '../useBoundingBox';

const dummyIslandProps: IslandProps = {
    highlight: false,
    highlightCharacter: undefined,
    hoverHighlight: false,
    hoveredCharacter: null,
    island: {
        characters: [],
        islandNumber: 3,
        islandType: IslandType.NORMAL,
        smallCapacity: false,
    },
    onCharacterClicked: undefined,
    onClick: undefined,
    setHoveredCharacter: () => {
        //
    },
    setIslandHover: () => {
        //
    },
    width: 200,
};

const IslandTypeBox = (props: {
    readonly island: IslandSerialized;
    readonly description: string;
}) => {
    return (
        <div
            style={{ alignItems: 'center', columnGap: '6px', display: 'flex' }}
        >
            <div style={{ height: '200px', width: '200px' }}>
                <Island {...dummyIslandProps} island={props.island} />
            </div>
            <div style={{ padding: '8px 8px 8px 12px', width: '300px' }}>
                <b>
                    <span
                        style={{
                            color: getIslandColors({
                                islandType: props.island.islandType,
                            }).island,
                        }}
                    >
                        {props.island.islandType === IslandType.VOLCANO
                            ? 'Volcanic'
                            : props.island.islandType}
                    </span>{' '}
                    Island
                </b>
                <hr />
                {props.description}
            </div>
        </div>
    );
};

const IslandsScreen = () => {
    const islandBox = useBoundingBox(island3ElementID);
    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <TutorialDimOverlay clipPath={buildCutout(islandBox, 20)} />
            <TutorialTextBox
                style={{
                    height: '380px',
                    left: islandBox.left + islandBox.width,
                    position: 'absolute',
                    top: islandBox.top + islandBox.height,
                    width: '540px',
                }}
            >
                Parts of an Island
                <hr />
                <div
                    style={{
                        height: '200px',
                        left: 20,
                        position: 'relative',
                        top: 20,
                        width: '200px',
                    }}
                >
                    <Island {...dummyIslandProps} />
                    <div
                        style={{
                            border: '4px solid yellow',
                            height: '48px',
                            left: -19,
                            position: 'absolute',
                            top: -20,
                            width: '48px',
                        }}
                    />
                    <div
                        style={{
                            border: '2px solid yellow',
                            height: 0,
                            left: 34,
                            position: 'absolute',
                            top: 12,
                            width: '190px',
                        }}
                    />
                    <div
                        style={{
                            left: 240,
                            position: 'absolute',
                            top: 0,
                            width: '240px',
                        }}
                    >
                        <b style={{ textDecoration: 'underline' }}>
                            Island number
                        </b>
                        <br />
                        Represents the order in which the islands will sink.
                    </div>
                    <div
                        style={{
                            border: '4px solid yellow',
                            height: '48px',
                            left: 162,
                            position: 'absolute',
                            top: 161,
                            width: '48px',
                        }}
                    />
                    <div
                        style={{
                            border: '2px solid yellow',
                            height: 0,
                            left: 218,
                            position: 'absolute',
                            top: 189,
                            width: '10px',
                        }}
                    />
                    <div
                        style={{
                            left: 240,
                            position: 'absolute',
                            top: 176,
                            width: '280px',
                        }}
                    >
                        <b style={{ textDecoration: 'underline' }}>
                            Island size
                        </b>
                        <br />
                        <span
                            style={{
                                background: 'deepskyblue',
                                color: 'transparent',
                                textShadow: '0 0 0 black',
                            }}
                        >
                            {Emoji.together}
                        </span>{' '}
                        = The island can support any number of characters.
                        <br />
                        <span
                            style={{
                                background: 'deepskyblue',
                                color: 'transparent',
                                textShadow: '0 0 0 black',
                            }}
                        >
                            {Emoji.alone}
                        </span>{' '}
                        = The island is only large enough for 1 character at a
                        time.
                    </div>
                </div>
            </TutorialTextBox>
            <TutorialTextBox
                style={{
                    height: 'fit-content',
                    left: islandBox.left + islandBox.width + 580,
                    padding: '20px 20px 24px 20px',
                    position: 'absolute',
                    top: islandBox.top + islandBox.height - 120,
                    width: '540px',
                }}
            >
                Island Types
                <hr />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: '20px',
                    }}
                >
                    <IslandTypeBox
                        description='A normal island that can have limited or unlimited capacity.'
                        island={{
                            characters: [],
                            islandNumber: 2,
                            islandType: IslandType.NORMAL,
                            smallCapacity: false,
                        }}
                    />
                    <IslandTypeBox
                        description='An island with a temple at which your characters can pray.'
                        island={{
                            characters: [],
                            islandNumber: 14,
                            islandType: IslandType.SACRED,
                            smallCapacity: false,
                        }}
                    />
                    <IslandTypeBox
                        description='An unstable island that could erupt (and sink).'
                        island={{
                            characters: [],
                            islandNumber: 9,
                            islandType: IslandType.VOLCANO,
                            smallCapacity: false,
                        }}
                    />
                </div>
            </TutorialTextBox>
        </div>
    );
};

export const IslandsScreenData = {
    createGame: createBasicGame,
    overlay: <IslandsScreen />,
};
