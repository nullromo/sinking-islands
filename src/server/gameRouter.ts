import express from 'express';
import { Endpoints } from '../communication/endpoints';
import { EndpointUtils } from '../communication/endpointUtils';
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
