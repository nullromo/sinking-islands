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

/**
 * See the drawing in the repo for calculations.
 *
 * Variable names
 *   outerWidth    = D
 *   outerRadius   = R
 *   numberOfItems = N
 *   angle         = θ
 *   layoutRadius  = r
 *   itemRadius    = r'
 *   itemWidth     = W
 */
export const CircularContainer2 = (props: CircularContainerProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    // overall width of the container (diameter of the island circle)
    const [outerWidth, setOuterWidth] = React.useState(0);

    React.useEffect(() => {
        const updateD = () => {
            if (containerRef.current) {
                setOuterWidth(
                    containerRef.current.getBoundingClientRect().width,
                );
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

    // radius of outer circle
    const outerRadius = outerWidth / 2;
    // number of items to spread evenly
    const numberOfItems = props.items.length;
    // main angle to spread each item by
    const angle = (2 * Math.PI) / numberOfItems;
    // radius of the container
    const layoutRadius = outerRadius / (1 + Math.sin(angle / 2));
    // radius of the zone of each item (r prime)
    const itemRadius = layoutRadius * Math.sin(angle / 2);
    // width of inscribed square in the zone
    const itemWidth = (2 * itemRadius) / Math.sqrt(2);

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
                const rotationAmount = i * angle;
                const itemContainerStyle: CSSWithVariables = {
                    alignItems: 'center',
                    border: '1px solid',
                    borderRadius: '50%',
                    display: 'flex',
                    height: `${itemRadius * 2}px`,
                    justifyContent: 'center',
                    left: `calc(50% - ${itemRadius}px)`,
                    position: 'absolute',
                    top: `calc(50% - ${itemRadius}px)`,
                    transform: `rotate(${rotationAmount}rad) translate(${layoutRadius}px) rotate(-${rotationAmount}rad)`,
                    width: `${itemRadius * 2}px`,
                };
                return (
                    <div key={i} style={itemContainerStyle}>
                        <div
                            style={{
                                border: '1px solid',
                                height: `${itemWidth}px`,
                                width: `${itemWidth}px`,
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};
