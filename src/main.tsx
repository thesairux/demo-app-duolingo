// Solo el alfabeto latino de cada fuente: cubre el español (á, ñ, ¿, ¡, §) y pesa mucho menos.
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ProveedorJuego } from './hooks/useJuego';
import { escucharInstalacion } from './lib/instalar';

escucharInstalacion();

// Siempre en modo oscuro. index.html ya lo trae, pero se repite por si la página se carga sin ese <html>.
document.documentElement.dataset.theme = 'dark';

// El service worker guarda la app para usarla sin internet. Solo en la versión final: en desarrollo estorbaría a la recarga en caliente.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Sin service worker la app sigue funcionando, solo que necesita internet para abrir.
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProveedorJuego>
      <App />
    </ProveedorJuego>
  </StrictMode>,
);
