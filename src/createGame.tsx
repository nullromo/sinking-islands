import { BoxWidget } from './boxWidget';
import { useResultMessage } from './useResultMessage';
import type { InjectedServerCallsProps } from './withServerCalls';
import { withServerCalls } from './withServerCalls';

export const CreateGameWidget = withServerCalls(
    (props: InjectedServerCallsProps) => {
        const [result, setResult] = useResultMessage();

        return (
            <BoxWidget bigTitle={false} title='Create Game'>
                {result.success === null ? null : (
                    <span style={{ color: result.success ? 'green' : 'red' }}>
                        {result.message}
                    </span>
                )}
                <button
                    type='button'
                    onClick={() => {
                        setResult(null, '');
                        props.serverCalls
                            .createGame()
                            .then((response) => {
                                setResult(true, response.message);
                            })
                            .catch((error: unknown) => {
                                setResult(false, error);
                            });
                    }}
                >
                    Create New Game
                </button>
            </BoxWidget>
        );
    },
    'CreateGameWidget',
);
