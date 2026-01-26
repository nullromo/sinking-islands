import { afterAll, beforeEach, test } from '@jest/globals';
import { setUpRedis } from './setUpRedis';
import { destroyRedis } from '../server/redisConnector';

beforeEach(async () => {
    await setUpRedis();
});
afterAll(() => {
    destroyRedis();
});

test('', () => {
    //
});
