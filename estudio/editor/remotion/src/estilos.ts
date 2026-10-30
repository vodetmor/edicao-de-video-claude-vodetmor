// Estilos prontos: o que cada um usa como padrão. O roteiro pode trocar o layout cena a cena.
// O catálogo completo (prontos + planejados) e quando usar cada um: estudio/editor/estilos/CATALOGO.md
import type {EstiloLegenda, Layout} from './tipos';

export type Estilo = {nome: string; base: Layout; legenda: EstiloLegenda; zooms: boolean; dica: string};

export const ESTILOS: Record<string, Estilo> = {
  'corte-limpo': {nome: 'Corte limpo', base: 'cheio', legenda: 'limpa', zooms: true,
    dica: 'apresentador em tela cheia, punch-in alternado por frase, cartões curtos por cima'},
  split: {nome: 'Tela dividida', base: 'split', legenda: 'limpa', zooms: false,
    dica: 'apresentador em cima, explicação se montando embaixo'},
  painel: {nome: 'Painel em cima', base: 'split-cima', legenda: 'limpa', zooms: false,
    dica: 'painel explicativo em cima, apresentador embaixo'},
  moldura: {nome: 'Moldura e quadro', base: 'cheio', legenda: 'limpa', zooms: true,
    dica: 'tela cheia; nas explicações o apresentador vai para uma moldura e o quadro ocupa o resto'},
  'reels-forte': {nome: 'Reels forte', base: 'cheio', legenda: 'forte', zooms: true,
    dica: 'legenda grande de 1 a 3 palavras (fora do DESIGN-SYSTEM: só a pedido), punch-ins'},
};

export const estilo = (nome: string): Estilo => {
  const e = ESTILOS[nome];
  if (!e) throw new Error(`estilo desconhecido: "${nome}". Disponíveis: ${Object.keys(ESTILOS).join(', ')}`);
  return e;
};
