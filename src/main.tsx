import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import 'impact-ui/styles';
import './styles/layout.css';
import App from './App';

// Impact UI Table requires AG Grid community + enterprise modules.
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
