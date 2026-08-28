import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './containers/Layout';
import { AppRoutes } from './containers/Routes';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {AppRoutes}
        <Route
          path="*"
          element={<Navigate to="/markdown-workbench/strategy-detail" replace />}
        />
      </Route>
    </Routes>
  );
}
