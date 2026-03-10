export const SetAsideCardsIcon = (props: { readonly label: number }) => {
    return (
        <div style={{ position: 'relative', width: '50px' }}>
            <span
                style={{
                    color: 'red',
                    fontSize: '17pt',
                    height: '100%',
                    left: -9,
                    position: 'absolute',
                    textAlign: 'center',
                    top: 9,
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
                viewBox='2 1 19 16'
            >
                <polygon points='3 3 13 3 13 15.5 3 15.5' />
                <polygon points='14 3 20 3 20 11 14 11' />
            </svg>
        </div>
    );
};
