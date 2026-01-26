import { afterAll, beforeEach, expect, test } from '@jest/globals';
import { setUpRedis } from './setUpRedis';
import { destroyRedis, getRedis } from '../server/redisConnector';

beforeEach(async () => {
    await setUpRedis();
});
afterAll(() => {
    destroyRedis();
});

test('The database starts empty', async () => {
    // connect to redis
    const redis = await getRedis();

    // get all keys
    const keys = await redis.keys('*');

    // expect there to be no data
    expect(keys.length).toEqual(0);
});
