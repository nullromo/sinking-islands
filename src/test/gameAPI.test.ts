import { afterAll, beforeAll, expect, test } from '@jest/globals';
import type { GameSerialized } from '../commonTypes';
import { GameAPI } from '../server/gameAPI';
import { getRedis } from '../server/redisConnector';
import { RedisKeys } from '../server/redisKeys';
import { setUpRedis, tearDownRedis } from './setUpRedis';

beforeAll(async () => {
    await setUpRedis();
});
afterAll(async () => {
    await tearDownRedis();
});

test('Games can be created', async () => {
    const redis = await getRedis();
    const id = await GameAPI.createGame('testuser');
    const game = (await redis.json.get(
        RedisKeys.createGameKey(id),
    )) as GameSerialized;
    expect(game.id).toEqual(id);
});

test('Games for user can be obtained', async () => {
    const id = await GameAPI.createGame('testuser');
    const games = await GameAPI.getGamesForUser('testuser');
    expect(
        games.some((game) => {
            return game.id === id;
        }),
    ).toBe(true);
});
