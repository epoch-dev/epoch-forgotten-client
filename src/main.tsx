import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import './common/styles/index.scss';
import { GameToastContainer } from './common/ui/toast';
import { AuthComponent } from './views/auth/AuthComponent';
import { GameComponent } from './views/game/GameComponent';

const router = createHashRouter([
    {
        path: 'game',
        element: <GameComponent />,
    },
    {
        path: '*',
        element: <AuthComponent />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
        <GameToastContainer />
    </React.StrictMode>,
);
