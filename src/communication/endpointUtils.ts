import type express from 'express';
import type { RequestHandler, Router } from 'express';
import { requireSession } from '../server/requireSession';

export enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EndpointUtils {
    export interface EndpointInfo {
        readonly method: HTTPMethod;
        readonly path: string;
        readonly urlParameters: Record<string, unknown>;
        readonly queryParameters: Record<string, unknown>;
        readonly requestBody: unknown;
        readonly responseBody: unknown;
        readonly formDataName?: string | undefined;
    }

    type EndpointHandler<T extends EndpointInfo> = RequestHandler<
        T['urlParameters'],
        T['responseBody'],
        T['requestBody'],
        T['queryParameters']
        // could use this to store results on the response object without actually
        // calling response.send()
        //{ data: T['responseBody'] }
    >;

    type EndpointRequest<T extends EndpointInfo> = express.Request<
        T['urlParameters'],
        T['responseBody'],
        T['requestBody'],
        T['queryParameters']
    >;

    type EndpointResponse<T extends EndpointInfo> = T['responseBody'];

    export type EndpointConstructor<T extends EndpointInfo> = { instance: T };

    export type HandlerImplementation<T extends EndpointInfo> = (
        request: EndpointRequest<T>,
    ) => EndpointResponse<T> | Promise<EndpointResponse<T>>;

    const wrapExpressHandler = <T extends EndpointInfo>(
        handleRequest: HandlerImplementation<T>,
    ): EndpointHandler<T> => {
        return (request, response, next) => {
            (async () => {
                response
                    .status(200)
                    .setHeader('Content-Type', 'application/json')
                    .send(await handleRequest(request));
                next();
            })().catch((error: unknown) => {
                next(error);
            });
        };
    };

    export const registerEndpoint = <T extends EndpointInfo>(
        router: Router,
        endpointConstructor: EndpointConstructor<T>,
        handler: HandlerImplementation<T>,
        skipRequireSession = false,
    ) => {
        const method = endpointConstructor.instance.method;
        const path = endpointConstructor.instance.path;

        const wrappedHandler = wrapExpressHandler(handler);

        const middleware = skipRequireSession ? [] : [requireSession];

        switch (method) {
            case HTTPMethod.GET:
                return router.get(path, ...middleware, wrappedHandler);
            case HTTPMethod.DELETE:
                return router.delete(path, ...middleware, wrappedHandler);
            case HTTPMethod.PATCH:
                return router.patch(path, ...middleware, wrappedHandler);
            case HTTPMethod.POST:
                return router.post(path, ...middleware, wrappedHandler);
            case HTTPMethod.PUT:
                return router.put(path, ...middleware, wrappedHandler);
            default:
                return router;
        }
    };
}
