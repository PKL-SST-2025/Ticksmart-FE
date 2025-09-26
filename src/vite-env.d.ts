// src/vite-env.d.ts

/// <reference types="vite/client" />
/// <reference types="solid-js/jsx-runtime" /> 

interface ImportMetaEnv {
  // Add a read-only property for each environment variable you use.
  // It MUST start with VITE_.
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  
  // You can add other variables here as your project grows.
  // For example:
  // readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}