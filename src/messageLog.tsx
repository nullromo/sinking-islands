import React from 'react';
import type { GameSerialized } from './commonTypes';

export const MessageLog = (props: { readonly gameState: GameSerialized }) => {
    const messageLogRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        messageLogRef.current?.scrollIntoView();
    });

    return (
        <div
            style={{
                border: '1px solid',
                height: '100%',
                maxHeight: '80vh',
                minWidth: '200px',
                overflowY: 'auto',
                padding: '4px',
            }}
        >
            <div
                style={{
                    background:
                        'linear-gradient(180deg, #00000044 0%, #FFFFFF00 100%)',
                    height: '80vh',
                    position: 'sticky',
                    top: '-10px',
                    width: '100%',
                }}
            />
            {props.gameState.messages.map((message, index) => {
                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <React.Fragment key={index}>
                        <div>{message}</div>
                        <hr />
                    </React.Fragment>
                );
            })}
            <div ref={messageLogRef} />
        </div>
    );
};
