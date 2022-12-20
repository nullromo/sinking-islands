import util from 'util';

/**
 * Deeply converts an object to a string.
 */
export const fullObject = (obj: unknown) => {
    return util.inspect(obj, false, null, true);
};
