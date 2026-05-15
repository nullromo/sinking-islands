export interface LogoButtonProps {
    readonly title: string;
    readonly image: string;
    readonly background?: string;
    readonly href: string;
}

export const LogoButton = (
    props: LogoButtonProps & { readonly borderColor?: string },
) => {
    return (
        <a
            href={props.href}
            style={{ color: 'inherit', textDecoration: 'none' }}
        >
            <div
                style={{
                    alignItems: 'center',
                    background: props.background ?? 'black',
                    border: props.borderColor
                        ? `2px solid ${props.borderColor}`
                        : props.background
                          ? '2px solid black'
                          : '',
                    borderRadius: '10px',
                    color: 'white',
                    columnGap: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: '4px 10px',
                    width: 'fit-content',
                }}
            >
                <div
                    style={{
                        alignItems: 'center',
                        background: 'white',
                        borderRadius: '10px',
                        display: 'flex',
                        height: '38px',
                    }}
                >
                    <img
                        src={props.image}
                        style={{
                            borderRadius: '10px',
                            padding: '2px',
                            width: '34px',
                        }}
                    />
                </div>
                {props.title}
            </div>
        </a>
    );
};

export const LogoLink = (props: LogoButtonProps & React.PropsWithChildren) => {
    return (
        <div
            style={{
                alignItems: 'center',
                display: 'flex',
                marginBottom: '10px',
            }}
        >
            <div style={{ paddingRight: '10px' }}>
                <LogoButton
                    background={props.background}
                    href={props.href}
                    image={props.image}
                    title={props.title}
                />
            </div>
            {props.children}
        </div>
    );
};
