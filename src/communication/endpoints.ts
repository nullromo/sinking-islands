import type { GameSerialized } from '../info/commonTypes';
import type { GameAction } from '../info/gameActionTypes';
import { GameOperations } from '../server/gameObjects/gameOperations';
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
        public readonly path = '/backend/user' as const;
        public readonly method = HTTPMethod.POST;
        public readonly urlParameters = {};
        public readonly queryParameters = {};
        public readonly requestBody: { username?: string; password?: string } =
            {};
        public readonly responseBody = DefaultTypes.message;
    }
    export const CreateUser = { instance: new CreateUserInfo() };

    class LogInInfo implements EndpointUtils.EndpointInfo {
        public readonly path = '/backend/session' as const;
        public readonly method = HTTPMethod.POST;
        public readonly urlParameters = {};
        public readonly queryParameters = {};
        public readonly requestBody: { username?: string; password?: string } =
            {};
        public readonly responseBody = DefaultTypes.message;
    }
    export const LogIn = { instance: new LogInInfo() };

    class LogOutInfo implements EndpointUtils.EndpointInfo {
        public readonly path = '/backend/session' as const;
        public readonly method = HTTPMethod.DELETE;
        public readonly urlParameters = {};
        public readonly queryParameters = {};
        public readonly requestBody = {};
        public readonly responseBody = DefaultTypes.message;
    }
    export const LogOut = { instance: new LogOutInfo() };

    class WhoAmIInfo implements EndpointUtils.EndpointInfo {
        public readonly path = '/backend/session' as const;
        public readonly method = HTTPMethod.GET;
        public readonly urlParameters = {};
        public readonly queryParameters = {};
        public readonly requestBody = {};
        public readonly responseBody: { username: string } = {
            username: DefaultTypes.string,
        };
    }
    export const WhoAmI = { instance: new WhoAmIInfo() };

    class CreateGameInfo implements EndpointUtils.EndpointInfo {
        public readonly path = '/backend/game' as const;
        public readonly method = HTTPMethod.POST;
        public readonly urlParameters = {};
        public readonly queryParameters = {};
        public readonly requestBody = {};
        public readonly responseBody = DefaultTypes.string;
    }
    export const CreateGame = { instance: new CreateGameInfo() };

    class GetGameListInfo implements EndpointUtils.EndpointInfo {
        public readonly path = '/backend/games' as const;
        public readonly method = HTTPMethod.GET;
        public readonly urlParameters = {};
        public readonly queryParameters = {};
        public readonly requestBody = {};
        public readonly responseBody: GameSerialized[] = [];
    }
    export const GetGameList = { instance: new GetGameListInfo() };

    class JoinGameInfo implements EndpointUtils.EndpointInfo {
        public readonly path = '/backend/game/:gameID' as const;
        public readonly method = HTTPMethod.POST;
        public readonly urlParameters: { gameID?: string } = {};
        public readonly queryParameters = {};
        public readonly requestBody = {};
        public readonly responseBody = DefaultTypes.message;
    }
    export const JoinGame = { instance: new JoinGameInfo() };

    class TakeGameActionInfo implements EndpointUtils.EndpointInfo {
        public readonly path = '/backend/game/:gameID/action' as const;
        public readonly method = HTTPMethod.POST;
        public readonly urlParameters: { gameID?: string } = {};
        public readonly queryParameters = {};
        public readonly requestBody: { gameAction?: GameAction } = {};
        public readonly responseBody: GameSerialized = GameOperations.create();
    }
    export const TakeGameAction = { instance: new TakeGameActionInfo() };
}
