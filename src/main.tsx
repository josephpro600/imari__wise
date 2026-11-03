import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { RouterProvider } from '@/lib/router';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <AuthProvider>
        <LanguageProvider>
          <FinanceProvider>
            <App />
          </FinanceProvider>
        </LanguageProvider>
      </AuthProvider>
    </RouterProvider>
  </StrictMode>
);
