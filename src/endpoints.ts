import type { EndpointUtils } from './endpointUtils';
import { HTTPMethod } from './endpointUtils';

const DefaultTypes = {
    boolean: true,
    message: { message: '' },
    number: 0,
    string: '',
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Endpoints {
    class CreateUserInfo implements EndpointUtils.EndpointInfo {
        public readonly path = '/user' as const;

        public readonly method = HTTPMethod.POST;

        public readonly urlParameters = {};

        public readonly queryParameters = {};

        public readonly requestBody: { username?: string; password?: string } =
            {};

        public readonly responseBody = DefaultTypes.message;
    }

    export const CreateUser = { instance: new CreateUserInfo() };
}
