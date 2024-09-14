import './common/styles/index.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthComponent } from './views/auth/AuthComponent';
import { GameComponent } from './views/game/GameComponent';
import { ToastContainer } from 'react-toastify';
import { BASE_PATH } from './common/services/AssetsService.ts';

const router = createBrowserRouter([
    {
        path: `${BASE_PATH}/game`,
        element: <GameComponent />,
    },
    {
        path: '*', // least specific, catches all not found routes, keep last
        element: <AuthComponent />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
        <ToastContainer />
    </React.StrictMode>,
);
