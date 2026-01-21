import React from 'react';

export const useResultMessage = () => {
    const [result, setResult] = React.useState<{
        success: boolean | null;
        message: string;
    }>({ message: '', success: null });

    const setResultFunction = (success: boolean | null, value: unknown) => {
        setResult({
            message:
                typeof value === 'string'
                    ? value
                    : value instanceof Error
                      ? value.message
                      : `${value}`,
            success,
        });
    };

    return [result, setResultFunction] as const;
};
