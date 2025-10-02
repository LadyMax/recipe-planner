import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
  Navigate,
} from 'react-router-dom';
import '../sass/index.scss';
import routes from './routes.ts';
import App from './App.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/recipes" replace /> },
      ...(routes as RouteObject[]),
      {
        path: '/__ping',
        element: <div className="padding-16">OK /__ping</div>,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

console.log('routes = ', routes);
