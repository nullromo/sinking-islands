import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { AxiosError } from 'axios';
import type { EndpointUtils } from './endpointUtils';
import { HTTPMethod } from './endpointUtils';
import { HTTPResponseCodes } from './httpResponseCodes';
import type { MakeEmptyKeysOptional } from './util';
import { assertUnreachable } from './util';
import { TEST_BACKEND_PORT } from './ports';

const replaceURLWithParameters = (
    path: string,
    data: Record<string, unknown> = {},
    query: Record<string, unknown> = {},
) => {
    let url = path;
    const body: Record<string, unknown> = {};
    // Define regex patterns for number, boolean, and string
    const numberPattern = /^\d+$/; // matches non-negative integers
    const booleanPattern = /^(?:true|false)$/i; // matches true or false (case insensitive)
    const stringPattern = /^[^:]+$/; // matches strings that do not contain ':'
    Object.entries(data).forEach(([key, value]) => {
        const parameter = `:${key}`;
        // Determine the type of value and check against corresponding regex pattern
        const isValidType = (() => {
            const typeOfValue = typeof value;
            switch (typeOfValue) {
                case 'number':
                    return numberPattern.test(String(value));
                case 'boolean':
                    return booleanPattern.test(String(value));
                case 'string':
                    return stringPattern.test(String(value));
                case 'bigint':
                case 'symbol':
                case 'undefined':
                case 'object':
                case 'function':
                    return false;
                default:
                    return assertUnreachable(typeOfValue);
            }
        })();
        const pattern = new RegExp(`:${key}\\b`, 'g');
        if (url.includes(parameter) && isValidType) {
            url = url.replace(
                pattern,
                encodeURIComponent(value as boolean | number | string),
            );
        } else {
            body[key] = value;
        }
    });

    const queryString = Object.entries(query).reduce(
        (queryString: string, [key, value]) => {
            const thing = `${key}=${encodeURIComponent(
                value as boolean | number | string,
            )}`;

            if (queryString === '') {
                return thing;
            }
            return `${queryString}&${thing}`;
        },
        '',
    );

    if (queryString !== '') {
        url = `${url}?${queryString}`;
    }

    return {
        body: Object.entries(body).length === 1 ? Object.values(body)[0] : body,
        url,
    };
};

const simpleCaster = <T>(response: AxiosResponse<T>) => {
    return response.data;
};

const simpleLogger = (error: AxiosError<{ message: string } | undefined>) => {
    if (error.response) {
        if (error.response.data) {
            if (error.response.data.message) {
                console.error(
                    'Axios error message:',
                    error.response.data.message,
                );
                throw new Error(error.response.data.message);
            } else {
                console.error(error.response.data);
            }
        } else {
            console.error(error.response);
        }
    } else {
        console.error(error);
    }
    throw error;
};

export class ServerCallsCore {
    private readonly onUnauthorized: () => void;

    private readonly baseUrl: string;

    public constructor(
        test: boolean,
        onUnauthorized = () => {
            //
        },
    ) {
        this.onUnauthorized = onUnauthorized;
        this.baseUrl = test ? `http://localhost:${TEST_BACKEND_PORT}` : '';
    }

    private abortController: AbortController = new AbortController();

    public readonly abort = () => {
        this.abortController.abort();
        this.abortController = new AbortController();
    };

    public readonly doSend = async <T extends EndpointUtils.EndpointInfo, R>(
        method: HTTPMethod,
        path: string,
        data: MakeEmptyKeysOptional<{
            requestBody: T['requestBody'];
            queryParameters: T['queryParameters'];
            urlParameters: T['urlParameters'];
        }>,
        config: Omit<
            AxiosRequestConfig,
            'body' | 'cancelToken' | 'params' | 'url'
        > = {},
    ) => {
        // add headers if none are specified
        config.headers ??= {};
        // add content type header if not specified
        if (
            !config.headers['content-type'] &&
            !config.headers['Content-Type']
        ) {
            config.headers['content-type'] = 'application/json';
        }

        // remove all *'s from the endpoint
        const newPath = path.replace('*', '');

        const { url: tail } = replaceURLWithParameters(
            newPath,
            data.urlParameters,
        );

        const url = `${this.baseUrl}${tail}`;

        const body = data.requestBody;
        const params = data.queryParameters;

        const request = (async () => {
            switch (method) {
                case HTTPMethod.GET:
                    return axios.get<R>(url, {
                        data: body,
                        params,
                        signal: this.abortController.signal,
                        ...config,
                    });
                case HTTPMethod.POST:
                    return axios.post<R>(url, body, {
                        signal: this.abortController.signal,
                        ...config,
                    });
                case HTTPMethod.PUT:
                    return axios.put<R>(url, body, {
                        params,
                        signal: this.abortController.signal,
                        ...config,
                    });
                case HTTPMethod.PATCH:
                    return axios.patch<R>(url, body, {
                        signal: this.abortController.signal,
                        ...config,
                    });
                case HTTPMethod.DELETE:
                    return axios.delete<R>(url, {
                        data: body,
                        signal: this.abortController.signal,
                        ...config,
                    });
                default:
                    return assertUnreachable(method);
            }
        })();

        return request
            .catch((error: unknown) => {
                if (
                    error instanceof AxiosError &&
                    error.status === HTTPResponseCodes.UNAUTHORIZED
                ) {
                    // if any server call comes back with 401 UNAUTHORIZED,
                    // call the onUnauthorized callback. This is set up to
                    // notify the rest of the frontend that the user session is
                    // no longer valid
                    this.onUnauthorized();
                }
                throw error;
            })
            .then(simpleCaster)
            .catch(simpleLogger);
    };
}
