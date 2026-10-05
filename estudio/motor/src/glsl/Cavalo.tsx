// Teste: cavalo galopando feito só de código (esqueleto + formas SDF fundidas + raymarching).
// O galope é um ciclo de 0 a 1 (fase); cada perna tem seu atraso, como no galope transverso das fotos do Muybridge.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Shader} from './Shader';
import {COMUM, LUZ} from './comum';

const FRAG = /* glsl */ `
${COMUM}
uniform float fase, yaw;
bool rapido = false; // caixa envolvente só no raio principal (sombra e oclusão precisam da distância exata)
const float CHAO = -1.02;

// cone arredondado entre a e b (raios ra, rb): perna que afina
float sdCone(vec3 p, vec3 a, vec3 b, float ra, float rb) {
  vec3 ba = b - a; float l2 = dot(ba, ba); float rr = ra - rb; float a2 = l2 - rr * rr; float il2 = 1.0 / l2;
  vec3 pa = p - a; float y = dot(pa, ba); float z = y - l2; vec3 xv = pa * l2 - ba * y; float x2 = dot(xv, xv);
  float y2 = y * y * l2; float z2 = z * z * l2; float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - rb;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - ra;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - ra;
}

// ângulos de uma perna ao longo do ciclo (0..1): coxa balança, joelho dobra na recolhida
vec3 perna(vec3 raiz, float ph, float frente, out vec3 j1, out vec3 j2) {
  float s = sin(TAU * ph);
  float recolhe = smoothstep(-0.2, 0.9, sin(TAU * ph + 1.9)); // fase no ar: dobra
  float a1 = (frente > 0.5 ? 0.72 : 0.66) * s + (frente > 0.5 ? 0.05 : -0.1);
  float a2 = (frente > 0.5 ? -1.0 : 1.15) * recolhe * 1.05;
  float L1 = frente > 0.5 ? 0.62 : 0.7, L2 = 0.62, L3 = 0.24;
  vec2 d1 = vec2(sin(a1), -cos(a1));
  j1 = raiz + vec3(d1 * L1, 0.0);
  float b = a1 + a2;
  vec2 d2 = vec2(sin(b), -cos(b));
  j2 = j1 + vec3(d2 * L2, 0.0);
  float c = b - a2 * 0.55 + (frente > 0.5 ? 0.35 : -0.25) * recolhe;
  return j2 + vec3(vec2(sin(c), -cos(c)) * L3, 0.0);
}

float pernaSDF(vec3 p, vec3 raiz, float ph, float frente) {
  vec3 j1, j2; vec3 casco = perna(raiz, ph, frente, j1, j2);
  float d = sdCone(p, raiz, j1, frente > 0.5 ? 0.16 : 0.2, 0.08);
  d = smin(d, sdCone(p, j1, j2, 0.075, 0.05), 0.05);
  d = smin(d, sdCone(p, j2, casco, 0.055, 0.07), 0.03);
  return d;
}

float cavalo(vec3 p) {
  float bb = sdRoundBox(p - vec3(0.05, 0.15, 0.0), vec3(1.75, 1.3, 0.65), 0.1);
  if (rapido && bb > 0.25) return bb; // caixa que envolve o cavalo: longe dela não vale a conta inteira
  float bob = 0.07 * sin(TAU * fase * 2.0 + 0.6);
  float pitch = 0.07 * sin(TAU * fase + 1.2);
  p.y -= bob;
  p.xy *= rot2(pitch);
  // tronco: barril + peito + garupa
  float d = sdEllipsoid(p - vec3(0.0, 0.32, 0.0), vec3(0.78, 0.33, 0.3));
  d = smin(d, sdEllipsoid(p - vec3(0.62, 0.36, 0.0), vec3(0.32, 0.36, 0.28)), 0.15);
  d = smin(d, sdEllipsoid(p - vec3(-0.62, 0.42, 0.0), vec3(0.36, 0.34, 0.3)), 0.15);
  // pescoço e cabeça (balançam com a passada)
  float nb = 0.08 * sin(TAU * fase + 2.4);
  vec3 n0 = vec3(0.78, 0.55, 0.0), n1 = vec3(1.12, 1.05 + nb, 0.0);
  d = smin(d, sdCone(p, n0, n1, 0.24, 0.13), 0.12);
  vec3 h1 = n1 + vec3(0.36, -0.22, 0.0);
  d = smin(d, sdCone(p, n1, h1, 0.14, 0.085), 0.06);
  vec3 q = p - n1; q.z = abs(q.z);
  d = smin(d, sdCone(q, vec3(-0.04, 0.1, 0.05), vec3(-0.08, 0.24, 0.07), 0.035, 0.012), 0.02); // orelhas
  // cauda
  float tb = 0.15 * sin(TAU * fase + 0.3);
  d = smin(d, sdCone(p, vec3(-0.92, 0.6, 0.0), vec3(-1.25, 0.25 + tb, 0.0), 0.07, 0.035), 0.06);
  // pernas: galope transverso (traseira esq., traseira dir., dianteira esq., dianteira dir.)
  vec3 pe = p - vec3(0.0, 0.0, 0.17), pd = p + vec3(0.0, 0.0, 0.17);
  float pt = min(pernaSDF(pe, vec3(-0.62, 0.32, 0.0), fract(fase), 0.0), pernaSDF(pd, vec3(-0.62, 0.32, 0.0), fract(fase + 0.1), 0.0));
  float pf = min(pernaSDF(pe, vec3(0.6, 0.28, 0.0), fract(fase + 0.5), 1.0), pernaSDF(pd, vec3(0.6, 0.28, 0.0), fract(fase + 0.6), 1.0));
  d = smin(d, min(pt, pf), 0.09);
  return d;
}
float map(vec3 p) { return min(cavalo(p), p.y - CHAO); }
${LUZ}

vec3 render(vec2 frag) {
  vec2 uv = (frag - 0.5 * res) / res.y;
  vec3 alvo = vec3(0.05, 0.05, 0.0);
  vec3 ro = alvo + 8.6 * vec3(sin(yaw) * 0.95, 0.24, cos(yaw) * 0.95);
  vec3 f = normalize(alvo - ro), r = normalize(cross(f, vec3(0, 1, 0))), u = cross(r, f);
  vec3 rd = normalize(f * 2.3 + r * uv.x + u * uv.y);
  float d = 0.0; bool hit = false;
  rapido = true;
  for (int i = 0; i < 200; i++) { float h = map(ro + rd * d); if (h < 2e-4 * d + 1e-4) { hit = true; break; } d += h * 0.8; if (d > 40.0) break; }
  rapido = false;
  if (!hit) return C_PAPEL;
  vec3 p = ro + rd * d, n = normal(p), v = -rd;
  vec3 L = normalize(vec3(-0.5, 0.95, 0.6));
  float sh = sombra(p + n * 0.003, L, 10.0), oc = oclusao(p, n);
  if (p.y - CHAO < cavalo(p)) {
    // chão do estúdio: só sombra, oclusão e riscos finos correndo (o chão anda, o cavalo fica)
    float risco = fio(fract(p.x * 1.2 + fase * 2.0 * 1.6) - 0.5, 1.0) * 0.08 * exp(-abs(p.z) * 0.6);
    vec3 c = C_PAPEL * mix(0.6, 1.0, sh) * mix(0.55, 1.0, oc);
    c = mix(c, C_CINZA, risco);
    return mix(c, C_PAPEL, smoothstep(9.0, 22.0, d));
  }
  float dif = sat(dot(n, L) * 0.85 + 0.15);
  vec3 azul = C_AZUL * mix(0.08, 1.0, dif * mix(0.25, 1.0, sh)) * mix(0.4, 1.0, oc);
  vec3 rf = reflect(rd, n);
  vec3 amb = mix(C_PAPEL * 0.5, C_PAPEL * 1.05, sat(rf.y * 0.6 + 0.55));
  float box = smoothstep(0.18, 0.15, abs(rf.x + 0.5)) * smoothstep(0.35, 0.3, abs(rf.y - 0.45)) * step(0.0, -rf.z);
  amb += vec3(4.0) * box;
  return azul + amb * fresnel(n, v, 0.04) * mix(0.35, 1.0, sh) * oc;
}

void main() {
  vec3 c = vec3(0.0);
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) c += render(gl_FragCoord.xy + (vec2(float(i), float(j)) - 0.5) * 0.5);
  vec3 s = toSRGB(sat(c / 4.0));
  s += (hash12(gl_FragCoord.xy + fract(t) * 917.0) - 0.5) / 255.0;
  fragColor = vec4(s, 1.0);
}`;

export const Cavalo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  // 2,2 passadas por segundo; 4 s = 8,8 passadas. Câmera gira devagar de lado para 3/4.
  return (
    <AbsoluteFill style={{background: '#F5F5F7'}}>
      <Shader frag={FRAG} u={{fase: t * 2.2, yaw: 0.15 + 0.45 * Math.min(1, t / 4)}} />
    </AbsoluteFill>
  );
};
