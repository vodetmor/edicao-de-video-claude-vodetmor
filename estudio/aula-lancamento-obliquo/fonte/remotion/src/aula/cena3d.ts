// Estúdio 3D da aula (raymarching): bola preta acetinada, flashes estroboscópicos do voo e sombras macias.
// Unidade do mundo: 1 = 4 m. Chão em y = 0; a trajetória fica no plano z = 0 (x para a direita).
// Uniforms: câmera (yaw, el, dist, alvo, foc); até 2 voos (v0, th, tb = tempo físico da bola, tf = flashes até)
import {COMUM} from '../glsl/comum';

export const R_BOLA = 0.11;
export const ESC = 0.25; // metros -> unidades

export const CENA3D = /* glsl */ `
${COMUM}
uniform float yaw, el, dist, foc, aa;
uniform vec3 alvo;
uniform vec4 voo1, voo2;   // (v0, th, tb, tf); tb < 0 = voo desligado
uniform float fantOp, marcaX, marcaOp;
const float RB = ${R_BOLA.toFixed(3)};
const float ES = ${ESC.toFixed(3)};
bool soSolido = false;

vec3 posB(float v0, float th, float t) {
  float x = v0 * cos(th) * t, y = v0 * sin(th) * t - 5.0 * t * t;
  return vec3(x * ES, RB + max(y, 0.0) * ES, 0.0);
}
// distância às bolas: .x = bola, .y = fantasmas
vec2 bolas(vec3 p, vec4 v) {
  if (v.z < 0.0) return vec2(1e5);
  float b = length(p - posB(v.x, v.y, v.z)) - RB;
  float g = 1e5;
  for (int k = 0; k < 18; k++) {
    float t = float(k) * 0.2;
    if (t > v.w + 1e-4) break;
    g = min(g, length(p - posB(v.x, v.y, t)) - RB);
  }
  return vec2(b, g);
}
vec3 mapId(vec3 p) { // (dist, id) id 1 = bola, 2 = fantasma, 0 = chão
  vec2 a = bolas(p, voo1), b = bolas(p, voo2);
  float db = min(a.x, b.x), dg = min(a.y, b.y);
  if (soSolido || fantOp < 0.01) dg = 1e5;
  float d = p.y; float id = 0.0;
  if (db < d) { d = db; id = 1.0; }
  if (dg < d) { d = dg; id = 2.0; }
  return vec3(d, id, 0.0);
}
float map(vec3 p) { return mapId(p).x; }
vec3 normal(vec3 p) { const vec2 k = vec2(1, -1); const float h = 0.0006;
  return normalize(k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) + k.yxy * map(p + k.yxy * h) + k.xxx * map(p + k.xxx * h)); }
float sombra(vec3 ro, vec3 rd, float k) { soSolido = true; float r = 1.0, d = 0.01;
  for (int i = 0; i < 48; i++) { float h = map(ro + rd * d); r = min(r, k * h / d); d += clamp(h, 0.01, 0.25); if (r < 0.001 || d > 6.0) break; }
  soSolido = false; r = sat(r); return r * r * (3.0 - 2.0 * r); }
float sombraFant(vec3 p, vec3 L) { // sombra suave dos fantasmas (mais clara)
  float s = 1.0;
  for (int w = 0; w < 2; w++) { vec4 v = w == 0 ? voo1 : voo2; if (v.z < 0.0) continue;
    for (int k = 0; k < 18; k++) { float t = float(k) * 0.2; if (t > v.w + 1e-4) break;
      vec3 c = posB(v.x, v.y, t); vec3 q = c - p; float tt = dot(q, L); if (tt < 0.0) continue;
      float dd = length(q - L * tt); s = min(s, mix(0.82, 1.0, smoothstep(RB * 0.4, RB * 2.6 + tt * 0.08, dd))); } }
  return s;
}
float oclusao(vec3 p, vec3 n) { soSolido = true; float s = 0.0, w = 1.0; for (int i = 1; i <= 4; i++) { float h = 0.02 + 0.05 * float(i); s += (h - map(p + n * h)) * w; w *= 0.7; } soSolido = false; return sat(1.0 - 2.0 * s); }
float fresnel(vec3 n, vec3 v, float f0) { return f0 + (1.0 - f0) * pow(1.0 - sat(dot(n, v)), 5.0); }

vec3 ambiente(vec3 d) {
  vec3 base = mix(C_PAPEL * 0.5, C_PAPEL * 1.05, sat(d.y * 0.6 + 0.55));
  float box = smoothstep(0.22, 0.18, abs(d.x + 0.45)) * smoothstep(0.32, 0.27, abs(d.y - 0.55)) * step(0.0, d.z);
  float tira = smoothstep(0.03, 0.015, abs(d.x - 0.6)) * smoothstep(0.6, 0.5, abs(d.y - 0.25));
  return base + vec3(3.2) * box + vec3(1.6) * tira;
}
vec3 camera(vec2 frag, out vec3 ro) {
  vec2 uv = (frag - 0.5 * res) / res.y;
  ro = alvo + dist * vec3(sin(yaw) * cos(el), sin(el), cos(yaw) * cos(el));
  vec3 f = normalize(alvo - ro), r = normalize(cross(f, vec3(0, 1, 0))), u = cross(r, f);
  return normalize(f * foc + r * uv.x + u * uv.y);
}
vec3 render(vec2 frag) {
  vec3 ro; vec3 rd = camera(frag, ro);
  float d = 0.0; vec3 h = vec3(0.0); bool hit = false;
  for (int i = 0; i < 160; i++) { h = mapId(ro + rd * d); if (h.x < 1.5e-4 * d + 5e-5) { hit = true; break; } d += h.x; if (d > 60.0) break; }
  vec3 papel = C_PAPEL;
  if (!hit) return papel;
  vec3 p = ro + rd * d, v = -rd;
  vec3 L = normalize(vec3(-0.45, 1.0, 0.55));
  if (h.y < 0.5) { // chão infinito: só sombra e oclusão aparecem
    float sh = sombra(p + vec3(0, 1e-3, 0), L, 10.0) * sombraFant(p, L);
    float oc = oclusao(p, vec3(0, 1, 0));
    vec3 c = papel * mix(0.6, 1.0, sh) * mix(0.6, 1.0, oc);
    // marca de pouso (um X fino no chão)
    if (marcaOp > 0.0) { vec2 q = p.xz - vec2(marcaX, 0.0); q = abs(rot2(0.785) * q);
      float m = max(fio(q.x, 2.4) * step(q.y, 0.16), fio(q.y, 2.4) * step(q.x, 0.16));
      c = mix(c, C_AZUL, m * marcaOp); }
    return mix(c, papel, smoothstep(14.0, 40.0, d));
  }
  vec3 n = normal(p);
  float sh = sombra(p + n * 0.002, L, 10.0), oc = oclusao(p, n);
  float dif = sat(dot(n, L) * 0.8 + 0.2);
  vec3 base = C_TINTA * 0.55 * mix(0.25, 1.0, dif * mix(0.3, 1.0, sh));
  float fr = fresnel(n, v, 0.045);
  vec3 c = base + ambiente(reflect(rd, n)) * fr * mix(0.4, 1.0, sh) * oc * 0.9;
  if (h.y > 1.5) c = mix(c, papel, 1.0 - 0.24 * fantOp); // fantasma: flash fraco
  return c;
}
void main() {
  vec3 c = vec3(0.0);
  int n = aa > 1.5 ? 2 : 1;
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    if (i >= n || j >= n) continue;
    vec2 o = n == 1 ? vec2(0.0) : (vec2(float(i), float(j)) - 0.5) * 0.5;
    c += render(gl_FragCoord.xy + o);
  }
  c /= float(n * n);
  vec3 s = toSRGB(sat(c));
  s += (hash12(gl_FragCoord.xy + fract(t) * 917.0) - 0.5) / 255.0;
  fragColor = vec4(s, 1.0);
}
`;

// mesma câmera no TS: projeta um ponto do mundo na tela (para traços e rótulos por cima do 3D)
export type Cam3 = {yaw: number; el: number; dist: number; foc: number; alvo: [number, number, number]};
export const projeta = (c: Cam3, p: [number, number, number], W = 1920, H = 1080) => {
  const ro = [c.alvo[0] + c.dist * Math.sin(c.yaw) * Math.cos(c.el), c.alvo[1] + c.dist * Math.sin(c.el), c.alvo[2] + c.dist * Math.cos(c.yaw) * Math.cos(c.el)];
  const sub = (a: number[], b: number[]) => a.map((x, i) => x - b[i]);
  const nrm = (a: number[]) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const f = nrm(sub(c.alvo, ro)), r = nrm(cross(f, [0, 1, 0])), u = cross(r, f);
  const d = sub(p, ro); const z = dot(d, f);
  const ux = (c.foc * dot(d, r)) / z, uy = (c.foc * dot(d, u)) / z;
  return {X: W / 2 + ux * H, Y: H / 2 - uy * H, z};
};
