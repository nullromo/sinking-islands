import { beforeAll, expect, test } from '@jest/globals';
import { customRandom } from '../util/random';
import { setUpRandom } from './setUpRandom';

beforeAll(() => {
    setUpRandom();
});

test('The random number generator can be seeded', () => {
    const randomNumber = customRandom();
    expect(randomNumber).toEqual(0.8722025543160253);
});
