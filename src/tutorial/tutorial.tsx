import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { getIslandColors } from '../board';
import { CircularContainer } from '../circularContainer';
import { getIslandImage } from '../images/islandImages';
import type { NumberMap } from '../maps';
import { PageRoutes } from '../pageRoutes';
import { GameOperations } from '../server/gameObjects/gameOperations';

const TutorialPage = (props: {
    readonly title: string;
    readonly content: React.JSX.Element;
}) => {
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
            {props.content}
        </div>
    );
};

/* eslint-disable react/jsx-key */
/* eslint-disable @eslint-react/no-missing-key */
const pages: NumberMap<React.JSX.Element> & { length: number } = [
    <TutorialPage
        content={
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    justifyContent: 'space-evenly',
                    padding: '12px 25%',
                }}
            >
                <div>
                    <em>
                        {
                            "The gods are displeased! This petty human war has gone on far too long, and it's time for it to end!"
                        }
                    </em>
                </div>
                <div>
                    {
                        "In Sinking Islands, battle ensues on an ever-shrinking archipelago. The gods have begun to sink the islands one at a time, and they won't stop until one army eliminates the other."
                    }
                </div>
                <div>
                    <em>
                        {
                            'Fight for survival, lest everyone sink into the stormy sea!'
                        }
                    </em>
                </div>
            </div>
        }
        title='Introduction'
    />,
    <TutorialPage
        content={
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        width: '80%',
                    }}
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
                        {
                            'Welcome to the Archipelago. This ring of 16 islands is all the ground your people have to stand on. The islands begin the game in a random order.'
                        }
                    </div>
                </div>
            </div>
        }
        title='The Archipelago'
    />,
    <div>
        <h1>Islands</h1>
    </div>,
    <div>
        <h1>Characters</h1>
    </div>,
    <div>
        <h1>Rising Waters</h1>
    </div>,
    <div>
        <h1>Archipelago Overview</h1>
    </div>,
    <div>
        <h1>Round Structure</h1>
    </div>,
    <div>
        <h1>Action Order Track</h1>
    </div>,
    <div>
        <h1>Cards</h1>
    </div>,
    <div>
        <h1>Deck Composition</h1>
    </div>,
    <div>
        <h1>Card Details</h1>
    </div>,
    <div>
        <h1>Game End</h1>
    </div>,
];
/* eslint-enable react/jsx-key */
/* eslint-enable @eslint-react/no-missing-key */

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
                <div style={{ position: 'absolute' }}>
                    <Link to={PageRoutes.DASHBOARD}>
                        <button
                            style={{
                                background: 'black',
                                borderRadius: '4px',
                                color: 'white',
                                margin: '12px',
                            }}
                            type='button'
                        >
                            Home
                        </button>
                    </Link>
                </div>
                {pageContents}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px',
                    }}
                >
                    <button
                        disabled={pageID <= 1}
                        style={{
                            background: pageID <= 1 ? 'gray' : 'black',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: pageID <= 1 ? 'default' : 'pointer',
                            fontSize: '16pt',
                            padding: '0 12px',
                        }}
                        type='button'
                        onClick={() => {
                            setPageID((pageID) => {
                                return pageID - 1;
                            });
                        }}
                    >
                        {'< Prev'}
                    </button>
                    {Array(pages.length)
                        .keys()
                        .map((index) => {
                            const id = index + 1;
                            const active = pageID === id;
                            return (
                                <div key={id}>
                                    <div
                                        style={{
                                            alignItems: 'center',
                                            background: 'black',
                                            borderRadius: '50%',
                                            boxShadow: active
                                                ? '0px 0px 6px 3px yellow'
                                                : '',
                                            color: active ? 'yellow' : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            fontSize: '16pt',
                                            height: '32px',
                                            justifyContent: 'center',
                                            width: '32px',
                                        }}
                                        onClick={() => {
                                            setPageID(id);
                                        }}
                                    >
                                        {id}
                                    </div>
                                </div>
                            );
                        })}
                    {pageID === pages.length ? (
                        <Link to={PageRoutes.DASHBOARD}>
                            <button style={{ cursor: 'pointer' }} type='button'>
                                Home
                            </button>
                        </Link>
                    ) : (
                        <button
                            style={{
                                background: 'black',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '16pt',
                                padding: '0 12px',
                            }}
                            type='button'
                            onClick={() => {
                                setPageID((pageID) => {
                                    return pageID + 1;
                                });
                            }}
                        >
                            {'Next >'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
