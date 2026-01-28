import {
    destroyRedis,
    getRedis,
    initializeRedis,
} from '../server/redisConnector';

/**
 * Used to initialize the test redis database.
 */
export const setUpRedis = async () => {
    // set the correct database
    initializeRedis(true);

    // connect to redis
    const redis = await getRedis();

    // erase all data in the database
    await redis.flushDb();
};

export const tearDownRedis = async () => {
    await destroyRedis();
};
