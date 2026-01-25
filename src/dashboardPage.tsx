import { CreateGameWidget } from './createGame';
import { GetGamesWidget } from './gameList';

export const DashboardPage = () => {
    return (
        <div>
            <CreateGameWidget />
            <GetGamesWidget />
        </div>
    );
};
