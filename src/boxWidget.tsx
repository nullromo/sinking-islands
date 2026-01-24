interface BoxWidgetProps
    extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {
    readonly title: string;
}

export const BoxWidget = (props: BoxWidgetProps) => {
    return (
        <div>
            {props.title}
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
