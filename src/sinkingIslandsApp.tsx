import { BrowserRouter, Route, Routes } from 'react-router';
import { GamePage } from './gamePage';
import { TitlePage } from './pages/titlePage';
import { PageRoutes } from './pageRoutes';
import { LogInPage } from './logInPage';
import { CreateAccountPage } from './createAccountPage';

export const SinkingIslandsApp = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    element={<CreateAccountPage />}
                    path={PageRoutes.CREATE_ACCOUNT}
                />
                <Route element={<LogInPage />} path={PageRoutes.LOG_IN} />
                <Route element={<GamePage />} path={PageRoutes.GAME} />
                <Route element={<TitlePage />} path='/' />
            </Routes>
        </BrowserRouter>
    );
};
