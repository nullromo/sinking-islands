import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { GamePage } from './gamePage';
import { LogInGuard } from './logInGuard';
import { LoggedInUserContextProvider } from './loggedInUserContext';
import { PageRoutes } from './pageRoutes';
import { CreateAccountPage } from './pages/createAccountPage';
import { DashboardPage } from './pages/dashboardPage';
import { LogInPage } from './pages/logInPage';
import { TitlePage } from './pages/titlePage';
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
                    <Routes>
                        <Route
                            element={<DashboardPage />}
                            path={PageRoutes.DASHBOARD}
                        />
                        <Route element={<GamePage />} path={PageRoutes.PLAY} />
                        <Route
                            element={<TutorialPage />}
                            path={PageRoutes.TUTORIAL}
                        />
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
