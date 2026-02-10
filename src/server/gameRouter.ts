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

    EndpointUtils.registerEndpoint(router, Endpoints.GetGameList, async () => {
        return GameAPI.getGameList();
    });

    EndpointUtils.registerEndpoint(
        router,
        Endpoints.JoinGame,
        async (request) => {
            return GameAPI.joinGame(
                request.params.gameID,
                request.session.username,
            );
        },
    );

    return router;
})();
