import express from 'express';
import { EndpointUtils } from '../communication/endpointUtils';
import { Endpoints } from '../communication/endpoints';
import { UsersAPI } from './usersAPI';

// determine the data type for user sessions
declare module 'express-session' {
    interface SessionData {
        username?: string | undefined;
    }
}

export const usersRouter = (() => {
    const router = express.Router();

    EndpointUtils.registerEndpoint(
        router,
        Endpoints.CreateUser,
        async (request) => {
            return UsersAPI.createUser(
                request.body.username,
                request.body.password,
            );
        },
        true,
    );

    EndpointUtils.registerEndpoint(
        router,
        Endpoints.LogIn,
        async (request) => {
            return UsersAPI.logIn(
                request.session,
                request.body.username,
                request.body.password,
            );
        },
        true,
    );

    EndpointUtils.registerEndpoint(router, Endpoints.LogOut, (request) => {
        return UsersAPI.logOut(request.session);
    });

    EndpointUtils.registerEndpoint(router, Endpoints.WhoAmI, (request) => {
        return UsersAPI.whoAmI(request.session.username);
    });

    return router;
})();
