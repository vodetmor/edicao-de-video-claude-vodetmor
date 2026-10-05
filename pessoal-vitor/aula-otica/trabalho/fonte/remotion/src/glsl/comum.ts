// Biblioteca GLSL do motor (GLSL ES 3.0). Entra no começo de todo shader com ${COMUM}.
// Ruído simplex: Ashima Arts / Stefan Gustavson (MIT). Hashes: Dave Hoskins (MIT).
// Sombra suave, oclusão e SDFs: técnicas de Inigo Quilez. Hachura de gravura e organização
// inspiradas em github.com/mexicat/pdoom-video (MIT).

const lin = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = c.map((x) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return `vec3(${l.map((x) => x.toFixed(5)).join(',')})`;
};

// Paleta do DESIGN-SYSTEM, já em linear (a luz é calculada em linear; converte para sRGB no fim).
export const PALETA = {papel: '#F5F5F7', tinta: '#1D1D1F', azul: '#0071E3', escuro: '#0B0B0C', cinza: '#86868B'};

export const COMUM = /* glsl */ `
precision highp float;
#define PI 3.14159265359
#define TAU 6.28318530718
const vec3 C_PAPEL = ${lin(PALETA.papel)};
const vec3 C_TINTA = ${lin(PALETA.tinta)};
const vec3 C_AZUL = ${lin(PALETA.azul)};
const vec3 C_ESCURO = ${lin(PALETA.escuro)};
const vec3 C_CINZA = ${lin(PALETA.cinza)};

float sat(float x) { return clamp(x, 0.0, 1.0); }
vec3 sat(vec3 x) { return clamp(x, 0.0, 1.0); }
mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
vec3 toSRGB(vec3 c) { return mix(12.92 * c, 1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
vec3 toLinear(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }

// ---- hashes (sem seno: estáveis em qualquer GPU)
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }

// ---- ruído simplex 2D e fbm
vec3 _m289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 _m289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 _perm(vec3 x) { return _m289(((x * 34.0) + 10.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = _m289(i);
  vec3 p = _perm(_perm(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p, int oct) { float s = 0.0, a = 0.5; for (int i = 0; i < 8; i++) { if (i >= oct) break; s += a * snoise(p); p = rot2(0.6) * p * 2.03 + 11.7; a *= 0.5; } return s; }

// ---- formas (SDF): distância até a superfície; < 0 = dentro
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
float sdRoundBox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = sat(dot(pa, ba) / dot(ba, ba)); return length(pa - ba * h) - r; }
float sdEllipsoid(vec3 p, vec3 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / k1; }
float smin(float a, float b, float k) { float h = sat(0.5 + 0.5 * (b - a) / max(k, 1e-5)); return mix(b, a, h) - k * h * (1.0 - h); }

// ---- linhas finas sempre limpas (largura em pixels de tela)
float fio(float d, float px) { float w = fwidth(d); return 1.0 - smoothstep(px * 0.5 * w, (px * 0.5 + 1.0) * w, abs(d)); }
float preenche(float d) { float w = fwidth(d); return 1.0 - smoothstep(-w, w, d); }
// hachura de gravura: linhas em u inteiro que engrossam com a escuridão (0 papel, 1 tinta)
float hachura(float u, float esc) { float f = abs(fract(u) - 0.5); float hw = 0.5 * sat(esc); float aa = max(fwidth(u), 1e-4); return 1.0 - smoothstep(hw - aa, hw + aa, 0.5 - f); }
`;

// Funções de luz que dependem de um map(vec3) declarado antes (cole depois do map).
export const LUZ = /* glsl */ `
vec3 normal(vec3 p) { const vec2 k = vec2(1, -1); const float h = 0.0007;
  return normalize(k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) + k.yxy * map(p + k.yxy * h) + k.xxx * map(p + k.xxx * h)); }
// sombra suave (penumbra pela distância mínima ao longo do raio até a luz)
float sombra(vec3 ro, vec3 rd, float k) { float r = 1.0, d = 0.02, ph = 1e10;
  for (int i = 0; i < 56; i++) { float h = map(ro + rd * d); float y = h * h / (2.0 * ph); float e = sqrt(max(h * h - y * y, 0.0));
    r = min(r, k * e / max(0.0, d - y)); ph = h; d += clamp(h, 0.012, 0.3); if (r < 0.001 || d > 8.0) break; }
  r = sat(r); return r * r * (3.0 - 2.0 * r); }
// oclusão de ambiente (o escurecido onde as superfícies se apertam)
float oclusao(vec3 p, vec3 n) { float s = 0.0, w = 1.0; for (int i = 1; i <= 5; i++) { float h = 0.04 + 0.09 * float(i); s += (h - map(p + n * h)) * w; w *= 0.72; } return sat(1.0 - 1.6 * s); }
float fresnel(vec3 n, vec3 v, float f0) { return f0 + (1.0 - f0) * pow(1.0 - sat(dot(n, v)), 5.0); }
`;
