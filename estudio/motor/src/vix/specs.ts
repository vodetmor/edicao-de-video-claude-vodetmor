import {Spec, Pal, Clip, Ev} from './tema';
import tl1 from './data/tl1.json';
import tl2 from './data/tl2.json';
import tl3 from './data/tl3.json';
import tl4 from './data/tl4.json';

// Âncora: início (s) da n-ésima palavra que começa com o texto (sem acento, minúscula).
const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9$ ]/g, '');
const mk = (pal: Pal[]) => (txt: string, n = 0) => {
  const k = norm(txt);
  const hits = pal.filter((p) => norm(p.w).startsWith(k));
  if (!hits[n]) throw new Error(`âncora não achada: ${txt}#${n}`);
  return hits[n].s;
};
const fimDe = (pal: Pal[]) => pal[pal.length - 1].e + 1.5;
const rel = (t: number, t0: number) => Math.max(0, t - t0);
const C = (src: 'c2' | 'c4', ss: number, t0: number, t1: number, zoom = 1.2, ox = 82, oy = 62): Clip => ({src, ss, t0, t1, zoom, ox, oy});
const utm = (n: number) => `https://vixplaytv.com/teste?utm_source=meta&utm_medium=paid&utm_campaign=criativo${n}`;

// ---------- Criativo 1: gancho de preço (voz: roteiro (1).mp3) ----------
const r1 = (): Spec => {
  const pal = tl1 as Pal[]; const a = mk(pal); const dur = fimDe(pal);
  const tCta = a('toque');
  const tCanais = a('canais'), tTudo = a('tudo'), tPrim = a('primeiro');
  const tConh = a('conheca');
  const tDentro = a('dentro');
  const ev: Ev[] = [
    {t0: 0, t1: tConh + 0.9, bloco: 'Gancho', p: {titulo: 'A conta pesa?', sub: 'Uma assinatura aqui, outra ali', colapsa: a('conta') + 0.2}},
    {t0: tDentro - 0.1, t1: tTudo - 0.1, bloco: 'Secao', p: {titulo: 'O que tem dentro', chips: [
      {l: 'Canais ao vivo', t: rel(tCanais, tDentro - 0.1)}, {l: 'Filmes', t: rel(a('filmes'), tDentro - 0.1)}, {l: 'Séries', t: rel(a('series'), tDentro - 0.1)},
      {l: 'Doramas', t: rel(a('doramas'), tDentro - 0.1)}, {l: 'Novelas', t: rel(a('novelas'), tDentro - 0.1), d: true}]}},
    {t0: tTudo, t1: tPrim - 0.1, bloco: 'Telas'},
    {t0: tPrim, t1: tCta - 0.1, bloco: 'Preco', p: {renova: false, tNum: rel(a('r$'), tPrim), tPix: rel(a('pix'), tPrim) - 0.1}},
    {t0: tCta, t1: dur, bloco: 'CTA', p: {horas: false}},
  ];
  const clips = [C('c4', 10, tConh - 0.2, tCanais + 0.6), C('c4', 47.5, tCanais + 0.6, a('doramas') - 0.1, 1.2, 70), C('c4', 67, a('doramas') - 0.1, tTudo, 1.2, 70), C('c2', 36, tTudo, tPrim, 1.25, 85, 70), C('c4', 72.5, tPrim, tCta, 1.2)];
  return {id: 'r1', audio: 'vix/r1.mp3', dur, pal, clips, ev, utm: utm(1)};
};

