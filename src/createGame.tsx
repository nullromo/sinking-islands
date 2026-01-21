import React from 'react';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

export const CreateGameWidget = withServerCalls(
    (props: InjectedServerCallsProps) => {
        const [result, setResult] = React.useState<{
            success: boolean | null;
            message: string;
        }>({ message: '', success: null });

        return (
            <div>
                Create Game
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
                    {result.success === null ? null : (
                        <span
                            style={{ color: result.success ? 'green' : 'red' }}
                        >
                            {result.message}
                        </span>
                    )}
                    <button
                        type='button'
                        onClick={() => {
                            props.serverCalls
                                .createGame()
                                .then((result) => {
                                    setResult({
                                        message: result.message,
                                        success: true,
                                    });
                                })
                                .catch((error) => {
                                    if (error instanceof Error) {
                                        setResult({
                                            message: error.message,
                                            success: false,
                                        });
                                    } else {
                                        setResult({
                                            message: `${error}`,
                                            success: false,
                                        });
                                    }
                                });
                        }}
                    >
                        Create New Game
                    </button>
                </div>
            </div>
        );
    },
    'CreateGameWidget',
);
