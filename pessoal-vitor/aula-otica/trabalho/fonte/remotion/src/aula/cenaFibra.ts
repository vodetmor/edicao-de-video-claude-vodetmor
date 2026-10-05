// Fibra óptica em 3D (GLSL): cilindro de vidro; dentro, a luz quica nas paredes por reflexão total.
// O zigue-zague é visto ATRAVÉS do vidro curvo (refração calculada), por isso ele "engorda" como numa lente.
import {COMUM} from '../glsl/comum';
export const R_FIBRA = 0.16;
export const ANG_EIXO = 22; // graus entre o raio de luz e o eixo (incidência na parede = 68°, acima do limite do vidro ≈ 42°)
export const FIBRA = /* glsl */ `
${COMUM}
uniform float yaw, el, dist, foc, aa;
uniform vec3 alvo;
uniform float frente, luz, expo;
const float R = ${R_FIBRA.toFixed(3)};
const float RI = ${(R_FIBRA * 0.93).toFixed(3)};
const float NG = 1.5;
const float PER = ${((4 * R_FIBRA * 0.93) / Math.tan((ANG_EIXO * Math.PI) / 180)).toFixed(4)};
const vec3 FUNDO = vec3(0.0042, 0.0042, 0.0050);
float fresnel(vec3 n, vec3 v, float f0) { return f0 + (1.0 - f0) * pow(1.0 - sat(abs(dot(n, v))), 5.0); }
// onda triangular: altura do raio de luz dentro da fibra em função de x
float zig(float x) { float u = fract(x / PER); return RI * (4.0 * abs(u - 0.5) - 1.0); }
// intensidade do pulso ao longo de x (cabeça forte, rastro que apaga)
float pulso(float x) { float d = frente - x; if (d < 0.0) return 0.0; return exp(-d * 0.55) * 1.0 + 0.12 + 1.6 * exp(-d * d * 30.0); }
vec3 corLuz = vec3(1.0, 0.97, 0.92);
float amb() { return 1.0; }
// luz espalhada ao longo de um trecho de raio dentro da fibra (integral numérica)
vec3 dentro(vec3 ro, vec3 rd, float tmax) {
  vec3 acc = vec3(0.0); const int N = 28; float dt = tmax / float(N);
  for (int i = 0; i < N; i++) {
    vec3 p = ro + rd * (float(i) + 0.5) * dt;
    float dy = (p.y - zig(p.x)) * 0.93; float d = length(vec2(dy, p.z));
    float w = 0.012; float g = exp(-d * d / (w * w)) * 3.0 + 0.012 / (d * d + 0.0004) * 0.02;
    acc += corLuz * g * pulso(p.x) * dt * 6.0;
    // brilho fraco da parede no ponto de quique (o vidro "acende" onde a luz bate)
  }
  return acc * luz;
}
// fibras do fundo (só a luz, sem vidro): dão profundidade, como num cabo
vec3 fibrasFundo(vec3 ro, vec3 rd) {
  vec3 acc = vec3(0.0);
  for (int k = 0; k < 2; k++) {
    float zf = k == 0 ? -1.1 : -2.3; float yf = k == 0 ? 0.55 : 0.2; float dx = k == 0 ? -2.2 : 1.4;
    if (abs(rd.z) < 1e-4) continue;
    float t = (zf - ro.z) / rd.z; if (t < 0.0) continue;
    vec3 p = ro + rd * t; float d = abs(p.y - (yf + zig(p.x * 1.3) * 0.7));
    float gd = frente + dx - p.x; float pu = gd < 0.0 ? 0.0 : exp(-gd * 0.7) + 0.08;
    acc += corLuz * pu * (exp(-d * d / 0.0004) * 0.8 + 0.004 / (d * d + 0.002)) * (k == 0 ? 0.45 : 0.25);
    float ed = abs(abs(p.y - yf) - R * 0.8); acc += vec3(0.04) * exp(-ed * ed / 0.00004) * (k == 0 ? 1.0 : 0.6) * amb();
  }
  return acc * luz;
}
vec3 ambiente(vec3 d) {
  vec3 c = FUNDO * (0.6 + 0.6 * sat(d.y));
  float s1 = smoothstep(0.035, 0.02, abs(d.y - 0.6));
  float s2 = smoothstep(0.02, 0.01, abs(d.y + 0.3));
  return c + vec3(2.2) * s1 + vec3(0.35) * s2;
}
vec2 cilindro(vec3 ro, vec3 rd, float r) { // eixo x, centro (y = 0.5, z = 0)
  vec2 o = ro.yz - vec2(0.5, 0.0); vec2 d = rd.yz;
  float a = dot(d, d), b = dot(o, d), c = dot(o, o) - r * r; float h = b * b - a * c;
  if (h < 0.0 || a < 1e-8) return vec2(-1.0);
  h = sqrt(h); return vec2((-b - h) / a, (-b + h) / a);
}
vec3 nCil(vec3 p) { return normalize(vec3(0.0, p.y - 0.5, p.z)); }
vec3 camera(vec2 frag, out vec3 ro) {
  vec2 uv = (frag - 0.5 * res) / res.y;
  ro = alvo + dist * vec3(sin(yaw) * cos(el), sin(el), cos(yaw) * cos(el));
  vec3 f = normalize(alvo - ro), r = normalize(cross(f, vec3(0, 1, 0))), u = cross(r, f);
  return normalize(f * foc + r * uv.x + u * uv.y);
}
vec3 render(vec2 frag) {
  vec3 ro; vec3 rd = camera(frag, ro);
  vec3 fundo = FUNDO;
  // zigue-zague em coordenadas do mundo: y = 0.5 + zig(x)
  vec2 h = cilindro(ro - vec3(0.0, 0.0, 0.0), rd, R);
  if (h.x < 0.0) return fundo;
  vec3 p = ro + rd * h.x; vec3 n = nCil(p);
  float F = fresnel(n, -rd, 0.04);
  vec3 refl = ambiente(reflect(rd, n));
  vec3 d1 = refract(rd, n, 1.0 / NG);
  vec2 h2 = cilindro(p + d1 * 1e-4, d1, R); float tx = h2.y;
  vec3 q = p + d1 * (1e-4 + tx);
  vec3 dd = dentro(p - vec3(0.0, 0.5, 0.0), d1, tx);
  vec3 n2 = nCil(q); vec3 d2 = refract(d1, -n2, NG);
  vec3 atras = dot(d2, d2) < 0.5 ? FUNDO * 1.5 : FUNDO;
  // a luz do pulso deixa a parede da fibra levemente acesa
  float pw = pulso(p.x) * 0.05;
  float hp = PER * 0.5; float xb = (floor(p.x / hp) + 0.5) * hp; // quiques: onde zig = ±RI
  float lado = zig(xb) > 0.0 ? 1.0 : -1.0;
  vec3 pb = vec3(xb, 0.5 + lado * R, 0.0); float db = length(p - pb);
  vec3 flash = corLuz * 0.9 * exp(-db * db / 0.0025) * pulso(xb) * luz;
  return F * refl + (1.0 - F) * (dd + atras * 0.95) + corLuz * pw * (0.4 + 0.6 * pow(1.0 - abs(dot(n, -rd)), 3.0)) * luz + flash;
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
