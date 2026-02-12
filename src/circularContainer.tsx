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

export const CircularContainer2 = (props: CircularContainerProps) => {
    // number of items to spread evenly
    const N = props.items.length;
    // overall width of the container (diameter of the island circle)
    const D = 500;
    // radius of the container
    const r = D / 2;
    // main angle to spread each item by
    const theta = (2 * Math.PI) / N;
    // radius of the zone of each item (r prime)
    const rp = r * Math.sin(theta / 2);
    // width of inscribed square in the zone
    const W = (2 * rp) / Math.sqrt(2);

    return (
        <div
            style={{
                border: '1px solid',
                borderRadius: `${D / 2}px`,
                height: `${D}px`,
                position: 'relative',
                width: `${D}px`,
            }}
        >
            {props.items.map((item, i) => {
                const rotationAmount = i * theta;
                return (
                    <div
                        key={i}
                        style={{
                            alignItems: 'center',
                            border: '1px solid',
                            borderRadius: `${rp}px`,
                            display: 'flex',
                            height: `${rp * 2}px`,
                            justifyContent: 'center',
                            left: `calc(50% - ${rp}px)`,
                            position: 'absolute',
                            top: `calc(50% - ${rp}px)`,
                            transform: `rotate(${rotationAmount}rad) translate(${r}px) rotate(-${rotationAmount}rad)`,
                            width: `${rp * 2}px`,
                        }}
                    >
                        <div
                            style={{
                                border: '1px solid',
                                height: `${W}px`,
                                width: `${W}px`,
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};
