import './gamePage.css';

type CSSWithVariables = React.CSSProperties & Record<string, number | string>;

interface CircularContainerProps {
    readonly items: React.ReactNode[];
}

export const CircularContainer = (props: CircularContainerProps) => {
    const numberOfItems = props.items.length;
    const spacing = 0.3;
    const tangent = Math.tan(Math.PI / numberOfItems);
    const containerStyle: CSSWithVariables = {
        '--diameter': '100px',
        '--radius': `calc(${
            0.5 * (1 + spacing)
        } * var(--diameter) / ${tangent})`,
        '--size': 'calc(2 * var(--radius) + var(--diameter))',
        '--spacing': spacing,
        height: 'var(--size)',
        marginBottom: '-30px',
        position: 'relative',
        width: 'var(--size)',
    };

    return (
        <div className='circular-container' style={containerStyle}>
            {props.items.map((item, index) => {
                const style: CSSWithVariables = {
                    '--rotation-amount': `calc(${index} * 1turn / ${numberOfItems})`,
                    height: 'var(--diameter)',
                    left: '50%',
                    margin: 'calc(-0.5 * var(--diameter))',
                    position: 'absolute',
                    top: '50%',
                    transform:
                        'rotate(var(--rotation-amount)) translate(var(--radius)) rotate(calc(-1 * var(--rotation-amount)))',
                    width: 'var(--diameter)',
                };
                return (
                    <span key={index} style={style}>
                        {item}
                    </span>
                );
            })}
        </div>
    );
};
