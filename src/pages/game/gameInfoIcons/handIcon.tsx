export const HandIcon = (props: { readonly label: number }) => {
    return (
        <div style={{ position: 'relative', width: '50px' }}>
            <span
                style={{
                    color: 'red',
                    fontSize: '17pt',
                    height: '100%',
                    left: 1,
                    position: 'absolute',
                    textAlign: 'center',
                    top: 11,
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
                viewBox='1 0 19 20'
            >
                <polygon
                    points='2 3 11 2 12 13.5 3 14.5'
                    transform='translate(1 -1)'
                />
                <polygon
                    points='5 4 14 5 13 16.5 4 15.5'
                    transform='translate(5 2)'
                />
                <polygon
                    points='3 3 13 3 13 15.5 3 15.5'
                    transform='translate(3)'
                />
            </svg>
        </div>
    );
};
