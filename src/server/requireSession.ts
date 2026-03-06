import type { RequestHandler } from 'express';
import { HTTPResponseCodes } from '../communication/httpResponseCodes';

export const NOT_LOGGED_IN_ERROR_MESSAGE = 'Not logged in.';

export const requireSession: RequestHandler = (request, response, next) => {
    if (!request.session.username) {
        response.status(HTTPResponseCodes.UNAUTHORIZED);
        next(new Error(NOT_LOGGED_IN_ERROR_MESSAGE));
    }
    next();
};
