/**
 * Shuffles an array in place and returns it.
 */
export const shuffleArray = <T>(array: T[]) => {
    let currentIndex = array.length;
    let randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
};

/**
 * Returns a random element from the given array.
 */
export const sampleArray = <T>(array: T[]) => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Utility for switch statement completeness.
 */
export const assertUnreachable = (thing: never): never => {
    throw new Error(`Impossible value: ${thing}`);
};
