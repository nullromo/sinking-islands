interface RulesPopupProps {
    readonly hide: () => void;
}

export const RulesPopup = (props: RulesPopupProps) => {
    return (
        <div
            style={{
                background: '#00000099',
                height: '100vh',
                left: 0,
                position: 'absolute',
                top: 0,
                width: '100vw',
                zIndex: 50,
            }}
            onClick={() => {
                props.hide();
            }}
        >
            <div
                style={{
                    background: 'yellow',
                    boxShadow: '0px 0px 10px 10px black',
                    height: '200px',
                    left: '50%',
                    position: 'relative',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                }}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                asdf
            </div>
        </div>
    );
};
