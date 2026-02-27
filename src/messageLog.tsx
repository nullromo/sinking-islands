import * as React from 'react';
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
                boxSizing: 'border-box',
                height: '100%',
                maxHeight: '20vh',
                minWidth: '200px',
                overflowY: 'auto',
                padding: '4px',
                width: '100%',
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
