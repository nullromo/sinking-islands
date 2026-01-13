import express from 'express';
import bcrypt from 'bcrypt';
import { Endpoints } from '../endpoints';
import { EndpointUtils } from '../endpointUtils';
import { getRedis } from './redisConnector';

const createUser = async (
    username: string | undefined,
    password: string | undefined,
) => {
    if (!username) {
        throw new Error('Creating a user requires a username');
    }
    if (!password) {
        throw new Error('Creating a user requires a password');
    }

    // connect to redis
    const redis = await getRedis();

    // create key for user
    const key = `user:${username}`;

    // check if the user already exists
    const existingUser = await redis.get(key);
    if (existingUser !== null) {
        throw new Error(`User '${username}' already exists`);
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

export const usersRouter = (() => {
    const router = express.Router();

    EndpointUtils.registerEndpointInfo(
        router,
        Endpoints.CreateUser,
        async (request) => {
            return createUser(request.body.username, request.body.password);
        },
    );

    return router;
})();
