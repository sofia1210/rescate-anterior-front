/// <reference types="vite/client" />
/// <reference types="leaflet" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react-leaflet';
declare module 'leaflet';
