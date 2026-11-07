import {Spec, Pal, Clip, Ev} from './tema';
import tl1 from './data/tl1.json';
import tl2 from './data/tl2.json';
import tl3 from './data/tl3.json';
import tl4 from './data/tl4.json';
import tlh from './data/tlh.json';

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

// ---- Takes: todos os trechos limpos de c2 e c4, por tema; cada criativo sorteia ordem/enquadramento diferentes ----
type Take = {src: 'c2' | 'c4'; ss: number; blur?: number};
const POOL: Record<string, Take[]> = {
  home: [{src: 'c4', ss: 10.5}, {src: 'c4', ss: 13.5}, {src: 'c4', ss: 16.5}, {src: 'c4', ss: 19}],
  live: [{src: 'c2', ss: 10, blur: 9}, {src: 'c4', ss: 26, blur: 9}, {src: 'c2', ss: 16, blur: 9}, {src: 'c4', ss: 30, blur: 9}, {src: 'c2', ss: 22, blur: 9}, {src: 'c4', ss: 34, blur: 9}, {src: 'c2', ss: 13, blur: 9}, {src: 'c4', ss: 40, blur: 9}],
  filmes: [{src: 'c4', ss: 47}, {src: 'c2', ss: 36}, {src: 'c4', ss: 50}, {src: 'c2', ss: 39}, {src: 'c4', ss: 53}, {src: 'c2', ss: 42}],
  cat: [{src: 'c4', ss: 57}, {src: 'c4', ss: 60}, {src: 'c2', ss: 43}, {src: 'c4', ss: 55}],
  series: [{src: 'c4', ss: 66}, {src: 'c4', ss: 64.5}, {src: 'c4', ss: 69}, {src: 'c4', ss: 67.5}],
  novelas: [{src: 'c4', ss: 72}, {src: 'c4', ss: 75}, {src: 'c4', ss: 78}, {src: 'c4', ss: 81}],
};
// enquadramento por criativo (muda o recorte; c2 precisa de zoom maior para sair o canto com o nome de outro app)
const ENQ = [
  {c4: [1.2, 82, 62], c2: [1.28, 88, 70]},
  {c4: [1.3, 30, 55], c2: [1.3, 12, 72]},
  {c4: [1.16, 55, 40], c2: [1.26, 90, 60]},
  {c4: [1.25, 90, 70], c2: [1.34, 70, 80]},
];
const plan = (n: number, janelas: [string, number, number][]): Clip[] => {
  const out: Clip[] = []; const usados: Record<string, number> = {};
  janelas.forEach(([tema, t0, t1]) => {
    const pool = POOL[tema]; let t = t0; let k = 0;
    while (t < t1 - 0.05) {
      const len = Math.min(t1 - t, 2.6 + ((k + n) % 3) * 0.5);
      const i = ((usados[tema] ?? 0) + n * 2) % pool.length; usados[tema] = (usados[tema] ?? 0) + 1;
      const tk = pool[i]; const e = (ENQ[n - 1] as any)[tk.src];
      out.push({src: tk.src, ss: tk.ss + ((k + n) % 2) * 0.4, t0: t, t1: t + len, zoom: e[0], ox: e[1], oy: e[2], blur: tk.blur});
      t += len; k++;
    }
  });
  return out;
};
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
  const clips = plan(1, [['home', 0, tCanais], ['live', tCanais, a('filmes')], ['filmes', a('filmes'), a('doramas')], ['series', a('doramas'), tTudo], ['filmes', tTudo, tPrim], ['novelas', tPrim, tCta], ['home', tCta, dur]]);
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
  const clips = plan(2, [['home', 0, tVeja + 0.3], ['home', tVeja + 0.3, tCanais], ['live', tCanais, tFilmes], ['filmes', tFilmes, tSeries], ['series', tSeries, a('novelas')], ['novelas', a('novelas'), tTudo], ['cat', tTudo, tPreco], ['novelas', tPreco, tSup], ['filmes', tSup, tCta], ['home', tCta, dur]]);
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
  const clips = plan(3, [['live', 0, tViX], ['home', tViX, tDep], ['cat', tDep, tOlha], ['live', tOlha, a('filmes', 1) - 0.2], ['filmes', a('filmes', 1) - 0.2, a('doramas') - 0.3], ['series', a('doramas') - 0.3, tTelas - 1.1], ['novelas', tTelas - 1.1, tCta], ['filmes', tCta, dur]]);
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
  const clips = plan(4, [['home', 0, tCanais], ['live', tCanais, tFilmes], ['filmes', tFilmes, a('categorias') - 0.2], ['cat', a('categorias') - 0.2, tSeries], ['series', tSeries, tNov], ['novelas', tNov, tTudo], ['filmes', tTudo, tPreco], ['novelas', tPreco, tSup], ['home', tSup, tCta], ['filmes', tCta, dur]]);
  return {id: 'r4', audio: 'vix/r4.mp3', dur, pal, clips, ev, utm: utm(4)};
};


