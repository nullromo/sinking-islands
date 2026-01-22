interface BoxWidgetProps extends React.PropsWithChildren {
    title: string;
}

export const BoxWidget = (props: BoxWidgetProps) => {
    return (
        <div>
            {props.title}
            <div
                style={{
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
