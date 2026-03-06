const globalScale = 1.3;

export const RisingWaterSpinner = (props: { readonly width: number }) => {
    const makeBlock = (
        animationName: string,
        localScale: number,
        duration: number,
    ) => {
        const scale = globalScale * localScale;
        return (
            <div
                style={{
                    animation: `${duration}s infinite linear ${animationName}`,
                    background: 'black',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    height: props.width * scale,
                    left: -(props.width * scale - props.width) / 2,
                    position: 'absolute',
                    top: -(props.width * scale - props.width) / 2,
                    width: props.width * scale,
                    zIndex: -10,
                }}
            />
        );
    };

    return (
        <>
            {makeBlock('spin-offset', 0.85, 6)}
            {makeBlock('spin', 0.8, 5)}
            {makeBlock('spin-offset', 0.75, 4)}
        </>
    );
};
