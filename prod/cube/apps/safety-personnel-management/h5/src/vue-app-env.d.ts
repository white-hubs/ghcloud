/// <reference types="vite/client" />

declare const __ENV__: {
  baseApiUrl: string;
  authHeaders?: Record<string, string>;
  appUser?: unknown;
  applicationCode: string;
};
