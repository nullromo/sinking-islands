import * as React from 'react';
import type { IslandSerialized } from './commonTypes';
import './gamePage.css';
import { useDynamicSize } from './useDynamicSize';

type CSSWithVariables = React.CSSProperties & Record<string, number | string>;

interface CircularContainerProps {
    readonly items: IslandSerialized[];
    readonly renderItem: (
        item: IslandSerialized,
        itemWidth: number,
    ) => React.JSX.Element;
}

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
export const CircularContainer = (props: CircularContainerProps) => {
    // overall width of the container (diameter of the island circle)
    const { ref: containerRef, size: outerWidth } = useDynamicSize(
        (element) => {
            return element.getBoundingClientRect().width;
        },
    );

    // After doing all the calculations, there is still just kind of a gap
    // between the islands. This is because the circumscribed buffer zone
    // circle method is not the most optimal for packing squares. So because of
    // this, all the calculations are done and then there's just a scaling
    // factor applied to all the items afterwards. This makes it scale and
    // arrange properly, but still minimize space between and maximize
    // individual item size.
    const adjustmentFactor = 1;

    // radius of outer circle
    const outerRadius = outerWidth / 2;
    // number of items to spread evenly
    const numberOfItems = props.items.length;
    // main angle to spread each item by
    const angle = (2 * Math.PI) / numberOfItems;
    // radius of the container
    const layoutRadius = outerRadius / (1 + Math.sin(angle / 2));
    // radius of the zone of each item (r prime)
    const itemRadius = layoutRadius * Math.sin(angle / 2) * adjustmentFactor;
    // width of inscribed square in the zone
    const itemWidth = (2 * itemRadius) / Math.sqrt(2);

    const containerStyle: CSSWithVariables = {
        aspectRatio: 1,
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
                    //border: '1px solid',
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
                                height: `${itemWidth}px`,
                                width: `${itemWidth}px`,
                            }}
                        >
                            {props.renderItem(item, itemWidth)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
