export const DeckIcon = (props: { readonly label: number }) => {
    return (
        <div style={{ position: 'relative', width: '50px' }}>
            <span
                style={{
                    color: 'red',
                    fontSize: '17pt',
                    height: '100%',
                    left: -5,
                    position: 'absolute',
                    textAlign: 'center',
                    top: 10,
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
                viewBox='0 0 18 18.5'
            >
                <polygon points='6 4 16 4 16 16.5 6 16.5' />
                <polygon points='4 3 14 3 14 15.5 4 15.5' />
                <polygon points='2 2 12 2 12 14.5 2 14.5' />
            </svg>
        </div>
    );
};
