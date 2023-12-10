import React from 'react';
import ReactDOM from 'react-dom/client';
import { Providers } from './Providers';
import './index.css';
import { invoke } from '@tauri-apps/api';
import { getElectronBridgeOrMock } from './getElectronBridgeOrMock';

// now we can call our Command!
// Right-click the application background and open the developer tools.
// You will see "Hello, World!" printed in the console!
invoke('greet', { name: 'World' })
  // `invoke` returns a Promise
  .then((response) => {
    return console.log(response);
  })
  .catch(console.warn);

const bridge = getElectronBridgeOrMock();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers bridge={bridge} />
  </React.StrictMode>
);
