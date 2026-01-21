import React from 'react';

export const useResultMessage = () => {
    const [result, setResult] = React.useState<{
        success: boolean | null;
        message: string;
    }>({ message: '', success: null });

    const setResultFunction = (success: boolean | null, message: string) => {
        setResult({ message, success });
    };

    return [result, setResultFunction] as const;
};
