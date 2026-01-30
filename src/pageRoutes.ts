export enum PageRoutes {
    TITLE = '/',
    PLAY = '/play/:id',
    LOG_IN = '/log-in',
    CREATE_ACCOUNT = '/create-account',
    DASHBOARD = '/dashboard',
}

export const buildPlayRoute = (id: string) => {
    return PageRoutes.PLAY.replace(':id', id);
};
