import express from 'express';
import { Endpoints } from '../endpoints';
import { EndpointUtils } from '../endpointUtils';

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

    // TODO: create the user
    await new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
    });
    // TODO: ^

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
