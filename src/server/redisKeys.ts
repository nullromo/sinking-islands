export const sessionPrefix = 'session:sinking-islands:';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RedisKeys {
    export const createUserKey = (username: string) => {
        return `user:${username}`;
    };

    export const createGameKey = (gameID: string) => {
        return `game:${gameID}`;
    };

    export const createSessionKey = (sessionID: string) => {
        return `${sessionPrefix}${sessionID}`;
    };
}
