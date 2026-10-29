// O que o roteiro visual (projeto/roteiro-visual.json) pode pedir. Quem escreve o roteiro é o Claude, a partir
// da transcrição; quem desenha é o código. Toda entrada e saída é presa a uma PALAVRA falada (ver ancora.ts).
import type {Marca} from './marca';

export type Formato = '9:16' | '4:5' | '1:1' | '16:9';
export type Layout = 'cheio' | 'split' | 'split-cima' | 'moldura' | 'tela';
export type EstiloLegenda = 'limpa' | 'destaque' | 'forte' | 'caixa' | 'nenhuma';

export type Item = {texto: string; de?: string; icone?: string};
export type Elemento =
  | {tipo: 'titulo'; texto: string; apoio?: string; de: string; ate?: string}
  | {tipo: 'lista'; itens: Item[]; de?: string; ate?: string; icone?: string}
  | {tipo: 'numero'; valor: number; prefixo?: string; sufixo?: string; rotulo?: string; de: string; ate?: string; casas?: number}
  | {tipo: 'passos'; itens: Item[]; de?: string; ate?: string}
  | {tipo: 'grafico'; pontos?: number[]; rotulo?: string; nota?: string; de: string; ate?: string}
  | {tipo: 'comparar'; esquerda: Item & {titulo: string}; direita: Item & {titulo: string}; de: string; ate?: string}
  | {tipo: 'icone'; icone: string; texto?: string; de: string; ate?: string}
  | {tipo: 'imagem'; arquivo: string; legenda?: string; de: string; ate?: string; altura?: number}
  | {tipo: 'cta'; texto: string; apoio?: string; de: string; ate?: string};

export type Cena = {de: string; ate?: string; layout: Layout; elementos?: Elemento[]};
export type Zoom = {de: string; ate?: string; nivel: number};

export type Roteiro = {
  estilo: string; // nome no catálogo (estilos/CATALOGO.md); define layout padrão e acabamento
  formato?: Formato;
  legenda?: {estilo?: EstiloLegenda; base?: number; tamanho?: number};
  marca?: Partial<Marca>;
  cenas?: Cena[];
  zooms?: Zoom[];
  automatico?: {zooms?: boolean}; // punch-ins automáticos por frase no layout cheio (padrão: true)
};

export type Palavra = {w: string; s: number; e: number; f: number; fe: number};
export type Rosto = {fps: number; w: number; h: number; n: number; cx: number[]; cy: number[]; tam: number[]};

export type Entrada = {
  roteiro: Roteiro;
  palavras: {w: string; s: number; e: number}[];
  rosto?: Rosto | null;
  base: {arquivo: string; fps: number; duracao: number; largura: number; altura: number};
  marca?: Partial<Marca>;
};