// ---------- Criativo 2: o que tem dentro e economia (voz: roteiro (4).mp3) ----------
const r2 = (): Spec => {
  const pal = tl2 as Pal[]; const a = mk(pal); const dur = fimDe(pal);
  const tVeja = a('veja'), tCanais = a('canais'), tFilmes = a('filmes', 1), tSeries = a('series', 1);
  const tTudo = a('tudo'), tPreco = a('primeiro'), tSup = a('qualquer'), tCta = a('toque');
  const ev: Ev[] = [
    {t0: 0, t1: tVeja + 0.6, bloco: 'Gancho', p: {titulo: 'Quanto você paga por mês?', sub: 'Uma assinatura aqui, outra ali', colapsa: a('dinheiro') + 0.3}},
    {t0: tCanais - 0.1, t1: tFilmes - 0.1, bloco: 'Secao', p: {titulo: 'Canais ao vivo', chips: [
      {l: 'Esportes', t: rel(a('esportes'), tCanais - 0.1)}, {l: 'Filmes e séries', t: rel(a('filmes'), tCanais - 0.1)}, {l: 'Infantil', t: rel(a('infantil'), tCanais - 0.1)},
      {l: 'Documentários', t: rel(a('documentarios'), tCanais - 0.1)}, {l: 'Abertos e fechados', t: rel(a('canais', 1), tCanais - 0.1), d: true}]}},
    {t0: tFilmes - 0.05, t1: tSeries - 0.1, bloco: 'Secao', p: {titulo: 'Filmes', chips: [
      {l: 'Lançamentos', t: rel(a('lancamentos'), tFilmes - 0.05), d: true}, {l: 'Para todos os gostos', t: rel(a('categorias'), tFilmes - 0.05)}]}},
    {t0: tSeries - 0.05, t1: tTudo - 0.1, bloco: 'Secao', p: {titulo: 'E mais', chips: [
      {l: 'Séries', t: 0.1}, {l: 'Doramas', t: rel(a('doramas'), tSeries - 0.05)}, {l: 'Novelas', t: rel(a('novelas'), tSeries - 0.05), d: true}]}},
    {t0: tTudo, t1: tPreco - 0.1, bloco: 'Telas'},
    {t0: tPreco, t1: tSup - 0.1, bloco: 'Preco', p: {tNum: rel(a('r$ 35'), tPreco), tRenova: rel(a('renovacao'), tPreco), tPix: rel(a('pagamento'), tPreco) + 0.3}},
    {t0: tSup, t1: tCta - 0.1, bloco: 'Suporte'},
    {t0: tCta, t1: dur, bloco: 'CTA', p: {horas: true}},
  ];
  const clips = [C('c4', 10, tVeja + 0.3, tCanais + 2), C('c4', 16, tCanais + 2, tFilmes), C('c4', 47, tFilmes, tFilmes + 2.8, 1.2, 70), C('c2', 37, tFilmes + 2.8, tSeries, 1.25, 85, 70),
    C('c4', 67, tSeries, tTudo, 1.2, 70), C('c2', 41, tTudo, tPreco, 1.25, 85, 70), C('c4', 72, tPreco, tSup), C('c2', 44, tSup, tCta, 1.25, 85, 70)];
  return {id: 'r2', audio: 'vix/r2.mp3', dur, pal, clips, ev, utm: utm(2)};
};

// ---------- Criativo 3: dor, solução e o que tem dentro (voz: roteiro (3).mp3) ----------
const r3 = (): Spec => {
  const pal = tl3 as Pal[]; const a = mk(pal); const dur = fimDe(pal);
  const tViX = a('vixplay'), tEsc = a('voce'), tDep = a('depois'), tOlha = a('olha');
  const tTelas = a('3', 0), tPreco = a('primeiro'), tCta = a('quer');
  const tCh = a('canais');
  const ev: Ev[] = [
    {t0: 0, t1: tViX, bloco: 'Dor', p: {frases: [{l: 'Já assinou TV pela internet?', t: 0}, {l: 'O preço sobe.', t: a('preco')}, {l: 'O aplicativo complica.', t: a('aplicativo')}, {l: 'Ninguém responde.', t: a('ninguem') - 0.1}]}},
    {t0: tViX, t1: tEsc - 0.1, bloco: 'Titulo', p: {l1: 'Feita para ser', l2: 'simples'}},
    {t0: tEsc, t1: tDep - 0.1, bloco: 'Passos', p: {ts: [0.3, rel(a('paga'), tEsc), rel(a('recebe'), tEsc)]}},
    {t0: tDep, t1: tOlha - 0.1, bloco: 'Telas', p: {a: 'Tutorial para ', b: 'cada aparelho', sub: 'Smart TV, TV Box e celular'}},
    {t0: tOlha, t1: tTelas - 1.2, bloco: 'Secao', p: {titulo: 'O que tem dentro', chips: [
      {l: 'Canais ao vivo', t: rel(tCh, tOlha)}, {l: 'Esportes', t: rel(a('esportes'), tOlha)}, {l: 'Filmes e séries', t: rel(a('filmes'), tOlha)}, {l: 'Infantil', t: rel(a('infantil'), tOlha)},
      {l: 'Documentários', t: rel(a('documentarios'), tOlha)}, {l: 'Filmes', t: rel(a('filmes', 1), tOlha)}, {l: 'Séries', t: rel(a('series', 1), tOlha)}, {l: 'Doramas', t: rel(a('doramas'), tOlha)}, {l: 'Novelas', t: rel(a('novelas'), tOlha), d: true}]}},
    {t0: tTelas - 1.1, t1: tPreco - 0.1, bloco: 'Telas'},
    {t0: tPreco, t1: tCta - 0.1, bloco: 'Preco', p: {tNum: rel(a('r$ 35'), tPreco), tRenova: rel(a('renovacao'), tPreco), tPix: rel(a('sem', 0), tPreco)}},
    {t0: tCta, t1: dur, bloco: 'CTA', p: {horas: true}},
  ];
  const clips = [C('c4', 10, tViX, tDep), C('c2', 36, tDep, tOlha, 1.25, 85, 70), C('c4', 17, tOlha, a('filmes', 1) - 0.2), C('c4', 47, a('filmes', 1) - 0.2, a('doramas') - 0.3, 1.2, 70),
    C('c4', 67, a('doramas') - 0.3, tTelas - 1.1, 1.2, 70), C('c4', 72, tTelas - 1.1, tCta)];
  return {id: 'r3', audio: 'vix/r3.mp3', dur, pal, clips, ev, utm: utm(3)};
};

