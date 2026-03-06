import { assertUnreachable } from '../util/util';
import type { IslandSerialized } from './commonTypes';
import { IslandType } from './commonTypes';

export const getIslandColors = (
    island: Pick<IslandSerialized, 'islandType'>,
) => {
    switch (island.islandType) {
        case IslandType.SACRED:
            return { island: '#ffc532', text: 'black' };
        case IslandType.VOLCANO:
            return { island: 'crimson', text: 'black' };
        case IslandType.NORMAL:
            return { island: 'deepskyblue', text: 'black' };
        default:
            return assertUnreachable(island.islandType);
    }
};
