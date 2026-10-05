// Estúdio escuro com o prisma de vidro flint (GLSL, raymarching analítico).
// O feixe e as 16 cores seguem a lei de Snell com n(λ) de Cauchy (otica.ts): a dispersão é calculada, não desenhada.
// Mundo: x = u, z = -v (plano do desenho), y para cima; prisma de pé no chão (y = 0).
import {COMUM} from '../glsl/comum';
import {ALT, CAMINHOS, CORES, ENTRA, FONTE, L1, NL, TELA_C, TELA_N, VERT, YB, cauchy, segs} from './otica';

const v3 = (u: number, v: number, y = YB) => `vec3(${u.toFixed(5)},${y.toFixed(5)},${(-v).toFixed(5)})`;
const arr = (tipo: string, xs: string[]) => `${tipo}[](${xs.join(',')})`;
const N_VIDRO = cauchy(0.55);

export const PRISMA = /* glsl */ `
${COMUM}
uniform float yaw, el, dist, foc, aa;
uniform vec3 alvo;
uniform float frente, cauda, luz, amb, tela, expo;
const float YB = ${YB.toFixed(4)};
const float ALT = ${ALT.toFixed(4)};
const float NG = ${N_VIDRO.toFixed(4)};
const vec3 FONTE = ${v3(FONTE[0], FONTE[1])};
const vec3 ENTRA = ${v3(ENTRA[0], ENTRA[1])};
const float L1 = ${L1.toFixed(4)};
const vec3 SAI[${NL}] = ${arr('vec3', CAMINHOS.map((c) => v3(c.S[0], c.S[1])))};
const vec3 TT[${NL}] = ${arr('vec3', CAMINHOS.map((c) => v3(c.T[0], c.T[1])))};
const vec2 LS[${NL}] = ${arr('vec2', CAMINHOS.map((_, i) => { const s = segs(i); return `vec2(${s[1].toFixed(4)},${s[2].toFixed(4)})`; }))};
const vec3 COR[${NL}] = ${arr('vec3', CORES.map((c) => `vec3(${c.map((x) => x.toFixed(5)).join(',')})`))};
const vec2 VT[3] = ${arr('vec2', VERT.map((p) => `vec2(${p[0].toFixed(5)},${(-p[1]).toFixed(5)})`))}; // (x, z)
const vec3 TC = ${v3(TELA_C[0], TELA_C[1], 0)};
const vec3 TN = normalize(vec3(${TELA_N[0].toFixed(5)}, 0.0, ${(-TELA_N[1]).toFixed(5)}));
const vec3 FUNDO = vec3(0.0042, 0.0042, 0.0050);

float fresnel(vec3 n, vec3 v, float f0) { return f0 + (1.0 - f0) * pow(1.0 - sat(abs(dot(n, v))), 5.0); }
// ---------- feixes: brilho de um segmento visto por um raio (distância mínima raio × segmento)
float distRS(vec3 ro, vec3 rd, float tmax, vec3 A, vec3 B) {
  vec3 ba = B - A, oa = ro - A;
  float b = dot(rd, ba), c = dot(ba, ba), d = dot(rd, oa), e = dot(ba, oa);
  float den = max(c - b * b, 1e-7);
  float s = clamp((b * e - c * d) / den, 0.0, tmax);
  float h = clamp((e + b * s) / c, 0.0, 1.0);
  s = clamp(dot(A + ba * h - ro, rd), 0.0, tmax);
  return length(ro + rd * s - (A + ba * h));
}
float brilho(float d, float w) { float q = d / w; return exp(-q * q) * 1.6 + 0.10 / (1.0 + q * q * 0.5); }
// parte visível [cauda, frente] de um trecho que ocupa [la, lb] no caminho
bool janela(vec3 A, vec3 B, float la, float lb, out vec3 a, out vec3 b) {
  float x = max(la, cauda), y = min(lb, frente);
  if (y <= x + 1e-4) return false;
  a = mix(A, B, (x - la) / (lb - la)); b = mix(A, B, (y - la) / (lb - la));
  return true;
}
vec3 feixes(vec3 ro, vec3 rd, float tmax, float w, float kDentro) {
  vec3 acc = vec3(0.0); vec3 a, b;
  if (janela(FONTE, ENTRA, 0.0, L1, a, b)) acc += vec3(1.0) * brilho(distRS(ro, rd, tmax, a, b), w);
  // dentro do vidro as cores quase não se separam: um traço branco (a soma das 16 cores) basta
  if (janela(ENTRA, SAI[8], L1, LS[8].x, a, b)) acc += vec3(1.0) * kDentro * brilho(distRS(ro, rd, tmax, a, b), w);
  // fora: longe do leque só o halo conta, e o halo somado das 16 cores é branco; perto do leque, cor por cor
  vec3 a8, b8;
  if (janela(SAI[8], TT[8], LS[8].x, LS[8].y, a8, b8)) {
    float d8 = distRS(ro, rd, tmax, a8, b8);
    if (d8 > 0.32) acc += vec3(1.0) * 2.6 * brilho(d8, w * 1.15);
    else for (int i = 0; i < ${NL}; i++) {
      if (janela(SAI[i], TT[i], LS[i].x, LS[i].y, a, b)) acc += COR[i] * 2.6 * brilho(distRS(ro, rd, tmax, a, b), w * 1.15);
    }
  }
  // pontos de impacto acendem (espalhamento na face e na tela)
  float pe = smoothstep(L1 - 0.05, L1 + 0.15, frente) * (1.0 - smoothstep(L1 - 0.1, L1 + 0.1, cauda));
  acc += vec3(1.0) * pe * 0.5 * brilho(distRS(ro, rd, tmax, ENTRA, ENTRA + vec3(0.0, 1e-3, 0.0)), 0.05);
  return acc * luz;
}

vec3 feixesBarato(vec3 ro, vec3 rd, float tmax, float w) {
  vec3 acc = vec3(0.0); vec3 a, b;
  if (janela(FONTE, ENTRA, 0.0, L1, a, b)) acc += vec3(1.0) * brilho(distRS(ro, rd, tmax, a, b), w);
  if (janela(SAI[8], TT[8], LS[8].x, LS[8].y, a, b)) acc += vec3(1.0) * 2.6 * brilho(distRS(ro, rd, tmax, a, b), w * 1.4);
  return acc * luz;
}
// ---------- prisma: interseção com 5 planos (3 faces, topo, base)
vec3 nFace(int i) { vec2 a = VT[i], b = VT[(i + 1) % 3]; vec2 t = normalize(b - a); vec2 n = vec2(t.y, -t.x);
  if (dot(n, a) < 0.0) n = -n; return vec3(n.x, 0.0, n.y); }
float pFace(int i) { return dot(nFace(i), vec3(VT[i].x, 0.0, VT[i].y)); }
// (t entrada, t saída); normais de entrada e saída
vec2 prisma(vec3 ro, vec3 rd, out vec3 nE, out vec3 nS) {
  float t0 = -1e9, t1 = 1e9; nE = vec3(0.0); nS = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    vec3 n; float h;
    if (i < 3) { n = nFace(i); h = pFace(i); } else if (i == 3) { n = vec3(0, 1, 0); h = ALT; } else { n = vec3(0, -1, 0); h = 0.0; }
    float dn = dot(rd, n), dd = h - dot(ro, n);
    if (abs(dn) < 1e-7) { if (dd < 0.0) return vec2(1e9, -1e9); continue; }
    float t = dd / dn;
    if (dn < 0.0) { if (t > t0) { t0 = t; nE = n; } } else { if (t < t1) { t1 = t; nS = n; } }
  }
  return vec2(t0, t1);
}
// distância (no plano xz) até as arestas verticais, para o fio de luz nas quinas
float arestas(vec3 p) {
  float dv = 1e9, db = 1e9;
  for (int i = 0; i < 3; i++) { dv = min(dv, length(p.xz - VT[i]));
    vec2 a = VT[i], b = VT[(i + 1) % 3]; vec2 pa = p.xz - a, ba = b - a; db = min(db, length(pa - ba * sat(dot(pa, ba) / dot(ba, ba)))); }
  float dt = abs(p.y - ALT);
  return min(dv, dt < 3e-3 ? db : dt);
}
// ---------- estúdio: fundo escuro com duas softboxes (só aparecem em reflexos)
vec3 ambiente(vec3 d) {
  vec3 c = FUNDO * (0.6 + 0.6 * sat(d.y));
  float s1 = smoothstep(0.08, 0.05, abs(d.x + 0.55)) * smoothstep(0.42, 0.36, abs(d.y - 0.35)) * step(0.0, d.z);
  float s2 = smoothstep(0.05, 0.03, abs(d.x - 0.7)) * smoothstep(0.5, 0.42, abs(d.y - 0.3));
  float topo = smoothstep(0.75, 0.95, d.y);
  return c + amb * (vec3(2.4) * s1 + vec3(1.4) * s2 + vec3(0.06) * topo);
}
// tela branca (cartão fosco) onde o arco-íris pousa
float tTela(vec3 ro, vec3 rd, out vec3 p) {
  float dn = dot(rd, TN); if (abs(dn) < 1e-5) return 1e9;
  float t = dot(TC - ro, TN) / dn; if (t < 0.0) return 1e9;
  p = ro + rd * t; vec3 q = p - TC; vec3 tg = normalize(cross(TN, vec3(0, 1, 0)));
  if (abs(dot(q, tg)) > 0.42 || p.y > 0.82 || p.y < 0.0) return 1e9;
  return t;
}
vec3 luzTela(vec3 p) {
  vec3 c = vec3(0.0);
  for (int i = 0; i < ${NL}; i++) {
    float a = smoothstep(LS[i].y - 0.05, LS[i].y + 0.02, frente) * (1.0 - smoothstep(LS[i].y - 0.02, LS[i].y + 0.05, cauda));
    vec3 q = p - TT[i]; float dy = q.y / 0.17, dh = length(q - vec3(0.0, q.y, 0.0)) / 0.026; c += COR[i] * a * 7.0 * exp(-dh * dh - dy * dy * dy * dy);
  }
  return c * luz;
}
// cena sem o prisma (chão, tela, feixes) ao longo de um raio
vec3 cena(vec3 ro, vec3 rd) {
  float tf = rd.y < -1e-5 ? -ro.y / rd.y : 1e9;
  vec3 pt; float tt = tela > 0.5 ? tTela(ro, rd, pt) : 1e9;
  float tm = min(min(tf, tt), 40.0);
  vec3 c = feixes(ro, rd, tm, 0.013, 1.0);
  if (tt < tf) {
    vec3 alb = vec3(0.8);
    vec3 q = pt - TC; vec3 tg = normalize(cross(TN, vec3(0, 1, 0)));
    float borda = smoothstep(0.0, 0.03, 0.42 - abs(dot(q, tg))) * smoothstep(0.0, 0.03, 0.82 - pt.y);
    c += alb * (FUNDO * 2.0 + amb * 0.012 * borda + luzTela(pt));
  } else if (tf < 1e8) {
    vec3 p = ro + rd * tf;
    // chão preto brilhante: reflexo borrado dos feixes + luz que vaza deles + o arco-íris que respinga da tela
    vec3 rr = reflect(rd, vec3(0, 1, 0));
    vec3 refl = feixesBarato(p, rr, 30.0, 0.1) * 0.02;
    float dp = 1e9; for (int i = 0; i < 3; i++) { vec2 a = VT[i], b = VT[(i + 1) % 3]; vec2 pa = p.xz - a, ba = b - a; dp = min(dp, length(pa - ba * sat(dot(pa, ba) / dot(ba, ba)))); }
    float oc = mix(0.55, 1.0, smoothstep(0.0, 0.25, dp));
    vec3 base = FUNDO * 0.9 + amb * vec3(0.012) * smoothstep(6.0, 0.0, length(p.xz));
    c += (base * oc + refl) * mix(1.0, 0.0, smoothstep(9.0, 22.0, tf));
    c += FUNDO * smoothstep(9.0, 22.0, tf);
  } else c += FUNDO;
  return c;
}
vec3 camera(vec2 frag, out vec3 ro) {
  vec2 uv = (frag - 0.5 * res) / res.y;
  ro = alvo + dist * vec3(sin(yaw) * cos(el), sin(el), cos(yaw) * cos(el));
  vec3 f = normalize(alvo - ro), r = normalize(cross(f, vec3(0, 1, 0))), u = cross(r, f);
  return normalize(f * foc + r * uv.x + u * uv.y);
}
vec3 render(vec2 frag) {
  vec3 ro; vec3 rd = camera(frag, ro);
  vec3 nE, nS; vec2 tp = prisma(ro, rd, nE, nS);
  if (!(tp.x < tp.y && tp.y > 0.0 && tp.x > 0.0)) return cena(ro, rd);
  // vidro: reflexo do estúdio + refração pelo prisma (até 2 reflexões internas)
  vec3 p1 = ro + rd * tp.x;
  vec3 c = feixes(ro, rd, tp.x, 0.013, 1.0);
  float F = fresnel(nE, -rd, 0.074);
  vec3 refl = ambiente(reflect(rd, nE));
  vec3 d1 = refract(rd, nE, 1.0 / NG);
  vec3 o = p1 + d1 * 1e-4; vec3 dentro = vec3(0.0); vec3 trans = vec3(0.0); float k = 1.0;
  for (int b = 0; b < 3; b++) {
    vec3 a1, a2; vec2 q = prisma(o - d1 * 4.0, d1, a1, a2); float tx = q.y - 4.0;
    dentro += feixes(o, d1, max(tx, 0.0), 0.013, 1.6) * k;
    vec3 px = o + d1 * max(tx, 0.0);
    vec3 d2 = refract(d1, -a2, NG);
    if (dot(d2, d2) < 0.5) { d1 = reflect(d1, -a2); o = px + d1 * 1e-4; k *= 0.92; continue; }
    float Fx = fresnel(a2, d2, 0.074);
    trans = cena(px + d2 * 1e-4, d2) * (1.0 - Fx) * k;
    break;
  }
  vec3 tinta = vec3(0.93, 0.96, 0.97);
  c += F * refl + (1.0 - F) * tinta * (dentro + trans);
  // fio de luz nas quinas (lapidação) e topo
  float ar = arestas(p1);
  c += amb * vec3(0.5) * smoothstep(0.014, 0.002, ar);
  return c;
}
vec3 aces(vec3 x) { return sat((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)); }
void main() {
  vec3 c = vec3(0.0);
  int n = aa > 1.5 ? 2 : 1;
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    if (i >= n || j >= n) continue;
    vec2 o = n == 1 ? vec2(0.0) : (vec2(float(i), float(j)) - 0.5) * 0.5;
    c += render(gl_FragCoord.xy + o);
  }
  c /= float(n * n);
  vec3 s = toSRGB(aces(c * expo));
  s += (hash12(gl_FragCoord.xy + fract(t) * 917.0) - 0.5) / 255.0;
  fragColor = vec4(s, 1.0);
}
`;

// mesma câmera no TS: projeta um ponto do mundo na tela (para rótulos e para casar com o palco 2D)
export type Cam3 = {yaw: number; el: number; dist: number; foc: number; alvo: [number, number, number]};
export const projeta = (c: Cam3, p: [number, number, number], W = 1920, H = 1080) => {
  const ro = [c.alvo[0] + c.dist * Math.sin(c.yaw) * Math.cos(c.el), c.alvo[1] + c.dist * Math.sin(c.el), c.alvo[2] + c.dist * Math.cos(c.yaw) * Math.cos(c.el)];
  const sub = (a: number[], b: number[]) => a.map((x, i) => x - b[i]);
  const nrm = (a: number[]) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const f = nrm(sub(c.alvo, ro)), r = nrm(cross(f, [0, 1, 0])), u = cross(r, f);
  const d = sub(p, ro); const z = dot(d, f);
  return {X: W / 2 + ((c.foc * dot(d, r)) / z) * H, Y: H / 2 - ((c.foc * dot(d, u)) / z) * H, z};
};
