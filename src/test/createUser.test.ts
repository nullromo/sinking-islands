import { afterAll, beforeAll, expect, test } from '@jest/globals';
import { setUpRedis, tearDownRedis } from './setUpRedis';
import { UsersAPI } from '../server/usersAPI';

beforeAll(async () => {
    await setUpRedis();
});
afterAll(async () => {
    await tearDownRedis();
});

test('Users can be created', async () => {
    await UsersAPI.createUser('testuser', 'testpassword');
});

test('Users with the same name cannot be created', async () => {
    return expect(async () => {
        await UsersAPI.createUser('testuser', 'testpassword');
    }).rejects.toThrow();
});
