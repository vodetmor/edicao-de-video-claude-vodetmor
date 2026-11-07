// Design system da VixPlay TV (identidade/DESIGN-SYSTEM-VIXPLAY.md). Escuro + verde neon.
export const V = {
  bg: '#010204', s1: '#060a07', s2: '#0a110b', s3: '#111c10',
  neon: '#99e200', brilho: '#b8ff1f', forte: '#00b800', fim: '#4fd000', sobre: '#061000',
  txt: '#f2f7ee', apoio: '#a7b5a2', discreto: '#6f7f6b',
  linha: 'rgba(153,226,0,0.16)', linhaForte: 'rgba(153,226,0,0.42)',
};
export const TIT = "'Montserrat', sans-serif";
export const TXT = "'Inter Variable', 'Inter', sans-serif";
export const W = 1080;
export const H = 1920;

export type Pal = {w: string; s: number; e: number};
export type Clip = {src: string; ss: number; t0: number; t1: number; zoom?: number; ox?: number; oy?: number; blur?: number};
export type Ev = {t0: number; t1: number; bloco: string; p?: any};
export type Spec = {id: string; audio: string; dur: number; pal: Pal[]; clips: Clip[]; ev: Ev[]; utm: string; limpo?: boolean; legBase?: number; blob?: boolean; legFundo?: [number, number][]};
