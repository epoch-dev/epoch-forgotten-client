import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { SigninComponent } from './views/signin/SigninComponent';
import { GameComponent } from './views/game/GameComponent';

const router = createBrowserRouter([
    {
        path: '/',
        element: <SigninComponent />,
        // errorElement: <NotFoundComponent />, TODO
    },
    {
        path: 'game',
        element: <GameComponent />,
    },
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
