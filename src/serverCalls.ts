import type { AxiosRequestConfig } from 'axios';
import type { EndpointUtils } from './endpointUtils';
import { Endpoints } from './endpoints';
import { ServerCallsCore } from './serverCallsCore';
import type { MakeEmptyKeysOptional } from './util';

type SendData<T extends EndpointUtils.EndpointInfo> = MakeEmptyKeysOptional<{
    requestBody: T['requestBody'];
    queryParameters: T['queryParameters'];
    urlParameters: T['urlParameters'];
}>;

type SendConfig = Omit<
    AxiosRequestConfig,
    'body' | 'cancelToken' | 'params' | 'url'
>;

export class ServerCalls {
    private readonly serverCallsCore = new ServerCallsCore();

    public readonly abort = () => {
        this.serverCallsCore.abort();
    };

    private readonly send = async <T extends EndpointUtils.EndpointInfo>(
        endpointConstructor: EndpointUtils.EndpointConstructor<T>,
        data: SendData<T>,
        config: SendConfig = {},
    ) => {
        return this.serverCallsCore.doSend<T, T['responseBody']>(
            endpointConstructor.instance.method,
            endpointConstructor.instance.path,
            data,
            config,
        );
    };

    public readonly createUser = async (username: string, password: string) => {
        return this.send(Endpoints.CreateUser, {
            requestBody: { password, username },
        });
    };

    public readonly logIn = async (username: string, password: string) => {
        return this.send(Endpoints.LogIn, {
            requestBody: { password, username },
        });
    };

    public readonly createGame = async () => {
        return this.send(Endpoints.CreateGame, {});
    };
}
