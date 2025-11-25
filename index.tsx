import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Using a public manifest for demo purposes. In production, this should host on the app's domain.
const MANIFEST_URL = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';

root.render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);