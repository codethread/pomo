import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Booter } from './Booter';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Booter />
  </StrictMode>
);
