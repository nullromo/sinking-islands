import * as React from 'react';

export interface SetResultProps {
    readonly setResult: (success: boolean | null, value: unknown) => void;
}

export const useResultMessage = () => {
    const [result, setResult] = React.useState<{
        success: boolean | null;
        message: string;
    }>({ message: '', success: null });

    const setResultFunction = React.useCallback(
        (success: boolean | null, value: unknown) => {
            setResult({
                message:
                    typeof value === 'string'
                        ? value
                        : value instanceof Error
                          ? value.message
                          : `${value}`,
                success,
            });
        },
        [setResult],
    );

    return [result, setResultFunction] as const;
};
