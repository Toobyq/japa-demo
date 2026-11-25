/* Japa Oneightwo — a arte do sistema: o "A" da marca, o caracol, os flashes, o mapa do corpo,
   os ícones, os sons (sintetizados, sem arquivos) e os efeitos (respingo de tinta, carimbo, cortina).
   Tudo em SVG/Canvas gerado aqui, para funcionar aberto direto do disco. */
'use strict';

/* ---------- o "A" (provisório, recriado em vetor até o Japa mandar o original) ---------- */
function logoSVG({ cls = '', anima = false, cor = 'currentColor', one = true } = {}) {
  const st = (d, i) => anima ? ` style="--atraso:${d}s;--dur:${i}s"` : '';
  return `<svg class="logo-a ${anima ? 'desenha' : ''} ${cls}" viewBox="0 0 200 210" fill="none" stroke="${cor}" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Japa Oneightwo">
    <path pathLength="1" stroke-width="11" d="M100 26 C 142 25, 176 58, 175 101 C 174 146, 140 178, 99 178 C 56 178, 24 145, 25 101 C 26 60, 57 28, 96 26"${st(0, 1.1)}/>
    <path pathLength="1" stroke-width="13" d="M34 196 L100 10 L166 196"${st(.85, .9)}/>
    <path pathLength="1" stroke-width="13" d="M8 136 L192 118"${st(1.55, .45)}/>
    ${one ? `<text x="101" y="163" text-anchor="middle" fill="${cor}" stroke="none" font-family="Marker, cursive" font-size="23" transform="rotate(-6 101 163)" class="logo-one"${anima ? ' style="animation:fadeIn .4s 2s both"' : ''}>one</text>` : ''}
  </svg>`;
}

/* ---------- o caracol (leva a casa nas costas = o estúdio que anda) ---------- */
function espiral(cx, cy, r0, r1, voltas, passo = 14) {
  let d = ''; const n = Math.round(voltas * 360 / passo);
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * voltas * Math.PI * 2 - Math.PI / 2, r = r0 + (r1 - r0) * t;
    d += (i ? ' L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
  }
  return d;
}
function caracolSVG({ cls = '', concha = 'var(--mag)', corpo = 'var(--acido)', traco = 'currentColor', anima = false } = {}) {
  return `<svg class="caracol ${cls}" viewBox="0 0 124 84" fill="none" stroke="${traco}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g class="${anima ? 'caracol-anda' : ''}">
      <path fill="${corpo}" d="M6 74 C 12 66, 26 66, 36 66 L 88 66 C 98 66, 101 58, 102 48 L 103 40 C 104 34, 112 34, 112 41 C 113 56, 110 72, 92 76 L 14 77 C 8 77, 5 76, 6 74 Z"/>
      <path class="antena" d="M104 38 L 98 16"/><circle cx="98" cy="14" r="3" fill="${traco}"/>
      <path class="antena" d="M110 39 L 116 19" style="animation-delay:.4s"/><circle cx="116" cy="17" r="3" fill="${traco}"/>
      <circle cx="58" cy="40" r="27" fill="${concha}"/>
      <path d="${espiral(58, 40, 2, 26, 2.6)}"/>
      <path d="M20 72 L 24 72 M 40 72 L 46 72" stroke-width="2" opacity=".6"/>
    </g>
  </svg>`;
}

