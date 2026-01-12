/**
 * Shuffles an array in place and returns it.
 */
export const shuffleArray = <T>(array: T[]) => {
    let currentIndex = array.length;
    let randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex = currentIndex - 1;

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

/**
 * Utility for making things readable.
 */
export const upperSnakeToTitle = (message: string) => {
    if (message === '') {
        return message;
    }
    return message
        .toLowerCase()
        .split('_')
        .map((word) => {
            return `${word[0].toUpperCase()}${word.slice(1)}`;
        })
        .join(' ');
};

export type MakeEmptyKeysOptional<T> = {
    [K in keyof T]-?: (
        x: Record<string, never> extends T[K]
            ? Partial<Record<K, T[K]>>
            : Record<K, T[K]>,
    ) => void;
}[keyof T] extends (x: infer I) => void
    ? I extends infer U
        ? { [K in keyof U]: U[K] }
        : never
    : never;
