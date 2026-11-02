// Onde cada coisa fica em cada layout e formato. Números em px do quadro final.
// Vertical: área de segurança das redes (TikTok/Reels/Shorts cobrem ~12% de baixo com descrição e a coluna
// direita a partir de ~45% da altura com botões). Por isso nada importante encosta na direita no 9:16
// e nenhuma legenda desce abaixo de ~84% da altura. A moldura do 9:16 fica centrada (longe da coluna de botões).
import type {Formato, Layout} from './tipos';

export type Caixa = {x: number; y: number; w: number; h: number; r: number};
export type Zona = {
  apresentador: Caixa | null; // null = só explicação na tela (a voz continua)
  area: Caixa | null; // onde os elementos explicativos se empilham
  legenda: {y: number; x: number; w: number; sobre: 'video' | 'papel'; topo?: boolean}; // y = base da última linha (topo: y = topo da 1ª)
  alvo: {tam: number; y: number}; // rosto: fração da altura da caixa (0 = só cobrir) e altura do centro do rosto
};

export const DIM: Record<Formato, [number, number]> = {
  '9:16': [1080, 1920],
  '4:5': [1080, 1350],
  '1:1': [1080, 1080],
  '16:9': [1920, 1080],
};

const cx = (W: number, H: number) => (x: number, y: number, w: number, h: number, r = 0): Caixa => ({
  x: x * W, y: y * H, w: w * W, h: h * H, r,
});

const vertical = (lay: Layout, W: number, H: number): Zona => {
  const c = cx(W, H);
  const lg = (y: number, sobre: 'video' | 'papel', topo = false) => ({y: y * H, x: 0.067 * W, w: 0.866 * W, sobre, topo});
  switch (lay) {
    case 'cheio':
      return {apresentador: c(0, 0, 1, 1), area: c(0.067, 0.1, 0.866, 0.3), legenda: lg(0.745, 'video'), alvo: {tam: 0, y: 0.38}};
    case 'split':
      return {apresentador: c(0, 0, 1, 0.5), area: c(0.067, 0.592, 0.866, 0.285), legenda: lg(0.517, 'papel', true), alvo: {tam: 0.34, y: 0.5}};
    case 'split-cima':
      return {apresentador: c(0, 0.46, 1, 0.54), area: c(0.067, 0.075, 0.866, 0.35), legenda: lg(0.835, 'video'), alvo: {tam: 0.34, y: 0.36}};
    case 'moldura':
      return {apresentador: c(0.2, 0.505, 0.6, 0.345, 48), area: c(0.067, 0.07, 0.866, 0.35), legenda: lg(0.487, 'papel'), alvo: {tam: 0.38, y: 0.45}};
    case 'tela':
      return {apresentador: null, area: c(0.067, 0.09, 0.866, 0.66), legenda: lg(0.82, 'papel'), alvo: {tam: 0, y: 0.4}};
  }
};

const horizontal = (lay: Layout, W: number, H: number): Zona => {
  const c = cx(W, H);
  const lg = (x: number, w: number, y: number, sobre: 'video' | 'papel') => ({y: y * H, x: x * W, w: w * W, sobre});
  switch (lay) {
    case 'cheio':
      return {apresentador: c(0, 0, 1, 1), area: c(0.05, 0.08, 0.5, 0.36), legenda: lg(0.15, 0.7, 0.87, 'video'), alvo: {tam: 0, y: 0.4}};
    case 'split':
      return {apresentador: c(0.5, 0, 0.5, 1), area: c(0.05, 0.1, 0.4, 0.66), legenda: lg(0.04, 0.42, 0.9, 'papel'), alvo: {tam: 0.34, y: 0.42}};
    case 'split-cima':
      return {apresentador: c(0, 0, 0.5, 1), area: c(0.55, 0.1, 0.4, 0.66), legenda: lg(0.54, 0.42, 0.9, 'papel'), alvo: {tam: 0.34, y: 0.42}};
    case 'moldura':
      return {apresentador: c(0.62, 0.17, 0.335, 0.66, 40), area: c(0.05, 0.1, 0.53, 0.68), legenda: lg(0.04, 0.55, 0.9, 'papel'), alvo: {tam: 0.36, y: 0.42}};
    case 'tela':
      return {apresentador: null, area: c(0.06, 0.1, 0.88, 0.68), legenda: lg(0.15, 0.7, 0.9, 'papel'), alvo: {tam: 0, y: 0.4}};
  }
};

export const zona = (lay: Layout, fmt: Formato): Zona => {
  const [W, H] = DIM[fmt];
  return fmt === '16:9' ? horizontal(lay, W, H) : vertical(lay, W, H);
};

// Recorte do vídeo dentro da caixa: cobre a caixa inteira, rosto no ponto pedido, nunca mostra borda vazia.
export const recorte = (
  caixa: {w: number; h: number},
  src: {w: number; h: number},
  rosto: {cx: number; cy: number; tam: number},
  alvo: {tam: number; y: number},
  zoom = 1,
) => {
  const cobre = Math.max(caixa.w / src.w, caixa.h / src.h);
  const porRosto = alvo.tam > 0 ? (alvo.tam * caixa.h) / Math.max(0.05, rosto.tam * src.h) : 0;
  const s = Math.max(cobre, porRosto) * zoom;
  const vw = src.w * s;
  const vh = src.h * s;
  let left = caixa.w / 2 - rosto.cx * vw;
  let top = caixa.h * alvo.y - rosto.cy * vh;
  left = Math.min(0, Math.max(caixa.w - vw, left));
  top = Math.min(0, Math.max(caixa.h - vh, top));
  return {s, left, top, vw, vh};
};