/* ---------- flashes (desenhos prontos, traço de old school) ---------- */
const COR = { v: '#d9352a', a: '#f2c14e', g: '#3f8f5a', b: '#2a7fb0', p: '#f6ecd9', k: '#141114', m: '#e2458f', c: '#3cc6d6' };
const DESENHOS = {
  caracol: () => `<g transform="translate(-2 10) scale(.84)">${caracolSVG({ concha: COR.m, corpo: COR.a, traco: COR.k }).replace(/<\/?svg[^>]*>/g, '')}</g>
    <path d="M14 18 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3z" fill="${COR.a}"/><path d="M86 74 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2z" fill="${COR.c}"/>`,
  adaga: () => `<path d="M50 6 L58 54 L50 62 L42 54 Z" fill="#dfe6ea"/><path d="M50 10 L50 58" stroke-width="1.6"/>
    <path d="M28 60 Q50 53 72 60 L72 67 Q50 61 28 67 Z" fill="${COR.a}"/><path d="M45 66 L55 66 L56 86 L44 86 Z" fill="${COR.v}"/><path d="M45 72 L55 70 M45 78 L55 76" stroke-width="1.6"/>
    <circle cx="50" cy="91" r="5.5" fill="${COR.a}"/>
    <ellipse cx="33" cy="44" rx="9" ry="4" transform="rotate(-30 33 44)" fill="${COR.g}"/><ellipse cx="67" cy="30" rx="9" ry="4" transform="rotate(30 67 30)" fill="${COR.g}"/>
    <circle cx="50" cy="36" r="12" fill="${COR.v}"/><path d="${espiral(50, 36, 1.5, 10, 1.7, 20)}" stroke-width="2.2"/>`,
  coracao: () => `<path d="M42 30 Q37 16 50 5 Q47 17 56 21 Q61 13 58 8 Q71 22 58 32" fill="${COR.a}"/>
    <path d="M50 90 C 20 68, 10 46, 25 33 C 35 25, 46 29, 50 37 C 54 29, 65 25, 75 33 C 90 46, 80 68, 50 90 Z" fill="${COR.v}"/>
    <path d="M34 42 Q 32 36 38 34" stroke="#fff" stroke-width="3" opacity=".8"/>
    <path d="M10 56 L90 56 L85 65 L90 74 L10 74 L15 65 Z" fill="${COR.p}"/><text x="50" y="70" text-anchor="middle" font-family="Marker, cursive" font-size="13" fill="${COR.k}" stroke="none">LIVRE</text>`,
  olho: () => `<path d="M8 46 Q50 8 92 46 Q50 84 8 46 Z" fill="${COR.p}"/><circle cx="50" cy="46" r="17" fill="${COR.b}"/><circle cx="50" cy="46" r="7.5" fill="${COR.k}"/>
    <circle cx="44" cy="40" r="3.2" fill="#fff" stroke="none"/><path d="M20 30 L15 22 M34 20 L31 11 M50 16 L50 7 M66 20 L69 11 M80 30 L85 22"/>
    <path d="M50 72 Q 42 86 50 94 Q 58 86 50 72 Z" fill="${COR.c}"/>`,
  caveira: () => `<path d="M50 8 C 24 8, 15 30, 19 48 C 21 57, 28 59, 30 64 L 32 78 L 68 78 L 70 64 C 72 59, 79 57, 81 48 C 85 30, 76 8, 50 8 Z" fill="${COR.p}"/>
    <path d="M27 42 C 27 34, 44 34, 44 44 C 44 52, 27 52, 27 42 Z M56 44 C 56 34, 73 34, 73 42 C 73 52, 56 52, 56 44 Z" fill="${COR.k}"/>
    <path d="M50 52 L45 62 L55 62 Z" fill="${COR.k}"/><path d="M38 78 L38 70 M44 78 L44 70 M50 78 L50 70 M56 78 L56 70 M62 78 L62 70"/>
    <path d="M32 78 L36 92 L64 92 L68 78" fill="${COR.p}"/><path d="M42 84 L42 92 M50 84 L50 92 M58 84 L58 92" stroke-width="2"/>
    <circle cx="74" cy="16" r="9" fill="${COR.v}"/><path d="${espiral(74, 16, 1, 7.5, 1.6, 22)}" stroke-width="2"/><ellipse cx="86" cy="24" rx="7" ry="3" transform="rotate(35 86 24)" fill="${COR.g}"/>`,
  raio: () => `<path d="M60 4 L 26 54 L 47 54 L 36 96 L 76 40 L 55 40 L 68 4 Z" fill="${COR.a}"/><path d="M58 12 L 36 48" stroke="#fff" stroke-width="2.5" opacity=".7"/>
    <path d="M16 20 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z" fill="${COR.c}"/><path d="M84 66 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3z" fill="${COR.m}"/>`,
  lua: () => `<path d="M64 8 A 42 42 0 1 0 64 92 A 32 32 0 1 1 64 8 Z" fill="${COR.a}"/>
    <path d="M38 40 Q 44 45 50 40 M 40 64 Q 47 70 54 62" stroke-width="2.6"/><path d="M28 50 Q 34 56 30 60" stroke-width="2.4"/>
    <path d="M78 26 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3z" fill="#fff"/><circle cx="86" cy="60" r="3" fill="#fff"/><circle cx="74" cy="78" r="2" fill="#fff"/>`,
  pedras: () => `<path d="M8 92 Q 18 88 28 92 T 48 92 T 68 92 T 92 92" stroke="${COR.c}" stroke-width="2.6"/>
    <ellipse cx="50" cy="80" rx="30" ry="9" fill="#5b5f66"/><ellipse cx="48" cy="64" rx="23" ry="8" fill="#8a8e93"/><ellipse cx="53" cy="49" rx="17" ry="7" fill="#6b7076"/>
    <ellipse cx="49" cy="36" rx="12" ry="6" fill="#a3a7ab"/><ellipse cx="51" cy="25" rx="8" ry="4.5" fill="#777c82"/>
    <path d="M40 78 Q 46 76 52 78 M 42 62 Q 46 60 50 62" stroke-width="1.6" opacity=".6"/><path d="M76 16 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" fill="${COR.a}"/>`,
  onda: () => `<path d="M4 92 C 8 54, 40 18, 72 28 C 92 34, 92 62, 72 62 C 58 62, 56 46, 68 44 C 56 38, 36 52, 30 92 Z" fill="${COR.b}"/>
    <path d="M72 28 C 88 34 88 56 74 58" stroke="#fff" stroke-width="2.2"/><path d="M14 80 C 20 60 34 46 48 40 M 22 86 C 28 70 38 60 50 54" stroke="#fff" stroke-width="2" opacity=".75"/>
    <circle cx="62" cy="26" r="3.5" fill="#fff"/><circle cx="54" cy="25" r="3" fill="#fff"/><circle cx="47" cy="27" r="2.5" fill="#fff"/><circle cx="84" cy="70" r="11" fill="${COR.v}"/>
    <path d="M4 92 L96 92" stroke-width="3"/>`,
  cogumelo: () => `<path d="M38 54 L 62 54 Q 67 80 58 92 L 42 92 Q 33 80 38 54 Z" fill="${COR.p}"/>
    <path d="M10 56 C 10 20, 90 20, 90 56 Q 50 64 10 56 Z" fill="${COR.v}"/>
    <circle cx="30" cy="40" r="5" fill="#fff"/><circle cx="52" cy="32" r="6" fill="#fff"/><circle cx="72" cy="44" r="4.5" fill="#fff"/><circle cx="46" cy="48" r="3" fill="#fff"/>
    <path d="M20 92 L 24 82 M 28 92 L 27 84 M 72 92 L 76 82 M 80 92 L 79 84" stroke="${COR.g}" stroke-width="2.6"/>`,
  ancora: () => `<circle cx="50" cy="14" r="7" fill="none"/><path d="M50 21 L50 86 M32 32 L68 32" stroke-width="5"/>
    <path d="M16 60 Q 18 88 50 88 Q 82 88 84 60" stroke-width="5"/><path d="M10 66 L16 56 L23 65 M77 65 L84 56 L90 66" stroke-width="4"/>
    <path d="M24 44 Q 50 58 76 40 Q 60 52 46 46 Q 36 42 24 44 Z" fill="${COR.v}" stroke-width="2.4"/>`,
};
const NOMES_DESENHO = { caracol: 'Caracol nômade', adaga: 'Adaga e rosa', coracao: 'Coração livre', olho: 'Olho que chora', caveira: 'Caveira florida', raio: 'Raio', lua: 'Lua dormindo', pedras: 'Equilíbrio', onda: 'Onda', cogumelo: 'Cogumelo', ancora: 'Âncora' };
function flashSVG(desenho, cls = '') {
  const f = DESENHOS[desenho] || DESENHOS.caracol;
  return `<svg class="flash-svg ${cls}" viewBox="0 0 100 100" fill="none" stroke="${COR.k}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${f()}</svg>`;
}

