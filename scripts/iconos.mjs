// Genera los íconos de la app (public/) a partir del dibujo de Numi. Uso: node scripts/iconos.mjs
// Necesita Playwright con Chromium para pasar el SVG a PNG.
import { writeFileSync } from 'node:fs';

const FONDO = '#8656d6';

const numi = `<ellipse cx="152" cy="196" rx="31" ry="13" transform="rotate(-28 152 196)" fill="#5b381d"/><path d="M134 196 L166 186 M138 206 L172 194" stroke="#000" stroke-opacity=".18" stroke-width="2" fill="none"/><circle cx="53" cy="77" r="11" fill="#9c6236"/><circle cx="53" cy="77" r="5.5" fill="#7a4826"/><circle cx="147" cy="77" r="11" fill="#9c6236"/><circle cx="147" cy="77" r="5.5" fill="#7a4826"/><ellipse cx="100" cy="160" rx="56" ry="52" fill="#9c6236"/><ellipse cx="100" cy="170" rx="34" ry="34" fill="#edcda3"/><ellipse cx="78" cy="210" rx="17" ry="8" fill="#7a4826"/><ellipse cx="122" cy="210" rx="17" ry="8" fill="#7a4826"/><circle cx="100" cy="92" r="48" fill="#9c6236"/><path d="M62 66 Q62 50 100 48 Q138 50 138 66 Q100 75 62 66 Z" fill="#d69200"/><path d="M100 20 L166 41 L100 62 L34 41 Z" fill="#f5b400"/><path d="M34 41 L100 62 L166 41" fill="none" stroke="#d69200" stroke-width="3" stroke-linejoin="round"/><path d="M100 41 Q138 46 154 46 V72" fill="none" stroke="#d69200" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="41" r="4.5" fill="#d69200"/><path d="M149 70 H159 L161 86 Q154 89 147 86 Z" fill="#d69200"/><circle cx="71" cy="107" r="7.5" fill="#e8968a" opacity=".55"/><circle cx="129" cy="107" r="7.5" fill="#e8968a" opacity=".55"/><ellipse cx="100" cy="111" rx="24" ry="16" fill="#edcda3"/><ellipse cx="82" cy="88" rx="5.9" ry="7.1" fill="#3a2416"/><circle cx="84" cy="85" r="2.2" fill="#fff"/><ellipse cx="118" cy="88" rx="5.9" ry="7.1" fill="#3a2416"/><circle cx="120" cy="85" r="2.2" fill="#fff"/><ellipse cx="100" cy="101" rx="8" ry="5.5" fill="#3a2416"/><path d="M86 108 Q93 114 100 107 Q107 114 114 108" fill="none" stroke="#3a2416" stroke-width="3" stroke-linecap="round"/><rect x="94" y="108" width="6" height="10" rx="1.5" fill="#fff" stroke="#3a2416" stroke-width="1.2"/><rect x="100" y="108" width="6" height="10" rx="1.5" fill="#fff" stroke="#3a2416" stroke-width="1.2"/><g transform="rotate(-9 66 162)"><rect x="46" y="138" width="40" height="48" rx="4" fill="#2c5aa6"/><rect x="46" y="138" width="6" height="48" rx="2" fill="#000" fill-opacity=".2"/><text x="64" y="160" text-anchor="middle" style="font-family: Fredoka, Nunito, sans-serif; font-weight: 700; font-size: 13px; fill: #fff;">123</text><text x="64" y="176" text-anchor="middle" style="font-family: Fredoka, Nunito, sans-serif; font-weight: 700; font-size: 13px; fill: #fff;">+÷</text></g><ellipse cx="86" cy="160" rx="10" ry="18" transform="rotate(28 86 160)" fill="#9c6236"/><ellipse cx="148" cy="152" rx="11" ry="20" transform="rotate(18 148 152)" fill="#9c6236"/>`;

/** Numi centrada en un cuadrado de 512, con la escala indicada. */
function icono({ escala, redondeado }) {
  const x = (512 - 200 * escala) / 2;
  const y = (512 - 220 * escala) / 2 + 6 * escala;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512"${redondeado ? ' rx="112"' : ''} fill="${FONDO}"/><g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${escala})">${numi}</g></svg>`;
}

const normal = icono({ escala: 1.8, redondeado: true });
writeFileSync('public/icono.svg', normal);

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const pagina = await navegador.newPage();
async function png(svg, tam, archivo, transparente) {
  await pagina.setViewportSize({ width: tam, height: tam });
  await pagina.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${tam}" height="${tam}" `)}</body></html>`);
  await pagina.screenshot({ path: `public/${archivo}`, omitBackground: transparente });
}
await png(normal, 512, 'icono-512.png', true);
await png(normal, 192, 'icono-192.png', true);
// Ícono adaptable (Android lo recorta en círculo) y el de iPhone (iOS redondea solo): fondo completo y Numi más chica.
await png(icono({ escala: 1.45, redondeado: false }), 512, 'icono-adaptable-512.png', false);
await png(icono({ escala: 1.6, redondeado: false }), 180, 'apple-touch-icon.png', false);
await navegador.close();
console.log('Íconos listos en public/');
