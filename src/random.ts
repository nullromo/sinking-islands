import seedrandom from 'seedrandom';
import { v4 as uuidv4 } from 'uuid';

export let customRandom = Math.random;

const createRandomUUIDFunction = (random: () => number) => {
    return () => {
        return uuidv4({
            random: Uint8Array.of(
                ...Array.from({ length: 16 }, () => {
                    return Math.floor(random() * 256);
                }),
            ),
        });
    };
};

export let randomUUID = createRandomUUIDFunction(Math.random);

export const setRandomSeed = (seed: string) => {
    customRandom = seedrandom(seed);
    randomUUID = createRandomUUIDFunction(seedrandom(seed));
};
