import * as React from 'react';
import { useNavigate } from 'react-router';
import type { IslandProps } from '../board/island';
import { Island } from '../board/island';
import { CircularContainer } from '../circularContainer';
import { IslandType } from '../commonTypes';
import { getIslandImage } from '../images/islandImages';
import { getIslandColors } from '../islandColors';
import type { NumberMap } from '../maps';
import { PageRoutes } from '../pageRoutes';
import { GameOperations } from '../server/gameObjects/gameOperations';

const TutorialPage = (
    props: { readonly title: string } & React.PropsWithChildren,
) => {
    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                fontSize: '16pt',
                height: '100%',
                justifyContent: 'space-around',
            }}
        >
            <h1 style={{ margin: 0 }}>{props.title}</h1>
            {props.children}
        </div>
    );
};

const dummyIslandProps: IslandProps = {
    highlight: false,
    highlightCharacter: undefined,
    hoverHighlight: false,
    hoveredCharacter: null,
    island: {
        characters: [],
        islandNumber: 1,
        islandType: IslandType.NORMAL,
        smallCapacity: true,
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

/* eslint-disable react/jsx-key */
/* eslint-disable @eslint-react/no-missing-key */
const pages: NumberMap<React.JSX.Element> & { length: number } = [
    <TutorialPage title='The Archipelago'>
        <div
            style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
            }}
        >
            <div
                style={{ alignItems: 'center', display: 'flex', width: '80%' }}
            >
                <CircularContainer
                    items={GameOperations.create().islands}
                    renderItem={(island, itemWidth) => {
                        return (
                            <div
                                key={island.islandNumber}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <div
                                    style={{
                                        alignItems: 'flex-end',
                                        backgroundImage: getIslandImage(
                                            island.islandNumber,
                                        ),
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                        border: `${(itemWidth * 3) / 140}px solid ${getIslandColors(island).island}`,
                                        display: 'flex',
                                        fontSize: '18px',
                                        height: '100%',
                                        position: 'relative',
                                        width: '100%',
                                    }}
                                />
                            </div>
                        );
                    }}
                />
                <div style={{ padding: '0 80px' }}>
                    <div
                        style={{
                            background: '#444444',
                            borderRadius: '16px',
                            color: 'white',
                            padding: '8px 8px 8px 20px',
                        }}
                    >
                        {
                            'Welcome to the Archipelago. This ring of 16 islands is all the ground your people have to stand on. The islands begin the game in a random order.'
                        }
                    </div>
                </div>
            </div>
        </div>
    </TutorialPage>,
    <TutorialPage title='Islands'>
        <div
            style={{ display: 'flex', flexDirection: 'column', rowGap: '20px' }}
        >
            <div
                style={{
                    alignItems: 'center',
                    columnGap: '6px',
                    display: 'flex',
                }}
            >
                <div style={{ height: '200px', width: '200px' }}>
                    <Island {...dummyIslandProps} />
                </div>
                <div
                    style={{
                        background: '#444444',
                        borderRadius: '0 16px 16px 0',
                        color: 'white',
                        padding: '8px 8px 8px 12px',
                        width: '300px',
                    }}
                >
                    <b>
                        <span
                            style={{
                                color: getIslandColors({
                                    islandType: IslandType.NORMAL,
                                }).island,
                            }}
                        >
                            Normal
                        </span>{' '}
                        Island
                    </b>
                    <hr />A normal island that can have limited or unlimited
                    capacity.
                </div>
            </div>
            <div
                style={{
                    alignItems: 'center',
                    columnGap: '6px',
                    display: 'flex',
                }}
            >
                <div style={{ height: '200px', width: '200px' }}>
                    <Island
                        {...dummyIslandProps}
                        island={{
                            characters: [],
                            islandNumber: 11,
                            islandType: IslandType.SACRED,
                            smallCapacity: false,
                        }}
                    />
                </div>
                <div
                    style={{
                        background: '#444444',
                        borderRadius: '0 16px 16px 0',
                        color: 'white',
                        padding: '8px 8px 8px 12px',
                        width: '300px',
                    }}
                >
                    <b>
                        <span
                            style={{
                                color: getIslandColors({
                                    islandType: IslandType.SACRED,
                                }).island,
                            }}
                        >
                            Sacred
                        </span>{' '}
                        Island
                    </b>
                    <hr />
                    An island with a temple at which your characters can pray.
                </div>
            </div>
            <div
                style={{
                    alignItems: 'center',
                    columnGap: '6px',
                    display: 'flex',
                }}
            >
                <div style={{ height: '200px', width: '200px' }}>
                    <Island
                        {...dummyIslandProps}
                        island={{
                            characters: [],
                            islandNumber: 9,
                            islandType: IslandType.VOLCANO,
                            smallCapacity: false,
                        }}
                    />
                </div>
                <div
                    style={{
                        background: '#444444',
                        borderRadius: '0 16px 16px 0',
                        color: 'white',
                        padding: '8px 8px 8px 12px',
                        width: '300px',
                    }}
                >
                    <b>
                        <span
                            style={{
                                color: getIslandColors({
                                    islandType: IslandType.VOLCANO,
                                }).island,
                            }}
                        >
                            Volcanic
                        </span>{' '}
                        Island
                    </b>
                    <hr />
                    An unstable island that could erupt (and sink).
                </div>
            </div>
        </div>
    </TutorialPage>,
    <TutorialPage title='Characters'>TODO</TutorialPage>,
    <TutorialPage title='Rising Waters'>TODO</TutorialPage>,
    <TutorialPage title='Archipelago Overview'>TODO</TutorialPage>,
    <TutorialPage title='Round Structure'>TODO</TutorialPage>,
    <TutorialPage title='Action Order Track'>TODO</TutorialPage>,
    <TutorialPage title='Cards'>TODO</TutorialPage>,
    <TutorialPage title='Deck Composition'>TODO</TutorialPage>,
    <TutorialPage title='Card Details'>TODO</TutorialPage>,
    <TutorialPage title='Game End'>TODO</TutorialPage>,
];
/* eslint-enable react/jsx-key */
/* eslint-enable @eslint-react/no-missing-key */

const buttonStyle: React.CSSProperties = {
    background: 'black',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16pt',
    padding: '0 12px',
};

export const Tutorial = () => {
    const navigate = useNavigate();
    const [pageID, setPageID] = React.useState(1);

    const pageContents = pages[pageID - 1];

    if (pageContents === undefined) {
        const result = navigate(PageRoutes.DASHBOARD);
        if (result instanceof Promise) {
            result.catch((error: unknown) => {
                console.error(error);
            });
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div
                style={{
                    background: 'lightgray',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    margin: 'auto',
                    minHeight: '100%',
                    width: '100%',
                }}
            >
                {pageContents}
            </div>
        </div>
    );
};
