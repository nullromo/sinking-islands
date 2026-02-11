import * as React from 'react';
import { GameContext } from './gameContext';

export const GameIDBanner = (props: {
    readonly gameID: string;
    readonly status: { success: boolean | null; message: string };
}) => {
    const gameContext = React.use(GameContext);

    return (
        <>
            <div
                style={{
                    alignItems: 'flex-end',
                    background: 'lightgray',
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '10pt',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    zIndex: 100,
                }}
            >
                <div>{`You are ${gameContext.you}`}</div>
                <div
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        gap: '6px',
                    }}
                >
                    <div>Game ID</div>
                    <button
                        style={{ fontSize: '8pt' }}
                        type='button'
                        onClick={() => {
                            navigator.clipboard
                                .writeText(props.gameID)
                                .catch(console.error);
                        }}
                    >
                        Copy
                    </button>
                </div>
                <div>{props.gameID}</div>
            </div>
            <div
                style={{
                    alignItems: 'flex-end',
                    background: props.status.success ? 'lightgreen' : 'tomato',
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '10pt',
                    position: 'absolute',
                    right: '10px',
                    top: '70px',
                }}
            >
                {props.status.message}
            </div>
        </>
    );
};