// ---------- Versão H (base c4, passeio): fala original da mulher da pia, nome trocado pelo nosso. Tempo = tempo do c4 - 2,6 s ----------
const rH = (): Spec => {
  const pal = tlh as Pal[]; const dur = 88.5; const x = (t: number) => Math.round((t - 2.6) * 100) / 100;
  const sec = (titulo: string, t0: number, chips: [string, number][]) => ({titulo, chips: chips.map(([l, t], i) => ({l, t: Math.max(0.1, t - t0), d: i === chips.length - 1}))});
  const e = (t0: number, t1: number, bloco: string, p?: any): Ev => ({t0, t1, bloco, p});
  const ev: Ev[] = [
    e(0.9, 2.3, 'PopMarca', {}),
    e(x(9.9), x(15.9), 'Gancho', {titulo: 'Cansado de pagar vários?', sub: 'Uma mensalidade só', colapsa: 1.8}),
    e(x(17.1), x(23.0), 'Secao', sec('Uma mensalidade', x(17.1), [['Tudo que eu vou mostrar', x(21.3)], ['Em um só aplicativo', x(22.2)]])),
    e(x(25.2), x(43.5), 'Secao', sec('Canais ao vivo', x(25.2), [['Canal aberto', x(33.2)], ['Canal fechado', x(33.9)], ['Esportes', x(39.0)], ['Infantil', x(40.8)], ['Documentário', x(41.3)]])),
    e(x(44.7), x(64.6), 'Secao', sec('Filmes', x(44.7), [['Lançamentos', x(46.1)], ['Filmes antigos', x(60.0)]])),
    e(x(64.8), x(72.0), 'Secao', sec('Séries', x(64.8), [['Anime', x(66.0)], ['Dorama', x(66.9)]])),
    e(x(72.2), x(83.1), 'Secao', sec('Novelas', x(72.2), [['Das mais novas às mais antigas', x(73.9)]])),
    e(x(83.2), x(88.0), 'Secao', sec('Uma mensalidade só', x(83.2), [['Pix, sem cartão', x(84.0)], ['Sem fidelidade', x(85.4)]])),
    e(x(88.1), dur, 'CTA', {horas: true}),
  ];
  const k = (t0: number, t1: number, zoom: number, ox: number, oy: number, blur?: number): Clip => ({src: 'c4', ss: t0 + 2.6, t0, t1, zoom, ox, oy, blur});
  const clips = [k(0, 5.0, 1.0, 50, 50), k(5.0, x(25.2), 1.25, 90, 70), k(x(25.2), x(44.0), 1.25, 90, 70, 9), k(x(44.0), dur, 1.25, 90, 70)];
  return {id: 'h', audio: 'vix/h.mp3', dur, pal, clips, ev, utm: utm(4)};
};

export const SPECS: Record<string, Spec> = {r1: r1(), r2: r2(), r3: r3(), r4: r4(), h: rH()};
