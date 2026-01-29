import seedrandom from 'seedrandom';

export let customRandom = Math.random;

export const setRandomSeed = (seed: string) => {
    customRandom = seedrandom(seed);
};
