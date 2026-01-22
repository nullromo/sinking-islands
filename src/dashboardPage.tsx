import { CreateGameWidget } from './createGame';
import { GetGamesWidget } from './getGames';

export const DashboardPage = () => {
    return (
        <div>
            <CreateGameWidget />
            <GetGamesWidget />
        </div>
    );
};
