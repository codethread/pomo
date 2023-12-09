import React from 'react';
import ReactDOM from 'react-dom/client';
import { IBridge } from '@shared/types';
import { Providers } from './Providers';
import './index.css';
import { invoke } from '@tauri-apps/api';
import { ok } from '@shared/Result';

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

function getElectronBridgeOrMock(): IBridge {
  if (window.bridge) return window.bridge;

  return {
    openExternal: async (url) => {
      window.open(url);
      return Promise.resolve();
    },
    windowFocus() {
      throw new Error('Method not implemented.');
    },
    setTrayIcon() {
      throw new Error('Method not implemented.');
    },
    setTrayTitle() {
      throw new Error('Method not implemented.');
    },
    storeRead() {
      throw new Error('Method not implemented.');
    },
    storeUpdate(value) {
      throw new Error('Method not implemented.');
    },
    storeReset() {
      throw new Error('Method not implemented.');
    },
    slackSetProfile(auth, status) {
      throw new Error('Method not implemented.');
    },
    slackSetSnooze(auth, minutes) {
      throw new Error('Method not implemented.');
    },
    slackEndSnooze(auth) {
      throw new Error('Method not implemented.');
    },
    slackSetPresence(auth, state) {
      throw new Error('Method not implemented.');
    },
    info(...args) {
      console.log(...args);
    },
    warn() {
      console.warn(...args);
    },
    error(err) {
      console.error(err);
    },
    nodenv() {
      throw new Error('Method not implemented.');
    },
    isProd() {
      throw new Error('Method not implemented.');
    },
    isTest() {
      throw new Error('Method not implemented.');
    },
    async isDev() {
      return ok(true);
    },
    async isIntegration() {
      return true;
    },
  };
}
