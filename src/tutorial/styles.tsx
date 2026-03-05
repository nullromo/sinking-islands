export const TutorialTextBox = (
    props: { readonly style?: React.CSSProperties } & React.PropsWithChildren,
) => {
    return (
        <div
            style={{
                background: '#444444',
                borderRadius: '16px',
                color: 'white',
                fontSize: '16pt',
                padding: '20px 12px',
                width: 'fit-content',
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
};

export const TutorialDimOverlay = (props: { readonly clipPath?: string }) => {
    return (
        <div
            style={{
                background: '#00000088',
                clipPath: props.clipPath,
                height: '100vh',
                position: 'absolute',
                width: '100vw',
            }}
        />
    );
};
