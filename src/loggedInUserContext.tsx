import * as React from 'react';

type LoggedInUserContextData = {
    // undefined = uninitialized, null = not logged in
    loggedInUser: string | null | undefined;
    setLoggedInUser: React.Dispatch<
        React.SetStateAction<string | null | undefined>
    >;
};

export const LoggedInUserContext = React.createContext<LoggedInUserContextData>(
    {
        loggedInUser: undefined,
        setLoggedInUser: () => {
            throw new Error('Unmounted context');
        },
    },
);
LoggedInUserContext.displayName = 'LoggedInUserContext';

export const LoggedInUserContextProvider = (props: React.PropsWithChildren) => {
    // keep track of the logged in user
    const [loggedInUser, setLoggedInUser] = React.useState<
        string | null | undefined
    >(undefined);

    // provide the state value
    const value = React.useMemo(() => {
        return { loggedInUser, setLoggedInUser };
    }, [loggedInUser]);

    return (
        <LoggedInUserContext value={value}>
            {props.children}
        </LoggedInUserContext>
    );
};
