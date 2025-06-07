// src/index.tsx
import { PostHogProvider } from 'posthog-js/react';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { MetronomeProvider } from '@features/Metronome/context/MetronomeProvider';

import App from './App';
import reportWebVitals from './reportWebVitals';

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
      <MetronomeProvider>
        <App />
      </MetronomeProvider>
    </PostHogProvider>
  </React.StrictMode>
);

reportWebVitals();