// ---------- Criativo 4: passeio por dentro do aplicativo (voz: roteiro (2).mp3) ----------
const r4 = (): Spec => {
  const pal = tl4 as Pal[]; const a = mk(pal); const dur = fimDe(pal);
  const tCanais = a('canais'), tFilmes = a('filmes', 1), tSeries = a('series', 1), tNov = a('novelas'), tTudo = a('tudo');
  const tPreco = a('primeiro'), tSup = a('duvida') - 0.4, tCta = a('quer');
  const ev: Ev[] = [
    {t0: 0, t1: tCanais - 0.05, bloco: 'Titulo', p: {l1: 'Por dentro da', l2: 'VixPlay TV'}},
    {t0: tCanais - 0.05, t1: tFilmes - 0.1, bloco: 'Secao', p: {titulo: 'Canais ao vivo', chips: [
      {l: 'Esportes', t: rel(a('esportes'), tCanais)}, {l: 'Filmes e séries', t: rel(a('filmes'), tCanais)}, {l: 'Infantil', t: rel(a('infantil'), tCanais)},
      {l: 'Documentários', t: rel(a('documentarios'), tCanais)}, {l: 'Abertos', t: rel(a('abertos'), tCanais)}, {l: 'Fechados', t: rel(a('fechados'), tCanais), d: true}]}},
    {t0: tFilmes - 0.05, t1: tSeries - 0.1, bloco: 'Secao', p: {titulo: 'Filmes', chips: [
      {l: 'Lançamentos', t: rel(a('lancamentos'), tFilmes), d: true}, {l: 'Ação', t: rel(a('acao'), tFilmes)}, {l: 'Comédia', t: rel(a('comedia'), tFilmes)}, {l: 'Drama', t: rel(a('drama'), tFilmes)}, {l: 'Infantil', t: rel(a('infantil', 1), tFilmes)}]}},
    {t0: tSeries - 0.05, t1: tNov - 0.1, bloco: 'Secao', p: {titulo: 'Séries', chips: [
      {l: 'Várias temporadas', t: rel(a('temporadas'), tSeries)}, {l: 'Doramas', t: rel(a('doramas'), tSeries), d: true}]}},
    {t0: tNov - 0.05, t1: tTudo - 0.1, bloco: 'Secao', p: {titulo: 'Novelas', chips: [{l: 'Para não perder um capítulo', t: rel(a('capitulo'), tNov), d: true}]}},
    {t0: tTudo, t1: tPreco - 0.1, bloco: 'Telas'},
    {t0: tPreco, t1: tSup - 0.1, bloco: 'Preco', p: {tNum: rel(a('r$ 35'), tPreco), tRenova: rel(a('renovacao'), tPreco), tPix: rel(a('pix'), tPreco)}},
    {t0: tSup, t1: tCta - 0.05, bloco: 'Suporte'},
    {t0: tCta, t1: dur, bloco: 'CTA', p: {horas: true}},
  ];
  const clips = [C('c4', 10, 0, tCanais), C('c4', 14.6, tCanais, tFilmes), C('c4', 47, tFilmes, a('categorias') - 0.2, 1.2, 70), C('c4', 59, a('categorias') - 0.2, tSeries, 1.2, 75),
    C('c4', 64.5, tSeries, tNov, 1.2, 70), C('c4', 72, tNov, tTudo), C('c2', 38, tTudo, tPreco, 1.25, 85, 70), C('c4', 74.5, tPreco, tSup), C('c2', 44, tSup, tCta, 1.25, 85, 70)];
  return {id: 'r4', audio: 'vix/r4.mp3', dur, pal, clips, ev, utm: utm(4)};
};

export const SPECS: Record<string, Spec> = {r1: r1(), r2: r2(), r3: r3(), r4: r4()};
