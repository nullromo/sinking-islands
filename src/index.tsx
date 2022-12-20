import React from 'react';
import ReactDOM from 'react-dom/client';
import { GamePage } from './gamePage';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
);
root.render(
    <React.StrictMode>
        <GamePage />
    </React.StrictMode>,
);
