import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { CreateAccountPage } from './createAccountPage';
import { DashboardPage } from './dashboardPage';
import { GamePage } from './gamePage';
import { LogInGuard } from './logInGuard';
import { LogInPage } from './logInPage';
import { LoggedInUserContextProvider } from './loggedInUserContext';
import { PageRoutes } from './pageRoutes';
import { TitlePage } from './pages/titlePage';

export const SinkingIslandsApp = () => {
    return (
        <BrowserRouter>
            <LoggedInUserContextProvider>
                <LogInGuard
                    alternativeChildren={
                        <Routes>
                            <Route
                                element={<CreateAccountPage />}
                                path={PageRoutes.CREATE_ACCOUNT}
                            />
                            <Route
                                element={<LogInPage />}
                                path={PageRoutes.LOG_IN}
                            />
                            <Route
                                element={<TitlePage />}
                                path={PageRoutes.TITLE}
                            />
                            <Route
                                element={<Navigate to={PageRoutes.TITLE} />}
                                path='/*'
                            />
                        </Routes>
                    }
                >
                    <Routes>
                        <Route
                            element={<DashboardPage />}
                            path={PageRoutes.DASHBOARD}
                        />
                        <Route element={<GamePage />} path={PageRoutes.GAME} />
                        <Route
                            element={<Navigate to={PageRoutes.DASHBOARD} />}
                            path='/*'
                        />
                    </Routes>
                </LogInGuard>
            </LoggedInUserContextProvider>
        </BrowserRouter>
    );
};
