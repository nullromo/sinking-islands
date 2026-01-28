import { afterAll, beforeEach, expect, test } from '@jest/globals';
import { setUpBackend, tearDownBackend } from './setUpBackend';
import { ServerCalls } from '../serverCalls';
import { NOT_LOGGED_IN_ERROR_MESSAGE } from '../server/requireSession';

beforeEach(async () => {
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
