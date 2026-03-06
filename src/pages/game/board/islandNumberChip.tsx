import type { IslandSerialized } from '../../../info/commonTypes';
import { getIslandColors } from '../../../info/islandColors';

export const IslandNumberChip = (props: {
    readonly island: IslandSerialized;
    readonly islandWidth: number;
}) => {
    const colors = getIslandColors(props.island);

    return (
        <div
            style={{
                border: '1px solid black',
                borderRadius: '4px',
                height: `${props.islandWidth / 7}px`,
                left: `-${(props.islandWidth * 3) / 70}px`,
                position: 'absolute',
                textAlign: 'center',
                top: `-${props.islandWidth / 20}px`,
                userSelect: 'none',
                width: `${props.islandWidth / 7}px`,
            }}
        >
            <div
                style={{
                    alignItems: 'center',
                    background: colors.island,
                    borderRadius: '4px',
                    color: colors.text,
                    display: 'flex',
                    fontSize: `${props.islandWidth / 8.75}px`,
                    height: '100%',
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                <b>{`${props.island.islandNumber} `}</b>
            </div>
        </div>
    );
};
