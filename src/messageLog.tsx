import * as React from 'react';
import { GameContext } from './gameContext';

export const MessageLog = () => {
    const gameContext = React.use(GameContext);

    const messageLogRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        messageLogRef.current?.scrollIntoView();
    });

    return (
        <div
            style={{
                background: 'linear-gradient(180deg, darkgray 0%, white 100%)',
                border: '1px solid',
                boxSizing: 'border-box',
                marginBottom: '20px',
                maxHeight: '300px',
                minWidth: '200px',
                overflowY: 'auto',
                padding: '4px',
                width: '100%',
            }}
        >
            <div style={{ position: 'sticky', top: '-10px', width: '100%' }} />
            {gameContext.game.messages.map((message, index) => {
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
