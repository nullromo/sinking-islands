const scale = 1.3;
export const NetOverlay = (props: { readonly width: number }) => {
    return (
        <div
            style={{
                backgroundImage:
                    'linear-gradient(45deg, transparent 49%, saddlebrown 49%, saddlebrown 51%, transparent 51%), linear-gradient(-45deg, transparent 49%, saddlebrown 49%, saddlebrown 51%, transparent 51%)',
                backgroundSize: '30px 30px',
                border: '1px solid saddlebrown',
                borderRadius: '20%',
                height: props.width * scale,
                left: -(props.width * scale - props.width) / 2,
                position: 'absolute',
                top: -(props.width * scale - props.width) / 2,
                width: props.width * scale,
                zIndex: -10,
            }}
        />
    );
};
