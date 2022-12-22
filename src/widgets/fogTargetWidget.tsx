import React from 'react';

interface FogTargetWidgetProps {
    submit: (fogTarget: number) => void;
}

export const FogTargetWidget = (props: FogTargetWidgetProps) => {
    const [slotChoice, setSlotChoice] = React.useState(0);

    return (
        <>
            <select
                value={slotChoice}
                onChange={(event) => {
                    setSlotChoice(Number(event.target.value));
                }}
            >
                {[...Array(6).keys()].map((index) => {
                    return (
                        <option key={index} value={index}>
                            {index + 1}
                        </option>
                    );
                })}
            </select>
            <button
                type='button'
                onClick={() => {
                    props.submit(slotChoice);
                }}
            >
                Submit
            </button>
        </>
    );
};
