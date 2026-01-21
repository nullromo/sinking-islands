import { useResultMessage } from './useResultMessage';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

export const CreateGameWidget = withServerCalls(
    (props: InjectedServerCallsProps) => {
        const [result, setResult] = useResultMessage();

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
                                .then((response) => {
                                    setResult(true, response.message);
                                })
                                .catch((error) => {
                                    setResult(false, error);
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
