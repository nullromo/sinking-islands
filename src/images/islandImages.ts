// Island counts
// - 6 small normal
// - 4 large normal
// - 4 large volcano
// - 2 large sacred

import large1 from './islands/large1.jpg';
import large2 from './islands/large2.jpg';
import large3 from './islands/large3.jpg';
import large4 from './islands/large4.jpg';
import sacred1 from './islands/sacred1.jpg';
import sacred2 from './islands/sacred2.jpg';
import small1 from './islands/small1.jpg';
import small2 from './islands/small2.jpg';
import small3 from './islands/small3.jpg';
import small4 from './islands/small4.jpg';
import small5 from './islands/small5.jpg';
import small6 from './islands/small6.jpg';
import volcano1 from './islands/volcano1.jpg';
import volcano2 from './islands/volcano2.jpg';
import volcano3 from './islands/volcano3.jpg';
import volcano4 from './islands/volcano4.jpg';

export const getIslandImage = (islandNumber: number) => {
    const image = (() => {
        switch (islandNumber) {
            case 1:
                return small1;
            case 2:
                return large1;
            case 3:
                return large2;
            case 4:
                return small2;
            case 5:
                return large3;
            case 6:
                return volcano1;
            case 7:
                return small3;
            case 8:
                return large4;
            case 9:
                return volcano2;
            case 10:
                return small4;
            case 11:
                return sacred1;
            case 12:
                return volcano3;
            case 13:
                return small6;
            case 14:
                return sacred2;
            case 15:
                return volcano4;
            case 16:
                return small5;
            default:
                throw new Error(`Invalid island number: ${islandNumber}.`);
        }
    })();
    return `url(${image})`;
};
