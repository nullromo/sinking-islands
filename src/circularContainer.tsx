import * as React from 'react';
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
    const containerRef = React.useRef<HTMLDivElement>(null);

    // overall width of the container (diameter of the island circle)
    const [d, setD] = React.useState(0);

    React.useEffect(() => {
        const updateD = () => {
            if (containerRef.current) {
                setD(containerRef.current.getBoundingClientRect().width);
            }
        };

        updateD();

        const observer = new ResizeObserver(updateD);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => {
            observer.disconnect();
        };
    });

    // number of items to spread evenly
    const N = props.items.length;
    // main angle to spread each item by
    const theta = (2 * Math.PI) / N;
    // radius of the container
    const r = d / 2 / (1 + Math.sin(theta / 2));
    // radius of the zone of each item (r prime)
    const rp = r * Math.sin(theta / 2);
    // width of inscribed square in the zone
    const W = (2 * rp) / Math.sqrt(2);

    const containerStyle: CSSWithVariables = {
        aspectRatio: 1,
        background: 'green',
        border: '1px solid',
        borderRadius: '50%',
        maxHeight: '100%',
        position: 'relative',
        width: '100%',
    };

    return (
        <div ref={containerRef} style={containerStyle}>
            {props.items.map((item, i) => {
                const rotationAmount = i * theta;
                const itemContainerStyle: CSSWithVariables = {
                    alignItems: 'center',
                    border: '1px solid',
                    borderRadius: '50%',
                    display: 'flex',
                    height: `${rp * 2}px`,
                    justifyContent: 'center',
                    left: `calc(50% - ${rp}px)`,
                    position: 'absolute',
                    top: `calc(50% - ${rp}px)`,
                    transform: `rotate(${rotationAmount}rad) translate(${r}px) rotate(-${rotationAmount}rad)`,
                    width: `${rp * 2}px`,
                };
                return (
                    <div key={i} style={itemContainerStyle}>
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
