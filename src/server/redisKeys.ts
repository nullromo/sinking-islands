// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RedisKeys {
    export const createUserKey = (username: string) => {
        return `user:${username}`;
    };
}
