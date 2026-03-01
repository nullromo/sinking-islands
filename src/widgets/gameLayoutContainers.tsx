import * as React from 'react';

export const GameLayout = (props: React.PropsWithChildren) => {
    return <>{props.children}</>;
};

export const RightSidePanelLayout = (props: React.PropsWithChildren) => {
    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'flex-start',
            }}
        >
            {props.children}
        </div>
    );
};
