// Íconos propios en SVG. Heredan el color con currentColor salvo que se indique otro.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({ viewBox: '0 0 24 24', 'aria-hidden': true, ...props });

export const IconoFuego = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.5c1.2 4 5.5 5.6 5.5 11a5.5 5.5 0 0 1-11 0c0-3.2 1.9-4.6 2.2-7.6 1.2 1 2.1 2.2 2.6 3.4.6-2.2.9-4.4.7-6.8z" fill="var(--u3)" />
    <path d="M12 13c.6 1.6 2.4 2.3 2.4 4.4a2.4 2.4 0 0 1-4.8 0c0-1.4.8-2 1-3.2.5.4.9.9 1.1 1.4.3-.9.4-1.7.3-2.6z" fill="var(--amber)" />
  </svg>
);

export const IconoFuegoApagado = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.5c1.2 4 5.5 5.6 5.5 11a5.5 5.5 0 0 1-11 0c0-3.2 1.9-4.6 2.2-7.6 1.2 1 2.1 2.2 2.6 3.4.6-2.2.9-4.4.7-6.8z" fill="var(--line-deep)" />
  </svg>
);

export const IconoCorazon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 6.6a4.5 4.5 0 0 1 8 2.9c0 6.1-8 11-8 11z" fill="var(--bad)" />
  </svg>
);

export const IconoRayo = (p: P) => (
  <svg {...base(p)}>
    <path d="M13.5 2 4.5 13.5h6.5L10 22l9.5-12H13z" fill="var(--amber)" />
  </svg>
);

export const IconoCheck = (p: P) => (
  <svg {...base(p)} fill="none">
    <path d="M5.5 12.5l4 4 9-9" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconoCorona = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 17.5h17l1.2-10-5.4 4.2L12 5l-4.3 6.7-5.4-4.2z" fill="currentColor" />
  </svg>
);

export const IconoEstrella = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l2.7 5.9 6.3.6-4.8 4.2 1.4 6.3L12 16.8 6.4 20l1.4-6.3L3 9.5l6.3-.6z" fill="currentColor" />
  </svg>
);

export const IconoCandado = (p: P) => (
  <svg {...base(p)} fill="none">
    <rect x="5.5" y="11" width="13" height="9.5" rx="2.5" fill="currentColor" />
    <path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" stroke="currentColor" strokeWidth="2.4" />
  </svg>
);

export const IconoCofre = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 10.5h17v9h-17z" fill="currentColor" />
    <path d="M3.5 10.5a8.5 5.5 0 0 1 17 0z" fill="currentColor" opacity=".75" />
    <rect x="10.5" y="9.5" width="3" height="4.5" rx="1" fill="var(--surface)" />
  </svg>
);

export const IconoMaletin = (p: P) => (
  <svg {...base(p)} fill="none">
    <rect x="3" y="8" width="18" height="12" rx="2.5" fill="currentColor" />
    <path d="M9 8V6.2A1.2 1.2 0 0 1 10.2 5h3.6A1.2 1.2 0 0 1 15 6.2V8" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);

export const IconoTrofeo = (p: P) => (
  <svg {...base(p)} fill="none">
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" />
    <path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 4M17 6h2.5a2.5 2.5 0 0 1-2.5 4M12 14v4M8 20.5h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const IconoCerrar = (p: P) => (
  <svg {...base(p)} fill="none">
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

export const IconoLibro = (p: P) => (
  <svg {...base(p)} fill="none">
    <path d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v12.5H7.5A2.5 2.5 0 0 1 5 17z" fill="currentColor" />
    <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H18" stroke="var(--surface)" strokeWidth="1.6" />
  </svg>
);

export const IconoGema = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 4h12l3.5 5L12 21 2.5 9z" fill="var(--u1)" />
    <path d="M2.5 9h19M9 4l3 17 3-17" stroke="#fff" strokeOpacity=".5" strokeWidth="1.2" fill="none" />
  </svg>
);

export const IconoCamino = (p: P) => (
  <svg {...base(p)} fill="none">
    <circle cx="7" cy="5" r="2.6" fill="currentColor" />
    <circle cx="17" cy="12" r="2.6" fill="currentColor" />
    <circle cx="7" cy="19" r="2.6" fill="currentColor" />
    <path d="M9.3 6.2 14.8 10.6M14.8 13.4 9.3 17.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const IconoPracticar = (p: P) => (
  <svg {...base(p)} fill="none">
    <path d="M20 12a8 8 0 1 1-2.6-5.9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M18.5 3v4.5H14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconoPersona = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <path d="M4 20.5a8 8 0 0 1 16 0z" fill="currentColor" />
  </svg>
);

export const IconoTienda = (p: P) => (
  <svg {...base(p)} fill="none">
    <path d="M5 8h14l-1.2 12H6.2z" fill="currentColor" />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const IconoEscudo = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.5 20 5.5v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z" fill="var(--u4)" />
    <path d="M8.5 12l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconoReloj = (p: P) => (
  <svg {...base(p)} fill="none">
    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2.4" />
    <path d="M12 9v4.5l3 2M9.5 2.5h5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const IconoCamara = (p: P) => (
  <svg {...base(p)} fill="none">
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx="12" cy="12.5" r="3.4" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);

export const IconoLapiz = (p: P) => (
  <svg {...base(p)}>
    <path d="M15.6 3.6a2 2 0 0 1 2.8 0l2 2a2 2 0 0 1 0 2.8L9.2 19.6 4 20.5l.9-5.2z" fill="var(--amber)" />
    <path d="M4.9 15.3 4 20.5l5.2-.9z" fill="var(--nm-light, #edcda3)" />
    <path d="M14.2 5 19 9.8" stroke="var(--amber-deep)" strokeWidth="1.6" />
  </svg>
);
