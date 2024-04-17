import './common/styles/index.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthComponent } from './views/auth/AuthComponent';
import { GameComponent } from './views/game/GameComponent';
import { ToastContainer } from 'react-toastify';

const router = createBrowserRouter([
    {
        path: 'game',
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
