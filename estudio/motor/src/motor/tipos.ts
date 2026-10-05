import type {Palavra} from './ancora';
import type {Formato} from './formatos';

// Um evento = "a partir desta palavra, mostre este bloco (e/ou toque este som)".
export type Evento = {
  de: string; // âncora de entrada (ver ancora.ts)
  ate?: string; // âncora de saída; sem ela o bloco fica até o fim
  bloco?: string; // nome no catálogo (blocos/index.ts)
  props?: Record<string, any>;
  som?: string; // arquivo em public/audio sem .wav
  vol?: number;
};
export type Variante = {id: string; nome?: string; formato: Formato; fundo?: string; eventos: Evento[]};
export type Spec = {
  id: string;
  descricao?: string;
  fps?: number;
  duracao: string; // âncora do fim
  audio: {voz: string; cama?: string; camaVol?: number};
  variantes: Variante[];
};
export type EntradaVideo = {spec: Spec; variante: string; palavras: Palavra[]};

// O que todo bloco recebe. f = quadro local (0 = entrada), t("palavra") = quadro local de uma âncora.
export type BlocoProps<P = Record<string, any>> = {
  f: number;
  dur: number;
  w: number;
  h: number;
  t: (ancora: string) => number;
  palavras: Palavra[];
  inicio: number;
  p: P;
};
