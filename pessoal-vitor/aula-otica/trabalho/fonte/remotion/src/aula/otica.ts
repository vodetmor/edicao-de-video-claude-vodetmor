// Física da aula de ótica (valores conferidos):
// n = c/v; Snell n1 sen θ1 = n2 sen θ2; água n = 4/3 (v = 225 000 km/s); ar → água a 53° (sen 0,8): sen θ2 = 0,6, θ2 ≈ 36,9°.
// Ângulo limite água → ar: sen L = 1/(4/3) = 0,75, L ≈ 48,6°. Vidro comum (crown): vermelho ≈ 1,51, violeta ≈ 1,53.
// Prisma 3D: vidro flint denso (tipo SF10), Cauchy ajustado a n(656 nm) = 1,7215 e n(405 nm) = 1,7783.
export const deg = Math.PI / 180;
export const N_AGUA = 4 / 3;
export const TH1 = Math.asin(0.8);            // 53,13°
export const TH2 = Math.asin(0.6);            // 36,87°
export const LIM = Math.asin(0.75);           // 48,59°
export const cauchy = (lum: number) => 1.6865 + 0.01505 / (lum * lum); // λ em µm
export const crown = (lum: number) => 1.5054 + 0.004 / (lum * lum) - 0.0; // 1,5147 @656 / 1,5298 @405 (próximo de 1,51/1,53)

