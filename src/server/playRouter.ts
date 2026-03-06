import express from 'express';
import { Endpoints } from '../communication/endpoints';
import { EndpointUtils } from '../communication/endpointUtils';
import { PlayAPI } from './playAPI';

export const playRouter = (() => {
    const router = express.Router();

    EndpointUtils.registerEndpoint(
        router,
        Endpoints.TakeGameAction,
        async (request) => {
            return PlayAPI.takeGameAction(
                request.session.username,
                request.params.gameID,
                request.body.gameAction,
            );
        },
    );

    return router;
})();
