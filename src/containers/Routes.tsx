import { Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader } from 'impact-ui';

const ExplainabilityScreen = lazy(
  () => import('../components/screens/explainability')
);

export const AppRoutes = (
  <>
    <Route
      path="/markdown-workbench/strategy-detail"
      element={
        <Suspense fallback={<Loader />}>
          <ExplainabilityScreen />
        </Suspense>
      }
    />
    <Route
      path="/markdown-workbench"
      element={
        <Suspense fallback={<Loader />}>
          <ExplainabilityScreen />
        </Suspense>
      }
    />
    <Route
      path="/decision-dashboard"
      element={
        <Suspense fallback={<Loader />}>
          <div style={{ padding: '24px' }}>
            <h2>Decision Dashboard</h2>
            <p>Coming soon...</p>
          </div>
        </Suspense>
      }
    />
  </>
);
