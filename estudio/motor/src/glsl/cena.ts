// Cena 3D da vitrine: dois anéis entrelaçados calculados por raymarching num estúdio sem fim.
// Todos os momentos do vídeo são uniforms (presos a palavras na composição):
//   yaw, el, dist, ox      câmera (giro, altura, distância, deslocamento do objeto na tela)
//   luzAz, envRot          direção da luz principal e giro do softbox refletido
//   scan                   0..1 posição da varredura "raio X" (à esquerda dela, o objeto vira fórmula)
//   pix                    tamanho do bloco de pixel (1 = nítido)
//   derrete, tinta         objeto afunda no chão / tinta azul se espalha pelo chão (raio)
//   palco                  1 = estúdio claro, 0 = palco escuro com luz de recorte
import {COMUM, LUZ} from './comum';

export const CENA = /* glsl */ `
${COMUM}
uniform float yaw, el, dist, ox, oy, luzAz, envRot, scan, pix, derrete, tinta, palco, giro, aa;
const float CHAO = -0.78;

float objeto(vec3 p) {
  p.y -= 0.12 - derrete * 1.9;
  p.xz *= rot2(giro);
  p.xy *= rot2(0.42);
  float a = sdTorus(p - vec3(-0.3, 0.0, 0.0), vec2(0.58, 0.17));
  vec3 q = p - vec3(0.3, 0.0, 0.0); q.yz *= rot2(1.5708);
  float b = sdTorus(q, vec2(0.58, 0.17));
  return min(a, b);
}
float map(vec3 p) { return smin(objeto(p), p.y - CHAO, 0.02 + derrete * 0.12); }
${LUZ}

vec3 luzDir() { return normalize(vec3(cos(luzAz) * 0.75, 0.95, sin(luzAz) * 0.75)); }

// ambiente de estúdio refletido: cyclorama claro + um softbox retangular (gira com envRot)
vec3 ambiente(vec3 d) {
  vec3 base = mix(C_PAPEL * 0.55, C_PAPEL * 1.05, sat(d.y * 0.6 + 0.55));
  base = mix(base, C_ESCURO * 0.4, 1.0 - palco);
  vec3 r = d; r.xz *= rot2(envRot);
  float box = smoothstep(0.18, 0.15, abs(r.x + 0.55)) * smoothstep(0.35, 0.3, abs(r.y - 0.45)) * step(0.0, -r.z);
  float tira = smoothstep(0.035, 0.02, abs(r.x - 0.62)) * smoothstep(0.6, 0.5, abs(r.y - 0.2)) * step(0.0, -r.z);
  return base + vec3(4.0) * box + vec3(2.5) * tira * (1.0 - palco * 0.6);
}

// tinta azul que se espalha pelo chão: fbm com distorção de domínio, desenhada como relevo de linhas
vec3 chaoTinta(vec2 xz, vec3 papel) {
  float r = length(xz);
  vec2 q = xz * 0.42;
  vec2 w = vec2(fbm(q + vec2(0.0, t * 0.08), 3), fbm(q + vec2(5.2, 1.3) - t * 0.07, 3));
  float f = fbm(q + 1.1 * w, 3);
  float borda = tinta - r + 0.3 * fbm(xz * 0.9 + 3.0, 3);
  float m = smoothstep(0.0, 0.012, borda);
  // tinta: um campo azul cheio com veios finos de papel (curvas de nível do mesmo ruído)
  vec3 c = mix(C_AZUL * 0.75, C_AZUL * 1.08, smoothstep(-0.4, 0.4, f));
  c = mix(c, papel, fio(fract(f * 6.0) - 0.5, 1.2) * 0.55);
  float frente = fio(borda, 1.4) * step(0.001, tinta);
  c = mix(papel, c, m);
  return mix(c, C_AZUL, frente * 0.9);
}

vec3 camera(vec2 frag, out vec3 ro) {
  vec2 uv = (frag - 0.5 * res) / res.y;
  uv.x -= ox; uv.y -= oy;
  vec3 alvo = vec3(0.0, -0.05 - derrete * 0.4, 0.0);
  ro = alvo + dist * vec3(sin(yaw) * cos(el), sin(el), cos(yaw) * cos(el));
  vec3 f = normalize(alvo - ro), r = normalize(cross(f, vec3(0, 1, 0))), u = cross(r, f);
  return normalize(f * 2.1 + r * uv.x + u * uv.y);
}

vec3 render(vec2 frag) {
  vec3 ro; vec3 rd = camera(frag, ro);
  vec3 papel = mix(C_ESCURO, C_PAPEL, palco);
  float d = 0.0; bool hit = false;
  for (int i = 0; i < 140; i++) { float h = map(ro + rd * d); if (h < 2e-4 * d + 1e-4) { hit = true; break; } d += h; if (d > 30.0) break; }
  if (!hit) return papel;
  vec3 p = ro + rd * d, n = normal(p), v = -rd, L = luzDir();
  float sh = sombra(p + n * 0.003, L, 9.0), oc = oclusao(p, n);
  float dObj = objeto(p), dChao = p.y - CHAO;
  float bl = 0.004 + derrete * 0.05;
  float kObj = smoothstep(-bl, bl, dChao - dObj);
  // material do objeto: cerâmica azul acetinada com verniz (reflexo do softbox)
  float dif = sat(dot(n, L) * 0.85 + 0.15);
  vec3 azul = C_AZUL * mix(0.08, 1.0, dif * mix(0.25, 1.0, sh)) * mix(0.45, 1.0, oc);
  vec3 rf = reflect(rd, n);
  float fr = fresnel(n, v, 0.04);
  vec3 esp = ambiente(rf) * fr * mix(0.35, 1.0, sh) * oc;
  float recorte = pow(1.0 - sat(dot(n, v)), 3.0) * (1.0 - palco) * 0.9;
  vec3 cObj = azul + esp + C_AZUL * recorte * 1.5;
  // chão: some no fundo (estúdio infinito); só a sombra e a oclusão aparecem
  float luzChao = mix(0.62, 1.0, sh) * mix(0.55, 1.0, oc);
  vec3 cChao = papel * luzChao;
  if (palco < 1.0) { // palco escuro: poça de luz em volta do objeto
    float poca = exp(-dot(p.xz, p.xz) * 0.5);
    cChao = mix(cChao, C_PAPEL * 0.22 * poca * luzChao, 1.0 - palco);
  }
  if (tinta > 0.0) cChao = chaoTinta(p.xz, cChao);
  vec3 c = mix(cChao, cObj, kObj);
  return mix(c, papel, smoothstep(9.0, 22.0, d) * (1.0 - kObj));
}

// "raio X": o objeto visto como a sua fórmula, no plano que passa pelo centro e encara a câmera
vec3 raioX(vec2 frag) {
  vec3 ro; vec3 rd = camera(frag, ro);
  vec3 alvo = vec3(0.0, -0.05, 0.0);
  vec3 f = normalize(alvo - ro);
  float tt = dot(alvo - ro, f) / dot(rd, f);
  vec3 p = ro + rd * tt;
  float d = objeto(p);
  vec3 c = C_PAPEL;
  vec2 g = p.xy * 4.0; float grade = max(fio(fract(g.x) - 0.5, 1.0), fio(fract(g.y) - 0.5, 1.0));
  c = mix(c, C_CINZA, grade * 0.12);
  c = mix(c, C_AZUL * 1.4 + 0.05, preenche(d) * 0.10);
  float iso = fio(fract(d * 11.0 + 0.5) - 0.5, 1.0) * (1.0 - smoothstep(0.0, 0.9, abs(d)));
  c = mix(c, C_AZUL, iso * 0.55);
  c = mix(c, C_AZUL * 0.8, fio(d, 2.6));
  return c;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float bloco = max(pix, 1.0);
  bool pixelado = bloco > 1.5;
  vec2 fq = pixelado ? (floor(frag / bloco) + 0.5) * bloco : frag;
  float sx = fq.x / res.x;
  vec3 c = vec3(0.0);
  int n = (aa > 1.5 && !pixelado) ? 2 : 1;
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    if (i >= n || j >= n) continue;
    vec2 o = n == 1 ? vec2(0.0) : (vec2(float(i), float(j)) - 0.5) * 0.5;
    c += (sx < scan) ? raioX(fq + o) : render(fq + o);
  }
  c /= float(n * n);
  // fio azul da varredura
  if (scan > 0.0 && scan < 1.0) c = mix(c, C_AZUL, (1.0 - smoothstep(0.0, 1.6, abs(frag.x - scan * res.x))) * 0.95);
  vec3 s = toSRGB(sat(c));
  if (pixelado && bloco > 7.0) { vec2 e = abs(fract(frag / bloco) - 0.5) * bloco; float lin = step(bloco * 0.5 - 1.0, max(e.x, e.y)); s = mix(s, vec3(1.0), lin * 0.55); }
  s += (hash12(frag + fract(t) * 917.0) - 0.5) / 255.0;
  fragColor = vec4(s, 1.0);
}
`;
