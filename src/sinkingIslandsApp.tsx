import { BrowserRouter, Route, Routes } from 'react-router';
import { CreateAccountPage } from './createAccountPage';
import { DashboardPage } from './dashboardPage';
import { GamePage } from './gamePage';
import { LogInPage } from './logInPage';
import { PageRoutes } from './pageRoutes';
import { TitlePage } from './pages/titlePage';
import { LogOutWidget } from './logOutWidget';

export const SinkingIslandsApp = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    element={<CreateAccountPage />}
                    path={PageRoutes.CREATE_ACCOUNT}
                />
                <Route element={<LogInPage />} path={PageRoutes.LOG_IN} />
                <Route
                    element={<DashboardPage />}
                    path={PageRoutes.DASHBOARD}
                />
                <Route element={<GamePage />} path={PageRoutes.GAME} />
                <Route element={<TitlePage />} path={PageRoutes.TITLE} />
            </Routes>
            <LogOutWidget />
        </BrowserRouter>
    );
};
