// Vite: React, Tailwind y un service worker que se genera al compilar para usar la app sin internet.
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

/** Escribe dist/sw.js con la lista de todos los archivos de la versión final. */
function serviceWorker(): Plugin {
  return {
    name: 'service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const archivos = ['./', ...Object.keys(bundle).map((f) => `./${f}`)];
      const version = createHash('sha256').update(archivos.join('\n')).digest('hex').slice(0, 12);
      const plantilla = readFileSync(new URL('./scripts/sw.js', import.meta.url), 'utf8');
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: plantilla.replace('__VERSION__', version).replace('__ARCHIVOS__', JSON.stringify(archivos)),
      });
    },
  };
}

export default defineConfig({
  // Rutas relativas: la carpeta dist funciona igual en la raíz de un dominio o dentro de una subcarpeta.
  base: './',
  plugins: [react(), tailwindcss(), serviceWorker()],
});
