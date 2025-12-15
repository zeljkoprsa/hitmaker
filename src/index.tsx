// src/index.tsx
import { PostHogProvider } from 'posthog-js/react';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { MetronomeProvider } from '@features/Metronome/context/MetronomeProvider';

import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={process.env.REACT_APP_POSTHOG_KEY || ''}
      options={{
        api_host: process.env.REACT_APP_POSTHOG_HOST || 'https://eu.i.posthog.com',
        capture_exceptions: true,
        debug: process.env.NODE_ENV === 'development',
      }}
    >
      <App />
    </PostHogProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

reportWebVitals();
