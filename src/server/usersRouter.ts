import express from 'express';

export const usersRouter = (() => {
    const router = express.Router();
    router.post(
        '/user',
        (
            request: express.Request<
                unknown,
                unknown,
                { username?: string; password?: string },
                unknown
            >,
            response,
            next,
        ) => {
            console.log(request.body);
            try {
                const username = request.body.username;
                const password = request.body.password;

                if (!username) {
                    throw new Error('Creating a user requires a username');
                }
                if (!password) {
                    throw new Error('Creating a user requires a password');
                }

                const message = `User '${username}' created.`;
                console.log(message);
                response.send({ message });
                next();
            } catch (error: unknown) {
                next(error);
            }
        },
    );
    return router;
})();
