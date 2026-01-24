import type { HTMLAttributes } from 'react';

export const CenteredPage = (
    props: React.PropsWithChildren & HTMLAttributes<HTMLDivElement>,
) => {
    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                height: '100vh',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    ...props.style,
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {props.children}
            </div>
        </div>
    );
};
