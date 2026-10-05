// Utilidades de tempo, curvas e cores. Tudo em segundos do relógio final (F) e 30 fps.
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const f = (s: number) => Math.round(s * FPS);

export const C = {
  fundo: '#15110E',
  papel: '#EDE6DA',
  papelFita: '#E6DCC8',
  tinta: '#241A15',
  vermelho: '#83251A',
  terracota: '#B5532A',
  apagado: '#A2836C', // palavra já dita na legenda cinética
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// "Chega rápido, pousa suave" (LICOES §2): fração k da distância restante por quadro.
export const approach = (frame: number, start: number, from: number, to: number, k = 0.15) => {
  const n = Math.max(0, frame - start);
  return to - (to - from) * Math.pow(1 - k, n);
};
// progresso 0→1 com a mesma física
export const arrive = (frame: number, start: number, k = 0.15) =>
  frame < start ? 0 : 1 - Math.pow(1 - k, frame - start);

// cubic-bezier (curvas nomeadas do DESIGN-SYSTEM §5.2)
const bez = (x1: number, y1: number, x2: number, y2: number) => (t: number) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3 - t;
    const dx = 3 * (1 - u) ** 2 * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u ** 2 * (1 - x2);
    if (Math.abs(dx) < 1e-6) break;
    u = clamp(u - x / dx);
  }
  return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3;
};
export const E = {
  produtiva: bez(0.2, 0, 0.38, 0.9),
  expressiva: bez(0.4, 0.14, 0.3, 1),
  entrada: bez(0, 0, 0.3, 1),
  saida: bez(0.4, 0.14, 1, 1),
  camera: bez(0.45, 0, 0.55, 1),
};

// interpola com curva entre dois instantes (em quadros)
export const tween = (
  frame: number, a: number, b: number, from: number, to: number, ease: (t: number) => number = E.expressiva,
) => from + (to - from) * ease(clamp((frame - a) / (b - a)));

// Spline monotônica (Fritsch-Carlson): passa pelos pontos sem ultrapassar, velocidade contínua.
export const monotone = (xs: number[], ys: number[]) => {
  const n = xs.length;
  const d = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
  const m = [d[0], ...d.slice(1).map((v, i) => (v * d[i] <= 0 ? 0 : (v + d[i]) / 2)), d[n - 2]];
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1, h10 = t ** 3 - 2 * t ** 2 + t, h01 = -2 * t ** 3 + 3 * t ** 2, h11 = t ** 3 - t ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
};

// pseudo-aleatório determinístico
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// tratamento das fotos: arquivo (sépia) e atual (quase P&B, quente)
export const FILTRO = {
  arquivo: 'grayscale(1) sepia(0.45) contrast(1.12) brightness(0.86)',
  atual: 'saturate(0.32) sepia(0.28) contrast(1.1) brightness(0.84)',
  cor: 'saturate(0.85) sepia(0.12) contrast(1.06) brightness(0.92)',
};
