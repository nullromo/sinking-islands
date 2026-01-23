export type NumberMap<T> = Partial<Record<number, T>>;
export type StringMap<T> = Partial<Record<string, T>>;

/**
 * @brief Converts a number map to a list of its keys.
 *
 * Calling Object.keys() on a map that uses numbers as its keys will result in
 * a string[], so this function can be used to get the keys as a number[]
 * instead. In the case that there are any keys that are not numbers, they will
 * be removed from the resulting list.
 */
export const numberMapToKeys = <M extends NumberMap<T>, T>(map: M) => {
    return Object.keys(map)
        .map((key) => {
            return Number(key);
        })
        .filter((key) => {
            return !isNaN(key);
        });
};

/**
 * @brief Converts a map to a list of its keys.
 *
 * See number-keyed version above.
 */
export const mapToKeys = <T>(map: StringMap<T>) => {
    return Object.keys(map);
};

/**
 * @brief Converts a number map to a list of its values.
 *
 * Calling Object.values() on a Partial<Record<number, T>> will yield Array<T |
 * undefined>, since the map was partial. In this case, we don't care about
 * undefined values and we just want to get a list of all the actual values
 * that exist in the map.
 */
export const numberMapToValues = <T>(map: NumberMap<T>) => {
    return Object.values(map).filter((value) => {
        return value !== undefined;
    }) as T[];
};

/**
 * @brief Converts a map to a list of its values.
 *
 * See number-keyed version above.
 */
export const mapToValues = <T>(map: StringMap<T>) => {
    return Object.values(map).filter((value) => {
        return value !== undefined;
    }) as T[];
};

/**
 * @brief Converts a number map to a list of its entries.
 *
 * This function provides the same functionality as numberMapToKeys in terms of
 * the keys.
 *
 * For the values, calling Object.entries() on a Partial<Record<>> will result
 * in a [string, T | undefined][]. Normally, since we are iterating over the
 * entries in the map, we would expect none of the values to be undefined. For
 * that reason, this function removes any entries that are null or undefined
 * and casts the result accordingly. Essentially this function can be used
 * almost as if it returned [number, NonNullable<T>][] from the map.
 */
export const numberMapToEntries = <T>(map: NumberMap<T>) => {
    return Object.entries(map)
        .map(([key, value]) => {
            return [Number(key), value];
        })
        .filter(([_, value]) => {
            return value !== undefined;
        }) as Array<[number, T]>;
};

/**
 * @brief Converts a map to a list of its entries.
 *
 * See number-keyed version above.
 */
export const mapToEntries = <T>(map: StringMap<T>) => {
    return Object.entries(map).filter(([_, value]) => {
        return value !== undefined;
    }) as Array<[string, T]>;
};

/**
 * @brief Calls map and filter on all the entries in a number map, returning
 * the result.
 *
 * The general way to modify entries of a map is by using
 * Object.fromEntries(Object.entries(x.map())). This function handles that, and
 * provides the additional functionality of filtering. There are common use
 * cases where you want to do
 * Object.fromEntries(Object.entries(x.map().filter())), so the solution now is
 * to just return null from the map() function and this mutator will
 * automatically remove those null values.
 */
export const mutateNumberMap = <T, U>(
    map: NumberMap<T>,
    action: (entry: [number, T], index: number) => [number, U] | null,
    allowNullValues = false,
) => {
    return Object.fromEntries(
        numberMapToEntries(map)
            .map((item, index) => {
                return action(item, index);
            })
            .filter((entry) => {
                if (allowNullValues) {
                    return entry !== null;
                }
                // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                return !(entry === null || entry[1] === null);
            }) as Array<[number, U]>,
    ) as NumberMap<U>;
};

/**
 * @brief Calls map and filter on all the entries in a map.
 *
 * See number-keyed version above.
 */
export const mutateMap = <T, U>(
    map: StringMap<T>,
    action: (entry: [string, T]) => [string, U] | null,
    allowNullValues = false,
) => {
    return Object.fromEntries(
        mapToEntries(map)
            .map(action)
            .filter((entry) => {
                if (allowNullValues) {
                    return entry !== null;
                }
                // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                return !(entry === null || entry[1] === null);
            }) as Array<[string, U]>,
    ) as StringMap<U>;
};

/**
 * @brief Calls filter on all the entries in a number map, returning the
 * result.
 */
export const filterNumberMap = <M extends NumberMap<T>, T>(
    map: M,
    filterFunc: (entry: [number, NonNullable<M[number]>]) => boolean,
): M => {
    return Object.fromEntries(
        numberMapToEntries(map).filter((entry) => {
            const key = entry[0];
            const value = entry[1];

            if (value === undefined || value === null) {
                return false;
            }

            return filterFunc([key, value]);
        }),
    ) as M;
};

/**
 * @brief Calls filter on all the entries in a map.
 */
export const filterMap = <T>(
    map: StringMap<T>,
    filterFunc: (entry: [string, T]) => boolean,
) => {
    return Object.fromEntries(
        mapToEntries(map).filter(filterFunc),
    ) as StringMap<T>;
};

/**
 * @brief Tells if a NumberMap or StringMap is empty.
 *
 * Normally, Object.entries(map).length would be used, but that could include
 * undefined values.
 */
export const isMapEmpty = <T>(map: NumberMap<T> | StringMap<T>) => {
    return mapToEntries(map).length <= 0;
};
