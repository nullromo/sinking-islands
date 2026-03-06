import { buildCutout } from '../buildCutout';
import { actionOrderTrackElementID } from '../elementIDs';
import { createBasicGameWithCharacters } from '../pageData';
import { TutorialDimOverlay, TutorialTextBox } from '../styles';
import { useBoundingBox } from '../useBoundingBox';

const SlotSpan = (
    props: { readonly section: 1 | 2 | 3 } & React.PropsWithChildren,
) => {
    return (
        <span
            style={{
                background:
                    props.section === 1
                        ? 'khaki'
                        : props.section === 2
                          ? 'lightpink'
                          : 'palegreen',
                color: 'black',
                margin: '0 1px',
                padding: '0 3px',
            }}
        >
            {props.children}
        </span>
    );
};

const ActionOrderTrackScreen = () => {
    const actionOrderTrackBox = useBoundingBox(actionOrderTrackElementID);
    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <TutorialDimOverlay
                clipPath={buildCutout(actionOrderTrackBox, 16)}
            />
            <TutorialTextBox
                style={{
                    left: actionOrderTrackBox.left - 700,
                    position: 'absolute',
                    top: actionOrderTrackBox.top,
                    width: '650px',
                }}
            >
                Action Order Track
                <hr />
                The action order track has 6 slots and 3 sections{' '}
                <SlotSpan section={1}>1 2</SlotSpan>{' '}
                <SlotSpan section={2}>3 4</SlotSpan>{' '}
                <SlotSpan section={3}>5 6</SlotSpan>. No player may place 2
                cards in the same section during a round.{' '}
                <em>
                    For example, if you place a card in slot{' '}
                    <SlotSpan section={1}>1</SlotSpan>, you cannot also place a
                    card in slot <SlotSpan section={1}>2</SlotSpan>.
                </em>{' '}
                <br />
                <br />
                In other words, of the three cards you place, the first card
                must be in slot <SlotSpan section={1}>1</SlotSpan> or{' '}
                <SlotSpan section={1}>2</SlotSpan>, the second card must be in
                slot <SlotSpan section={2}>3</SlotSpan> or{' '}
                <SlotSpan section={2}>4</SlotSpan>, and the third card must be
                in slot <SlotSpan section={3}>5</SlotSpan> or{' '}
                <SlotSpan section={3}>6</SlotSpan>.
            </TutorialTextBox>
        </div>
    );
};

export const ActionOrderTrackScreenData = {
    createGame: createBasicGameWithCharacters,
    overlay: <ActionOrderTrackScreen />,
};
