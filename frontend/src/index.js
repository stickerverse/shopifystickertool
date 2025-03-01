import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppProvider } from '@shopify/app-bridge-react';
import { BrowserRouter } from 'react-router-dom';  // Import BrowserRouter
import enTranslations from '@shopify/polaris/locales/en.json';
import {AppProvider as PolarisProvider} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Get the Shopify host parameter from the URL
const host = new URLSearchParams(window.location.search).get('host');

//Shopify App Bridge Configuration
const config = {
  apiKey: process.env.REACT_APP_SHOPIFY_API_KEY, // Use environment variable
  host: host,
  forceRedirect: true, // Important for embedded apps
};

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AppProvider config={config}>
              <PolarisProvider i18n={enTranslations}>
                <App />
              </PolarisProvider>
            </AppProvider>
        </BrowserRouter>
    </React.StrictMode>
);

reportWebVitals();