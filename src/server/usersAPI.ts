import bcrypt from 'bcrypt';
import type { Session, SessionData } from 'express-session';
import { getRedis } from './redisConnector';
import { RedisKeys } from './redisKeys';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UsersAPI {
    // create a user in the database
    export const createUser = async (
        username: string | undefined,
        password: string | undefined,
    ) => {
        // validate arguments
        if (!username) {
            throw new Error('Creating a user requires a username.');
        }
        if (!password) {
            throw new Error('Creating a user requires a password.');
        }

        // connect to redis
        const redis = await getRedis();

        // create key for user
        const key = RedisKeys.createUserKey(username);

        // check if the user already exists
        const existingUser = await redis.get(key);
        if (existingUser !== null) {
            throw new Error(`User '${username}' already exists.`);
        }

        // create a password hash
        const passwordHash = await new Promise<string>((resolve, reject) => {
            bcrypt.hash(password, 10, (error, hash) => {
                if (error) {
                    reject(error);
                }
                resolve(hash);
            });
        });

        // add the user to redis
        await redis.set(key, passwordHash);

        const message = `User '${username}' created.`;
        console.log(message);
        return { message };
    };

    // create or refresh a user session
    export const logIn = async (
        session: Session & SessionData,
        username: string | undefined,
        password: string | undefined,
    ) => {
        // validate arguments
        if (!username) {
            throw new Error('Logging in requires a username.');
        }
        if (!password) {
            throw new Error('Logging in requires a password.');
        }

        // connect to redis
        const redis = await getRedis();

        // determine the key for the user
        const key = RedisKeys.createUserKey(username);

        // get the existing password hash
        const passwordHash = await redis.get(key);
        if (passwordHash === null) {
            throw new Error(`User '${username}' does not exist.`);
        }

        // make sure the given password is correct
        const passwordCorrect = await new Promise<boolean>(
            (resolve, reject) => {
                bcrypt.compare(password, passwordHash, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            },
        );
        if (!passwordCorrect) {
            throw new Error('Incorrect password.');
        }

        // save the session
        session.regenerate((error) => {
            if (error) {
                throw error;
            }
            session.username = username;
            session.save((error) => {
                if (error) {
                    throw error;
                }
            });
        });

        const message = `User '${username}' logged in.`;
        console.log(message);
        return { message };
    };

    export const logOut = (session: Session & SessionData) => {
        const username = session.username;

        // validate arguments
        if (!username) {
            throw new Error('Logging out requires a username.');
        }

        // destroy the session
        session.destroy((error) => {
            if (error) {
                throw error;
            }
        });

        const message = `User '${username}' logged out.`;
        console.log(message);
        return { message };
    };

    export const whoAmI = (username: string | undefined) => {
        // check username is valid
        if (username === undefined) {
            throw new Error('No user logged in.');
        }

        return { username };
    };
}
