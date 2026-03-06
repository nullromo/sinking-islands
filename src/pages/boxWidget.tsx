interface BoxWidgetProps
    extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {
    readonly title: string;
    readonly bigTitle: boolean;
}

export const BoxWidget = (props: BoxWidgetProps) => {
    return (
        <div>
            {props.bigTitle ? (
                <h2 style={{ marginTop: 0 }}>{props.title}</h2>
            ) : (
                <div>{props.title}</div>
            )}
            <div
                style={{
                    ...props.style,
                    border: '1px solid',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px',
                    rowGap: '10px',
                    width: 'fit-content',
                }}
            >
                {props.children}
            </div>
        </div>
    );
};
