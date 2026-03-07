import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { CoordinatesContextProvider } from './contexts/coordinatesContext';
import { LoggedInUserContextProvider } from './contexts/loggedInUserContext';
import { DashboardPage } from './pages/dashboard/dashboardPage';
import { GamePage } from './pages/game/gamePage';
import { CreateAccountPage } from './pages/logInOrCreateAccount/createAccountPage';
import { LogInPage } from './pages/logInOrCreateAccount/logInPage';
import { TitlePage } from './pages/titlePage';
import { LogInGuard } from './router/logInGuard';
import { PageRoutes } from './router/pageRoutes';
import { TutorialPage } from './tutorial/tutorialPage';

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
                    <CoordinatesContextProvider>
                        <Routes>
                            <Route
                                element={<DashboardPage />}
                                path={PageRoutes.DASHBOARD}
                            />
                            <Route
                                element={<GamePage />}
                                path={PageRoutes.PLAY}
                            />
                            <Route
                                element={<TutorialPage />}
                                path={PageRoutes.TUTORIAL}
                            />
                            <Route
                                element={<Navigate to={PageRoutes.DASHBOARD} />}
                                path='/*'
                            />
                        </Routes>
                    </CoordinatesContextProvider>
                </LogInGuard>
            </LoggedInUserContextProvider>
        </BrowserRouter>
    );
};
