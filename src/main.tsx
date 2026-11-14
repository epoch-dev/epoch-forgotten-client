import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createHashRouter, type RouteObject } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './common/styles/index.scss';
import { AuthComponent } from './views/auth/AuthComponent';
import { GameComponent } from './views/game/GameComponent';


const routerRoutes: RouteObject[] = [
    {
        path: 'game',
        element: <GameComponent />,
    },
];

if (import.meta.env.DEV) {
    routerRoutes.unshift({
        path: 'content-lab',
        lazy: async () => {
            const module = await import('./views/content-lab/ContentLabRoute');
            return { Component: module.default };
        },
    });
}

routerRoutes.push({
    path: '*',
    element: <AuthComponent />,
});

const router = createHashRouter(routerRoutes);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
        <ToastContainer />
    </React.StrictMode>,
);
