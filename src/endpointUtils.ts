import type express from 'express';
import type { RequestHandler, Router } from 'express';

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

    export type EndpointConstructor<T extends EndpointInfo> = {
        instance: T;
    };

    type HandlerImplementation<T extends EndpointInfo> = (
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

    export const registerEndpointInfo = <T extends EndpointInfo>(
        router: Router,
        endpointConstructor: EndpointConstructor<T>,
        ...handlers: Array<HandlerImplementation<T>>
    ) => {
        const method = endpointConstructor.instance.method;
        const path = endpointConstructor.instance.path;

        const wrappedHandlers = handlers.map((handler) => {
            return wrapExpressHandler(handler);
        });
        switch (method) {
            case HTTPMethod.GET:
                return router.get(path, ...wrappedHandlers);
            case HTTPMethod.DELETE:
                return router.delete(path, ...wrappedHandlers);
            case HTTPMethod.PATCH:
                return router.patch(path, ...wrappedHandlers);
            case HTTPMethod.POST:
                return router.post(path, ...wrappedHandlers);
            case HTTPMethod.PUT:
                return router.put(path, ...wrappedHandlers);
            default:
                return router;
        }
    };
}
