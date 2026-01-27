import { afterAll, beforeEach, test } from '@jest/globals';
import { setUpBackend, tearDownBackend } from './setUpBackend';

beforeEach(() => {
    setUpBackend();
});
afterAll(() => {
    tearDownBackend();
});

test('The server runs', () => {
    //
});
