import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import type { NumberMap } from '../maps';
import { PageRoutes } from '../pageRoutes';

/* eslint-disable react/jsx-key */
/* eslint-disable @eslint-react/no-missing-key */
const pages: NumberMap<React.JSX.Element> & { length: number } = [
    <div
        style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            fontSize: '16pt',
            height: '100%',
            justifyContent: 'space-around',
            padding: '0 25%',
        }}
    >
        <h1 style={{ margin: 0 }}>Introduction</h1>
        <div style={{ flexGrow: 0 }}>
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
                {'Fight for survival, lest everyone sink into the stormy sea!'}
            </em>
        </div>
    </div>,
    <div>
        <h1>The Archipelago</h1>
    </div>,
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

export const TutorialPage = () => {
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
        <div
            style={{
                background: 'lightgray',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                margin: 'auto',
                maxWidth: '1000px',
                minHeight: '500px',
            }}
        >
            <Link to={PageRoutes.DASHBOARD}>
                <button type='button'>Home</button>
            </Link>
            {pageContents}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0 ',
                }}
            >
                <button
                    disabled={pageID <= 1}
                    style={{ cursor: pageID <= 1 ? 'default' : 'pointer' }}
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
                                        height: '22px',
                                        justifyContent: 'center',
                                        width: '22px',
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
                        style={{ cursor: 'pointer' }}
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
    );
};
