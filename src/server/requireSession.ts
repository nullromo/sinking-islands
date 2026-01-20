import type { RequestHandler } from 'express';

export const requireSession: RequestHandler = (request, __, next) => {
    if (!request.session.username) {
        next(new Error('Not logged in.'));
    }
    next();
};
