// Camadas GLSL transparentes que vão POR CIMA do React.
import {COMUM} from './comum';

// Dissolve: o papel "come" a cena por um limiar de ruído; um fio azul fino corre na frente da borda.
// prog 0 = nada, 1 = tela toda de papel. Saída pré-multiplicada (alpha).
export const DISSOLVE = /* glsl */ `
${COMUM}
uniform float prog, escala;
void main() {
  vec2 p = gl_FragCoord.xy / res.y;
  float n = 0.5 + 0.5 * fbm(p * escala + 7.0, 5);
  n = mix(n, 1.0 - gl_FragCoord.x / res.x, 0.55); // varre da direita para a esquerda, com borda orgânica
  float lim = prog * 1.25 - 0.12;
  float d = lim - n;
  float papel = smoothstep(-0.002, 0.002, d);
  float frente = fio(d, 2.2) * step(0.0005, prog) * step(prog, 0.999);
  vec3 c = mix(toSRGB(C_PAPEL), toSRGB(C_AZUL), frente);
  float a = max(papel, frente);
  fragColor = vec4(c * a, a);
}`;

// Acabamento de filme: grão em duas escalas (mais forte nos meios-tons) + vinheta suave.
// Usar com mixBlendMode 'overlay': 0,5 = neutro, acima clareia, abaixo escurece.
// corte: posição x (0..1) a partir da qual o acabamento vale (para a tela dividida "sem / com").
export const ACABAMENTO = /* glsl */ `
${COMUM}
uniform float grao, vinheta, corte, quadro;
void main() {
  vec2 fc = gl_FragCoord.xy;
  float g1 = hash12(fc + fract(quadro * 0.1337) * 1000.0) - 0.5;
  float g2 = hash12(floor(fc / 2.0) + fract(quadro * 0.0713) * 1000.0) - 0.5;
  float g = (g1 * 0.6 + g2 * 0.4) * grao;
  vec2 dc = gl_FragCoord.xy / res - 0.5;
  float v = smoothstep(0.25, 0.95, length(dc * vec2(1.0, 0.82))) * vinheta;
  float on = step(corte, gl_FragCoord.x / res.x);
  fragColor = vec4(vec3(0.5 + (g - v * 0.5) * on), 1.0);
}`;
