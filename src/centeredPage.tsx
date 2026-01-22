export const CenteredPage = (props: React.PropsWithChildren) => {
    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                justifyContent: 'center',
            }}
        >
            {props.children}
        </div>
    );
};