// ---------- espectro: 16 comprimentos de onda e a cor de cada um (CIE 1931 por Wyman et al. 2013 → sRGB linear)
export const NL = 16;
export const LAMBDAS = Array.from({length: NL}, (_, i) => 0.41 + (0.68 - 0.41) * (i / (NL - 1))); // µm, violeta → vermelho
const g = (l: number, m: number, s1: number, s2: number) => Math.exp(-0.5 * ((l - m) / (l < m ? s1 : s2)) ** 2);
const xyz = (nm: number) => [
  1.056 * g(nm, 599.8, 37.9, 31.0) + 0.362 * g(nm, 442.0, 16.0, 26.7) - 0.065 * g(nm, 501.1, 20.4, 26.2),
  0.821 * g(nm, 568.8, 46.9, 40.5) + 0.286 * g(nm, 530.9, 16.3, 31.1),
  1.217 * g(nm, 437.0, 11.8, 36.0) + 0.681 * g(nm, 459.0, 26.0, 13.8),
];
const cruas = LAMBDAS.map((l) => {
  const [X, Y, Z] = xyz(l * 1000);
  let c = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
  return c.map((v) => Math.max(0, v)); // fora do gamut: corta o negativo (mantém o matiz)
});
const soma = [0, 1, 2].map((k) => cruas.reduce((a, c) => a + c[k], 0));
export const CORES = cruas.map((c) => c.map((v, k) => v / soma[k])); // soma das 16 = branco (1,1,1)
// cor sRGB "de tela" de cada comprimento (para desenhar no 2D), saturada e clara
export const corTela = (i: number) => {
  const c = cruas[i]; const mx = Math.max(...c);
  const s = c.map((v) => v / mx).map((x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
  return `rgb(${s.map((v) => Math.round(Math.min(1, v) * 255)).join(',')})`;
};
export const VERMELHO = '#FF453A', VIOLETA = '#B565F2';

// ---------- prisma (plano u, v; v = -z do mundo; prisma de pé no chão)
export const LADO = 1.1, ALT = 1.0, YB = 0.38;     // lado do triângulo, altura do prisma, altura do feixe
const Rr = LADO / Math.sqrt(3), rr = LADO / (2 * Math.sqrt(3));
export const VERT: [number, number][] = [[0, Rr], [-LADO / 2, -rr], [LADO / 2, -rr]]; // ápice, base esq., base dir.
type V2 = [number, number];
const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
const mul = (a: V2, k: number): V2 => [a[0] * k, a[1] * k];
const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
const nrm = (a: V2): V2 => mul(a, 1 / Math.hypot(a[0], a[1]));
export const refrata = (I: V2, N: V2, eta: number): V2 | null => { // N contra I
  const ci = -dot(N, I); const k = 1 - eta * eta * (1 - ci * ci);
  if (k < 0) return null;
  return nrm(add(mul(I, eta), mul(N, eta * ci - Math.sqrt(k))));
};
const reflete = (I: V2, N: V2): V2 => sub(I, mul(N, 2 * dot(I, N)));
// face esquerda: base esq. → ápice; normal para fora aponta para cima-esquerda
const FACE_E = {a: VERT[1], b: VERT[0]}, FACE_D = {a: VERT[0], b: VERT[2]};
const normalFora = (f: {a: V2; b: V2}): V2 => { const t = nrm(sub(f.b, f.a)); const n: V2 = [-t[1], t[0]]; return dot(n, sub(f.a, [0, 0])) > 0 ? n : mul(n, -1); };
export const N_E = normalFora(FACE_E), N_D = normalFora(FACE_D);
export const ENTRA: V2 = add(FACE_E.a, mul(sub(FACE_E.b, FACE_E.a), 0.5));
// direção de entrada: desvio mínimo para a cor do meio (550 nm): dentro, o raio fica paralelo à base
const nMeio = cauchy(0.55);
export const INC = Math.asin(nMeio * Math.sin(30 * deg)); // ângulo de incidência (≈ 61°)
export const DIR_IN: V2 = (() => { const a = -30 * deg + INC; return [Math.cos(a), Math.sin(a)]; })();
const cruza = (o: V2, d: V2, f: {a: V2; b: V2}) => { // raio × segmento
  const e = sub(f.b, f.a); const den = d[0] * e[1] - d[1] * e[0];
  if (Math.abs(den) < 1e-9) return null;
  const w = sub(f.a, o); const t = (w[0] * e[1] - w[1] * e[0]) / den; const s = (w[0] * d[1] - w[1] * d[0]) / den;
  return t > 1e-6 && s >= 0 && s <= 1 ? t : null;
};
export const L_FONTE = 7.0;                 // o feixe vem de longe, fora do quadro
export const FONTE: V2 = sub(ENTRA, mul(DIR_IN, L_FONTE));
export const D_TELA = 2.3;                  // distância da saída (cor do meio) até a tela branca
// caminho de cada cor: fonte → entrada → saída → tela
export const caminho = (n: number) => {
  const d1 = refrata(DIR_IN, mul(N_E, 1), 1 / n)!; // N_E aponta para fora, contra o raio que entra
  const t = cruza(ENTRA, d1, FACE_D)!; const S = add(ENTRA, mul(d1, t));
  const d2 = refrata(d1, mul(N_D, -1), n)!;          // saindo: normal contra o raio = -fora
  return {E: ENTRA, S, d1, d2};
};
const meio = caminho(nMeio);
export const TELA_C: V2 = add(meio.S, mul(meio.d2, D_TELA)); // centro da tela
export const TELA_N: V2 = mul(meio.d2, -1);
export const naTela = (o: V2, d: V2): V2 => { const t = dot(sub(TELA_C, o), TELA_N) / dot(d, TELA_N); return add(o, mul(d, t)); };
export const CAMINHOS = LAMBDAS.map((l) => { const c = caminho(cauchy(l)); return {...c, T: naTela(c.S, c.d2), n: cauchy(l)}; });
// comprimentos acumulados (para a frente e a cauda do feixe)
export const L1 = L_FONTE;
export const segs = (i: number) => { const c = CAMINHOS[i]; const l2 = Math.hypot(...sub(c.S, c.E)); const l3 = Math.hypot(...sub(c.T, c.S)); return [L1, L1 + l2, L1 + l2 + l3]; };
export const L_TOTAL = Math.max(...CAMINHOS.map((_, i) => segs(i)[2]));

// ---------- interface 2D (atos 2 a 4): raio que chega em O = (0,0); y > 0 = meio de cima
export const snell = (n1: number, n2: number, th1: number) => { const s = (n1 / n2) * Math.sin(th1); return Math.abs(s) <= 1 ? Math.asin(s) : null; };
// refletância de Fresnel (luz não polarizada)
export const fresnelR = (n1: number, n2: number, th1: number) => {
  const th2 = snell(n1, n2, th1); if (th2 === null) return 1;
  const ci = Math.cos(th1), ct = Math.cos(th2);
  const rs = ((n1 * ci - n2 * ct) / (n1 * ci + n2 * ct)) ** 2, rp = ((n1 * ct - n2 * ci) / (n1 * ct + n2 * ci)) ** 2;
  return (rs + rp) / 2;
};
export const fmt = (x: number, casas = 1) => x.toFixed(casas).replace('.', ',');
