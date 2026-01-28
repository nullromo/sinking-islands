import { afterAll, beforeEach, expect, test } from '@jest/globals';
import { getRedis } from '../server/redisConnector';
import { setUpRedis, tearDownRedis } from './setUpRedis';

beforeEach(async () => {
    await setUpRedis();
});
afterAll(async () => {
    await tearDownRedis();
});

test('The database starts empty', async () => {
    // connect to redis
    const redis = await getRedis();

    // get all keys
    const keys = await redis.keys('*');

    // expect there to be no data
    expect(keys.length).toEqual(0);
});
