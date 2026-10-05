// Câmera do palco 2D: ponto do mundo (m) no centro da tela + escala (px/m). Viaja entre estações.
import {camera as curva, clamp01, lerp} from './tempo';

export type Cam = {cx: number; cy: number; s: number};
export const W = 1920, HH = 1080;
export const ESTACOES: Record<string, Cam> = {
  cheio: {cx: 19.2, cy: 5.6, s: 36},          // trajetória inteira
  esquerda: {cx: 36.0, cy: 5.2, s: 23.5},     // trajetória à esquerda, fórmulas à direita
  origem: {cx: 3.2, cy: 2.2, s: 92},          // vetores na origem (grandes)
  origemEsq: {cx: 6.6, cy: 2.0, s: 78},       // vetores na origem, fórmulas à direita
  bola: {cx: 0.4, cy: 0.6, s: 120},           // close na bola parada
  topo: {cx: 19.2, cy: 11.4, s: 70},          // close no ponto mais alto
  leque: {cx: 30.5, cy: 7.5, s: 21},          // família de trajetórias à esquerda, gráfico à direita
  compl: {cx: 19.8, cy: 7.0, s: 33},
  resumo: {cx: 48.3, cy: -8.2, s: 17},      // trajetória pequena no alto à esquerda, cartões embaixo          // 30° e 60°
};
// trilha: [quadro de chegada, estação, duração da viagem em quadros]
export const camAt = (f: number, trilha: [number, string, number][]): Cam => {
  let c = ESTACOES[trilha[0][1]];
  for (const [q, nome, dur] of trilha) {
    const alvo = ESTACOES[nome];
    if (f < q - dur) break;
    const t = curva(clamp01((f - (q - dur)) / dur));
    // escala em log (zoom geométrico, LICOES: zoom de app) e posição acompanhando
    const s = Math.exp(lerp(Math.log(c.s), Math.log(alvo.s), t));
    c = {cx: lerp(c.cx, alvo.cx, t), cy: lerp(c.cy, alvo.cy, t), s};
  }
  return c;
};
export const tela = (c: Cam, x: number, y: number) => ({X: W / 2 + (x - c.cx) * c.s, Y: HH / 2 - (y - c.cy) * c.s});