/* ---------- mapa do corpo (boneco de desenho, frente e costas) ---------- */
// lado da pessoa: na frente, a direita dela fica à esquerda de quem olha; nas costas, o contrário.
function zonasCorpo(vista) {
  const L = vista === 'frente' ? 'd' : 'e', R = vista === 'frente' ? 'e' : 'd';
  const r = (id, x, y, w, h, rx) => ({ id, el: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>` });
  const e = (id, cx, cy, rx, ry) => ({ id, el: `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>` });
  const z = [e('cabeca', 100, 34, 22, 26), vista === 'frente' ? r('pescoco', 90, 61, 20, 13, 5) : r('nuca', 90, 61, 20, 13, 5),
    e('ombro-' + L, 62, 88, 16, 13), e('ombro-' + R, 138, 88, 16, 13),
    r('braco-' + L, 43, 103, 18, 58, 9), r('braco-' + R, 139, 103, 18, 58, 9),
    r('antebraco-' + L, 38, 165, 18, 62, 9), r('antebraco-' + R, 144, 165, 18, 62, 9),
    e('mao-' + L, 46, 242, 10, 14), e('mao-' + R, 154, 242, 10, 14),
    r('coxa-' + L, 76, 220, 22, 80, 11), r('coxa-' + R, 102, 220, 22, 80, 11),
    r('perna-' + L, 78, 304, 18, 76, 9), r('perna-' + R, 104, 304, 18, 76, 9),
    e('pe-' + L, 86, 394, 13, 8), e('pe-' + R, 114, 394, 13, 8), r('quadril', 74, 180, 52, 36, 12)];
  if (vista === 'frente') z.push(r('peito', 72, 76, 56, 50, 12), r('costela-d', 72, 129, 14, 48, 7), r('barriga', 88, 129, 24, 48, 9), r('costela-e', 114, 129, 14, 48, 7));
  else z.push(r('costas', 72, 76, 56, 62, 12), r('lombar', 72, 141, 56, 36, 10));
  return z;
}
function corpoSVG(vista = 'frente', { sel = [], tem = {}, ler = false } = {}) {
  const zs = zonasCorpo(vista);
  return `<svg class="corpo ${ler ? 'ler' : ''}" viewBox="0 0 200 410" data-vista="${vista}" role="group" aria-label="Corpo (${vista})">
    ${zs.map(z => z.el.replace('/>', ` class="zona ${sel.includes(z.id) ? 'sel' : ''} ${tem[z.id] ? 'tem' : ''}" data-zona="${z.id}" tabindex="${ler ? -1 : 0}" role="button" aria-label="${esc(ZONAS[z.id]?.nome || z.id)}"><title>${esc(ZONAS[z.id]?.nome || z.id)}</title></${z.el.startsWith('<rect') ? 'rect' : 'ellipse'}>`)).join('')}
    <text x="100" y="408" text-anchor="middle" font-family="Stencil, sans-serif" font-weight="800" font-size="11" letter-spacing="2" fill="currentColor" opacity=".55">${vista === 'frente' ? 'FRENTE' : 'COSTAS'}</text>
  </svg>`;
}
const vistaDaZona = id => ['costas', 'lombar', 'nuca'].includes(id) ? 'costas' : 'frente';

/* ---------- ícones (traço) ---------- */
const ICONES = {
  casa: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  rota: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
  lapis: '<path d="M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16z"/><path d="M14 7l3 3"/>',
  galera: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c2 .7 3.2 2.5 3.5 5.4"/>',
  raio: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  mochila: '<path d="M6 9a6 6 0 0 1 12 0v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M9 4.6V3h6v1.6M9 14h6M9 14v3"/>',
  grana: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  gota: '<path d="M12 3s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12z"/>',
  bancada: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  mais: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M4 12.5l5 5L20 6.5"/>',
  whats: '<path d="M4 20l1.3-4A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.3-2-1-1 .8c-1-.4-1.8-1.2-2.2-2.2l.8-1-1-2z"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>', volta: '<path d="M19 12H5M11 6l-6 6 6 6"/>', lixo: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  busca: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  lua: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>', som: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  mudo: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  copiar: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  carro: '<path d="M5 16H3v-4l2-5h14l2 5v4h-2"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/><path d="M9.5 16.5h5M3 12h18"/>',
  alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>', estrela: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4l-5.5 2.9 1-6.2L3 9.7l6.2-.9z"/>',
  baixar: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>', subir: '<path d="M12 16V5M7 10l5-5 5 5M4 20h16"/>', coracao: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', olho: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  tesoura: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.1 8.1L20 20M8.1 15.9L20 4"/>', agulha: '<path d="M4 20L15 9M14 4l6 6-3 3-6-6zM9 15l-2-2"/>',
  festa: '<path d="M4 20l5-14 9 9z"/><path d="M14 4l1 2M19 9l2-1M17 3l-1 3"/>', presente: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zm0 0s2-5 4.5-3.5S15 8 12 8z"/>',
  assinar: '<path d="M3 17c3-1 4-7 6-7s0 8 3 8 3-4 5-4 2 3 4 3"/><path d="M3 21h18"/>', comando: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
};
(function sprite() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('aria-hidden', 'true'); s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  s.innerHTML = Object.entries(ICONES).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('');
  (document.body || document.documentElement).prepend(s);
})();

/* ---------- sons (Web Audio, sem arquivos) ---------- */
const Som = {
  ctx: null,
  get ligado() { try { return localStorage.getItem('japa-som') !== '0'; } catch (e) { return true; } },
  set ligado(v) { try { localStorage.setItem('japa-som', v ? '1' : '0'); } catch (e) { } },
  ac() { if (!this.ligado) return null; try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; } catch (e) { return null; } },
  ruido(ac, dur) { const b = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = b; return s; },
  // a máquina de tatuagem: zumbido de bobina (dente de serra + modulação rápida)
  zumbido(dur = 1.2, vol = .06) {
    const ac = this.ac(); if (!ac) return; const t = ac.currentTime;
    const o = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain(), f = ac.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = 118; o2.type = 'square'; o2.frequency.value = 59; lfo.frequency.value = 31; lg.gain.value = .5;
    f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = .7;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .06); g.gain.setValueAtTime(vol, t + dur - .12); g.gain.linearRampToValueAtTime(0, t + dur);
    lfo.connect(lg); lg.connect(g.gain); o.connect(f); o2.connect(f); f.connect(g); g.connect(ac.destination);
    [o, o2, lfo].forEach(x => { x.start(t); x.stop(t + dur + .05); });
  },
  carimbo() {
    const ac = this.ac(); if (!ac) return; const t = ac.currentTime, n = this.ruido(ac, .25), f = ac.createBiquadFilter(), g = ac.createGain(), o = ac.createOscillator(), go = ac.createGain();
    f.type = 'lowpass'; f.frequency.value = 900; g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .22);
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + .18); go.gain.setValueAtTime(.45, t); go.gain.exponentialRampToValueAtTime(.001, t + .2);
    n.connect(f); f.connect(g); g.connect(ac.destination); o.connect(go); go.connect(ac.destination); n.start(t); o.start(t); o.stop(t + .25);
  },
  descolar() {
    const ac = this.ac(); if (!ac) return; const t = ac.currentTime, n = this.ruido(ac, .4), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(5000, t + .35);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.18, t + .05); g.gain.exponentialRampToValueAtTime(.001, t + .38);
    n.connect(f); f.connect(g); g.connect(ac.destination); n.start(t);
  },
  plim(nota = 0) {
    const ac = this.ac(); if (!ac) return; const t = ac.currentTime;
    [0, 4, 7].forEach((s, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = 523.25 * Math.pow(2, (s + nota) / 12);
      g.gain.setValueAtTime(0, t + i * .07); g.gain.linearRampToValueAtTime(.08, t + i * .07 + .01); g.gain.exponentialRampToValueAtTime(.001, t + i * .07 + .5);
      o.connect(g); g.connect(ac.destination); o.start(t + i * .07); o.stop(t + i * .07 + .55); });
  },
  toque() { const ac = this.ac(); if (!ac) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(440, t + .06);
    g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .08); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .1); },
};

/* ---------- efeitos ---------- */
const FX = {
  cv: null, c: null, gotas: [], manchas: [], rodando: false,
  prep() {
    if (this.cv) return true; this.cv = document.createElement('canvas'); this.cv.id = 'fx'; document.body.appendChild(this.cv); this.c = this.cv.getContext('2d');
    const r = () => { const k = devicePixelRatio || 1; this.cv.width = innerWidth * k; this.cv.height = innerHeight * k; this.c.setTransform(k, 0, 0, k, 0, 0); };
    r(); addEventListener('resize', r); return true;
  },
  // respingo de tinta: gotas voam, caem e viram manchas que somem
  respingo(x, y, cores = ['#ff3ea5', '#20d4ea', '#d4ff3b'], n = 26) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; this.prep();
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 7;
      this.gotas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, r: 1.5 + Math.random() * 4.5, cor: cores[i % cores.length], vida: 34 + Math.random() * 24 }); }
    this.manchas.push({ x, y, r: 10 + Math.random() * 8, cor: cores[0], a: .9, blobs: Array.from({ length: 7 }, () => [Math.random() * Math.PI * 2, .5 + Math.random() * .7]) });
    if (!this.rodando) { this.rodando = true; requestAnimationFrame(() => this.passo()); }
  },
  passo() {
    const c = this.c; c.clearRect(0, 0, innerWidth, innerHeight);
    for (const m of this.manchas) { c.globalAlpha = Math.max(m.a, 0); c.fillStyle = m.cor; c.beginPath(); c.arc(m.x, m.y, m.r, 0, 7); c.fill();
      for (const [ang, k] of m.blobs) { c.beginPath(); c.arc(m.x + Math.cos(ang) * m.r * 1.1, m.y + Math.sin(ang) * m.r * 1.1, m.r * k * .5, 0, 7); c.fill(); } m.a -= .02; }
    this.manchas = this.manchas.filter(m => m.a > 0);
    for (const g of this.gotas) { g.vy += .32; g.vx *= .98; g.x += g.vx; g.y += g.vy; g.vida--; c.globalAlpha = Math.min(1, g.vida / 20); c.fillStyle = g.cor;
      c.beginPath(); c.ellipse(g.x, g.y, g.r, g.r * (1 + Math.abs(g.vy) * .08), Math.atan2(g.vy, g.vx), 0, 7); c.fill(); }
    this.gotas = this.gotas.filter(g => g.vida > 0); c.globalAlpha = 1;
    if (this.gotas.length || this.manchas.length) requestAnimationFrame(() => this.passo()); else { this.rodando = false; c.clearRect(0, 0, innerWidth, innerHeight); }
  },
  carimbo(txt, sub = '', cor = 'var(--verm)') {
    const d = document.createElement('div'); d.className = 'carimbo'; d.style.setProperty('--cor', cor);
    d.innerHTML = `<b>${esc(txt)}${sub ? `<small>${esc(sub)}</small>` : ''}</b>`; document.body.appendChild(d);
    setTimeout(() => { Som.carimbo(); const m = document.querySelector('main, .app') || document.body; m.classList.remove('treme'); void m.offsetWidth; m.classList.add('treme'); }, 230);
    setTimeout(() => d.remove(), 1500);
  },
};
function toast(msg, icone = 'check') {
  let h = document.getElementById('toasts'); if (!h) { h = document.createElement('div'); h.id = 'toasts'; h.setAttribute('role', 'status'); document.body.appendChild(h); }
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = ic(icone) + `<span>${esc(msg)}</span>`; h.appendChild(t);
  setTimeout(() => { t.classList.add('sai'); setTimeout(() => t.remove(), 320); }, 2800);
}
