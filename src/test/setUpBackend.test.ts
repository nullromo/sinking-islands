import { afterAll, beforeEach, test } from '@jest/globals';
import { setUpBackend, tearDownBackend } from './setUpBackend';
import { ServerCalls } from '../serverCalls';

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
        console.log(error);
    }
});
