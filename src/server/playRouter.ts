import express from 'express';
import { Endpoints } from '../endpoints';
import { EndpointUtils } from '../endpointUtils';
import { PlayAPI } from './playAPI';

export const playRouter = () => {
    const router = express.Router();

    EndpointUtils.registerEndpoint(
        router,
        Endpoints.TakeGameAction,
        async (request) => {
            return PlayAPI.takeGameAction(
                request.session.username,
                request.body.gameID,
                request.body.gameAction,
            );
        },
    );

    return router;
};
