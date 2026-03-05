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
