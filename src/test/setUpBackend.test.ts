import { afterAll, beforeAll, expect, test } from '@jest/globals';
import { NOT_LOGGED_IN_ERROR_MESSAGE } from '../server/requireSession';
import { ServerCalls } from '../serverCalls';
import { setUpBackend, tearDownBackend } from './setUpBackend';

beforeAll(async () => {
    await setUpBackend();
});
afterAll(() => {
    tearDownBackend();
});

test('The server runs', async () => {
    const serverCalls = new ServerCalls(true);
    try {
        await serverCalls.whoAmI();
    } catch (error) {
        expect((error as Error).message).toEqual(NOT_LOGGED_IN_ERROR_MESSAGE);
    }
});
