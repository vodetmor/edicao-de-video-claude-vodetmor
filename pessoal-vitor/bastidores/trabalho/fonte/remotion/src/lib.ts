import tempo from './data/tempo.json';
export const FPS = 30;
const byIdx: Record<number, [number, number]> = {};
for (const [i, s, e] of tempo.w as [number, number, number][]) byIdx[i] = [s, e];
// quadro (no vídeo final) em que a palavra de índice i (transcrição original) começa / termina
export const F = (i: number, d = 0) => Math.round((byIdx[i] ?? byIdx[nearest(i)])[0] * FPS) + d;
export const FE = (i: number, d = 0) => Math.round((byIdx[i] ?? byIdx[nearest(i)])[1] * FPS) + d;
function nearest(i: number) { let k = i; while (!(k in byIdx) && k > 0) k--; return k; }
export const GAP_F = Math.round(tempo.gapOut * FPS);      // início da pausa inserida (3D), no vídeo final
export const SHOW_F = Math.round(tempo.showAt * FPS);     // vitrine: trecho da aula com o som dela
export const SHOW_LEN = Math.round(tempo.show * FPS);
export const SHOW_DE = tempo.showDe;
// trechos da fala mantidos depois dos cortes: [início na fonte, fim na fonte, início no vídeo final] em segundos
export const SEGS = tempo.segs as [number, number, number][];
export const GAP_LEN = Math.round(tempo.gap * FPS);
export const END_F = Math.round(tempo.endOut * FPS); // fim da fala; depois, cartão final
export const TOTAL = tempo.frames;
// cores da interface do Claude (amostradas dos prints do app escuro)
export const UI = {bg: '#151515', side: '#111111', card: '#1A1A19', field: '#212121', line: '#2C2C2A', sel: '#2A2A29',
  text: '#ECEAE6', mute: '#8E8C87', faint: '#5E5C58', blue: '#2F7CF6', coral: '#D97757'};
export const PAPEL = '#F5F5F7';
export const TINTA = '#1D1D1F';
