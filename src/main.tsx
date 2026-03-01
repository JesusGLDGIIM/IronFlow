import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SimpleAuth } from './components/Auth/SimpleAuth';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimpleAuth>
      <App />
    </SimpleAuth>
  </StrictMode>,
);
