export const DiscardPileIcon = (props: { readonly label: number }) => {
    return (
        <div style={{ position: 'relative', width: '50px' }}>
            <span
                style={{
                    color: 'red',
                    fontSize: '17pt',
                    height: '100%',
                    left: -3,
                    position: 'absolute',
                    textAlign: 'center',
                    top: 12,
                    width: '50px',
                    zIndex: 10,
                }}
            >
                {props.label}
            </span>
            <svg
                style={{
                    fill: 'white',
                    position: 'relative',
                    stroke: 'black',
                    strokeLinejoin: 'round',
                    strokeWidth: '1.4',
                }}
                viewBox='0 0 18 18'
            >
                <polygon points='2 3 14 3 13 15.5 3 15.5' />
                <polygon points='1 3 15 3 10 2 8 1 6 2' />
            </svg>
        </div>
    );
};
