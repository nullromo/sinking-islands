export enum PageRoutes {
    TITLE = '/',
    PLAY = '/play/:gameID',
    LOG_IN = '/log-in',
    CREATE_ACCOUNT = '/create-account',
    DASHBOARD = '/dashboard',
}

export const buildPlayRoute = (id: string) => {
    return PageRoutes.PLAY.replace(':gameID', id);
};
