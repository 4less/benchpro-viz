import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DataProvider } from './DataContext.tsx';

// Only create root once, if root is already initialized, don't create a new one
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);  // Create the root only once
  root.render(
    <StrictMode>
      <DataProvider>   {/* Ensure DataProvider wraps the whole app */}
        <App />
      </DataProvider>
    </StrictMode>
  );
}