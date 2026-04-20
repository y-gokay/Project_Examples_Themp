import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import { queryClient } from './lib/queryClient';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <App />
        <Toaster position="top-right" richColors closeButton />
      </div>
    </QueryClientProvider>
  </React.StrictMode>,
);
