import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { SinkingIslandsApp } from './sinkingIslandsApp';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
);
root.render(
    <React.StrictMode>
        <SinkingIslandsApp />
    </React.StrictMode>,
);
