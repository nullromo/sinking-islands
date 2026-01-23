import type { RequestHandler } from 'express';
import { HTTPResponseCodes } from '../httpResponseCodes';

export const requireSession: RequestHandler = (request, response, next) => {
    if (!request.session.username) {
        response.status(HTTPResponseCodes.UNAUTHORIZED);
        next(new Error('Not logged in.'));
    }
    next();
};
