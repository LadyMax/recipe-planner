import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
  Navigate,
  useRouteError,
} from 'react-router-dom';
import '../sass/index.scss';
import routes from './routes.ts';
import App from './App.tsx';

function RouteError() {
  const err = useRouteError() as any;
  console.error('RouteError:', err);
  return (
    <div
      style={{
        padding: 16,
        background: '#fee',
        color: '#900',
        border: '1px solid #f99',
      }}
    >
      <h3>Route error</h3>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {err?.message || String(err)}
      </pre>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/recipes" replace /> },
      ...(routes as RouteObject[]),
      {
        path: '/__ping',
        element: <div style={{ padding: 16 }}>OK /__ping</div>,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// 开发阶段禁用 SW，避免缓存干扰（生产再开）
// if (import.meta.env.PROD && 'serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').catch(console.error);
//   });
// }

console.log('routes = ', routes);
