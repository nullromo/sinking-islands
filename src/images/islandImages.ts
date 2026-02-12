// 6 small normal
// 4 large normal
// 4 large volcano
// 2 large sacred

import large1 from './islands/large1.jpg';
import large2 from './islands/large2.jpg';
import large3 from './islands/large3.jpg';
import large4 from './islands/large4.jpg';
import large5 from './islands/large5.jpg';
import large6 from './islands/large6.jpg';
import large7 from './islands/large7.jpg';
import large8 from './islands/large8.jpg';
import large9 from './islands/large9.jpg';
import sacred1 from './islands/sacred1.jpg';
import sacred10 from './islands/sacred10.jpg';
import sacred11 from './islands/sacred11.jpg';
import sacred12 from './islands/sacred12.jpg';
import sacred2 from './islands/sacred2.jpg';
import sacred3 from './islands/sacred3.jpg';
import sacred4 from './islands/sacred4.jpg';
import sacred5 from './islands/sacred5.jpg';
import sacred6 from './islands/sacred6.jpg';
import sacred7 from './islands/sacred7.jpg';
import sacred8 from './islands/sacred8.jpg';
import sacred9 from './islands/sacred9.jpg';
import small from './islands/small 5.jpg';
import small1 from './islands/small1.jpg';
import small2 from './islands/small2.jpg';
import small3 from './islands/small3.jpg';
import small4 from './islands/small4.jpg';
import small5 from './islands/small5.jpg';
import small6 from './islands/small6.jpg';
import small7 from './islands/small7.jpg';
import volcano1 from './islands/volcano1.jpg';
import volcano10 from './islands/volcano10.jpg';
import volcano11 from './islands/volcano11.jpg';
import volcano2 from './islands/volcano2.jpg';
import volcano3 from './islands/volcano3.jpg';
import volcano4 from './islands/volcano4.jpg';
import volcano5 from './islands/volcano5.jpg';
import volcano6 from './islands/volcano6.jpg';
import volcano7 from './islands/volcano7.jpg';
import volcano8 from './islands/volcano8.jpg';
import volcano9 from './islands/volcano9.jpg';

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
                return small5;
            case 14:
                return sacred2;
            case 15:
                return volcano4;
            case 16:
                return small6;
            default:
                throw new Error(`Invalid island number: ${islandNumber}.`);
        }
    })();
    return `url(${image})`;
};
