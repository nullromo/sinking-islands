import express from 'express';
import { EndpointUtils } from '../endpointUtils';
import { Endpoints } from '../endpoints';
import { GameAPI } from './gameAPI';

export const gameRouter = (() => {
    const router = express.Router();

    EndpointUtils.registerEndpoint(
        router,
        Endpoints.CreateGame,
        async (request) => {
            return GameAPI.createGame(request.session.username);
        },
    );

    EndpointUtils.registerEndpoint(
        router,
        Endpoints.GetGamesForUser,
        async (request) => {
            return GameAPI.getGamesForUser(request.session.username);
        },
    );

    return router;
})();
