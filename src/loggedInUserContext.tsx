import React from 'react';

type LoggedInUserContextData = {
    loggedInUser: string | null;
    setLoggedInUser: React.Dispatch<React.SetStateAction<string | null>>;
};

export const LoggedInUserContext = React.createContext<LoggedInUserContextData>(
    {
        loggedInUser: null,
        setLoggedInUser: () => {
            throw new Error('Unmounted context');
        },
    },
);

export const LoggedInUserContextProvider = (props: React.PropsWithChildren) => {
    const [loggedInUser, setLoggedInUser] = React.useState<string | null>(null);
    const value = React.useMemo(() => {
        return { loggedInUser, setLoggedInUser };
    }, [loggedInUser]);
    return (
        <LoggedInUserContext.Provider value={value}>
            {props.children}
        </LoggedInUserContext.Provider>
    );
};

interface LogInGuardProps extends React.PropsWithChildren {
    alternativeChildren: React.ReactNode;
}

export const LogInGuard = (props: LogInGuardProps) => {
    const loggedInUserContext = React.useContext(LoggedInUserContext);
    return (
        <>
            {loggedInUserContext.loggedInUser === null
                ? props.alternativeChildren
                : props.children}
        </>
    );
};
