// "Cartaz": versão inédita da vitrine do Jerônimo (31/10/2026), feita a partir do que está rodando lá fora no X:
// - @rom1trs (skill que clona edit viral): o fundo troca a cada frase, cartaz com letra gigante condensada ATRÁS
//   da pessoa recortada, papelão/quadro-verde, rabiscos à mão (círculo, setas de giz). "8 trocas de cena em 9 s".
// - @joshaeeee (relançamento editado pelo Opus 5.5): colagem editorial em papel, adesivos recortados, serifa itálica
//   misturada com display pesado, número gigante com círculo à mão.
// - @mreflow / @DesignSorceress: começa no meio da ação (sem introdução), uma ideia por cena, legenda curta.
// Regras: cada cena = uma ideia presa à palavra; o que se desenha à mão tem função (riscar, apontar, circular);
// a pessoa é um adesivo (borda branca de recorte) sobre cartaz chapado; sem degradê, sem brilho, sem vidro.
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {relogio} from './ancora';
import {useFontes} from './Fontes';
import {clamp, mola, useQuadroBase} from './kit';
import type {Palavra, Rosto} from './tipos';

export type CartazProps = {
  palavras: {w: string; s: number; e: number}[];
  rosto?: Rosto | null;
  base: {arquivo: string; fps: number; duracao: number; largura: number; altura: number};
  pessoa: string; // recorte com alfa (webm), no tempo da base
  musica?: string;
  programa?: string; // print real de um programa de edição (adesivo riscado)
  fpsSaida?: number;
};

export const calculaCartaz: CalculateMetadataFunction<CartazProps> = ({props}) => {
  const fps = props.fpsSaida || props.base.fps || 30;
  return {width: 1080, height: 1920, fps, durationInFrames: Math.max(1, Math.round(props.base.duracao * fps))};
};

const W = 1080;
const H = 1920;
const COND = "'Archivo Variable', 'Archivo', sans-serif";
const SERIFA = "'Instrument Serif', Georgia, serif";
const INTER = "'Inter Variable', Inter, sans-serif";
// paleta de cartaz: cores chapadas de papel impresso (nada de azul + roxo)
const C = {tomate: '#E5432B', mostarda: '#F2B705', creme: '#EFE6D2', kraft: '#C49A6C', lousa: '#1F3B2F', tinta: '#141414', giz: '#F4F1E8'};

// ---------- peças ----------

// textura de papel: ruído fino multiplicado (o cartaz não pode parecer tela chapada de computador)
const Papel: React.FC<{cor: string; id: string}> = ({cor, id}) => (
  <AbsoluteFill style={{background: cor}}>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.22}}>
      <filter id={`grao-${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width={W} height={H} filter={`url(#grao-${id})`} />
    </svg>
  </AbsoluteFill>
);

// pessoa como adesivo: borda branca de recorte + sombra curta (ref. papelão do @rom1trs)
const FiltroAdesivo: React.FC<{id: string}> = ({id}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
      <feComponentTransfer in="SourceAlpha" result="duro"><feFuncA type="discrete" tableValues="0 0 1 1 1" /></feComponentTransfer>
      <feMorphology in="duro" operator="dilate" radius="7" result="borda0" />
      <feFlood floodColor="#FFFFFF" />
      <feComposite in2="borda0" operator="in" result="borda" />
      <feOffset in="borda0" dx="10" dy="16" result="sombra0" />
      <feFlood floodColor="rgba(0,0,0,.28)" />
      <feComposite in2="sombra0" operator="in" result="sombra" />
      <feMerge><feMergeNode in="sombra" /><feMergeNode in="borda" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </svg>
);

const Pessoa: React.FC<{src: string; s?: number; x?: number; y?: number; rot?: number; adesivo?: boolean; ox?: number; oy?: number}> = ({src, s = 1, x = 0, y = 0, rot = 0, adesivo = true, ox = 0.5, oy = 0.35}) => {
  const id = React.useId().replace(/:/g, '');
  return (
    <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`, transformOrigin: `${ox * 100}% ${oy * 100}%`}}>
      {adesivo && <FiltroAdesivo id={id} />}
      <OffthreadVideo src={staticFile(src)} transparent muted style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover',
        filter: `${adesivo ? `url(#${id}) ` : ''}contrast(1.06) saturate(1.02)`}} />
    </AbsoluteFill>
  );
};

// letra de cartaz gigante (Archivo condensada 900), entra batendo: escala 1,12 -> 1 com mola curta
const Gigante: React.FC<{f: number; ini: number; linhas: string[]; cor: string; topo: number; tam: number; rot?: number}> = ({f, ini, linhas, cor, topo, tam, rot = 0}) => {
  const e = clamp(mola(f, ini, 0.45, 0.62), 0, 1.2);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: topo, textAlign: 'center', transform: `rotate(${rot}deg) scale(${1.12 - 0.12 * e})`, opacity: clamp((f - ini + 1) / 2)}}>
      {linhas.map((l, i) => (
        <div key={i} style={{fontFamily: COND, fontWeight: 900, fontStretch: '62%', fontSize: tam, lineHeight: 0.84, letterSpacing: '-0.01em', color: cor, textTransform: 'uppercase'}}>{l}</div>
      ))}
    </div>
  );
};

// traço à mão que se desenha (stroke-dashoffset): círculo, seta, sublinhado, X
const Traco: React.FC<{f: number; ini: number; d: string; cor: string; larg?: number; dur?: number; comp?: number}> = ({f, ini, d, cor, larg = 12, dur = 10, comp = 3000}) => {
  const p = clamp((f - ini) / dur);
  const ease = 1 - Math.pow(1 - p, 3);
  if (f < ini) return null;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d={d} fill="none" stroke={cor} strokeWidth={larg} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={comp} strokeDashoffset={comp * (1 - ease)} />
    </svg>
  );
};
// círculo à mão: elipse com 1,15 volta e leve deriva (não é um círculo perfeito)
const circuloMao = (cx: number, cy: number, rx: number, ry: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = -1.9 + (i / 64) * Math.PI * 2 * 1.15;
    const k = 1 + 0.05 * Math.sin(i / 5) + i * 0.0012;
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
};
const seta = (x1: number, y1: number, x2: number, y2: number) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const mx = (x1 + x2) / 2 + Math.sin(a) * 30, my = (y1 + y2) / 2 - Math.cos(a) * 30;
  const p = (r: number, s: number) => `${(x2 - Math.cos(a + s) * r).toFixed(1)},${(y2 - Math.sin(a + s) * r).toFixed(1)}`;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2} M${p(46, 0.5)} L${x2},${y2} L${p(46, -0.5)}`;
};

// fita de etiqueta (legenda e rótulos): papel colado torto, texto em Inter 800
const Fita: React.FC<{f: number; ini: number; texto: string; x: number; y: number; cor?: string; tinta?: string; rot?: number; tam?: number}> = ({f, ini, texto, x, y, cor = C.giz, tinta = C.tinta, rot = -2, tam = 46}) => {
  const e = clamp(mola(f, ini, 0.5, 0.6), 0, 1.15);
  if (f < ini) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${0.7 + 0.3 * e})`, opacity: clamp((f - ini + 1) / 2),
      background: cor, color: tinta, padding: '10px 22px 12px', fontFamily: INTER, fontWeight: 800, fontSize: tam, letterSpacing: '-0.02em', whiteSpace: 'nowrap',
      boxShadow: '4px 6px 0 rgba(0,0,0,.18)'}}>{texto}</div>
  );
};

// cartão-pôster pequeno (para a grade, o carrossel 3D e o mosaico): cor chapada + recorte dele + número
const Mini: React.FC<{cor: string; num: string; pessoa: string; tinta?: string; w: number; h: number}> = ({cor, num, pessoa, tinta = C.tinta, w, h}) => (
  <div style={{position: 'absolute', inset: 0, width: w, height: h, background: cor, overflow: 'hidden', border: '6px solid #fff', boxShadow: '8px 12px 0 rgba(0,0,0,.2)'}}>
    <div style={{position: 'absolute', left: (w - W * (w * 1.7 / W)) / 2, top: h * 0.42 - 0.36 * H * (w * 1.7 / W), width: W, height: H, transform: `scale(${w * 1.7 / W})`, transformOrigin: '0 0'}}>
      <OffthreadVideo src={staticFile(pessoa)} transparent muted style={{width: W, height: H, objectFit: 'cover'}} />
    </div>
    <div style={{position: 'absolute', left: 14, top: 8, fontFamily: COND, fontWeight: 900, fontStretch: '62%', fontSize: w * 0.3, lineHeight: 1, color: tinta}}>{num}</div>
  </div>
);

// ---------- composição ----------

export const Cartaz: React.FC<CartazProps> = (props) => {
  useFontes();
  const {base, pessoa} = props;
  const fpsB = base.fps || 25;
  const f = useQuadroBase(fpsB);
  const {fps} = useVideoConfig();
  const k = fps / fpsB;
  const dur = Math.round(base.duracao * fpsB);
  const pal: Palavra[] = React.useMemo(() => props.palavras.map((p) => ({...p, f: Math.round(p.s * fpsB), fe: Math.round(p.e * fpsB)})), [props.palavras, fpsB]);
  const t = React.useMemo(() => relogio(pal, dur, fpsB), [pal, dur, fpsB]);
  const rosto = (q: number) => {
    const r = props.rosto;
    if (!r?.cx?.length) return {cx: 0.5, cy: 0.38};
    const i = Math.min(r.cx.length - 1, Math.max(0, Math.round(q / ((r as {passo?: number}).passo || 1))));
    return {cx: r.cx[i], cy: r.cy[i]};
  };

  // cenas: uma ideia por frase, troca seca na palavra (o corte é o ritmo; a mola só assenta)
  const marcos = {
    naoSei: t('inicio'), editar: t('editar'), video: t('vídeo,'), nunca: t('nunca'), programa: t('programa'), vida: t('vida'),
    mesmo: t('mesmo'), e1: t('e'), esse: t('esse'), alta: t('alta'), naoFoi: t('e#2'), essa: t('essa'), virou: t('virou'), varios: t('vários'),
    seco: t('tem'), corte: t('corte'), legenda: t('legenda'), forte: t('forte,'),
    dividida: t('versão#2') - 2, explicacao: t('explicação'), montando: t('montando'), falo: t('falo,'),
    aula: t('tem#2'), quadro: t('quadro'), grafico: t('gráfico'),
    tres: t('tem#3'), objetos: t('tem#3') + 6, girando: t('girando'),
    uma: t('uma'), cinco: t('cinco'), zero: t('zero'), parte: t('parte.'), quer: t('quer'), comenta: t('comenta'),
  };
  const cortes = [marcos.naoSei, marcos.editar, marcos.video, marcos.nunca, marcos.e1, marcos.esse, marcos.naoFoi, marcos.essa, marcos.seco,
    marcos.dividida, marcos.aula, marcos.tres, marcos.uma, marcos.zero, marcos.quer, marcos.comenta];
  let cena = 0;
  while (cena + 1 < cortes.length && cortes[cena + 1] <= f) cena++;
  const ini = cortes[cena];
  const assenta = clamp(mola(f, ini, 0.5, 0.7), 0, 1.1); // pequeno "tapa" de entrada em toda troca
  const tapa = 1.035 - 0.035 * assenta;
  const r = rosto(f);
  const centro = (s: number, yAlvo: number) => ({x: (0.5 - r.cx) * W * s, y: (yAlvo - r.cy) * H * s}); // leva o rosto para (0,5; yAlvo)

  const fundoDe = [C.tomate, C.mostarda, C.creme, C.kraft, null, C.mostarda, C.lousa, C.creme, C.tomate, C.creme, C.lousa, C.kraft, C.tinta, C.creme, C.mostarda, C.tomate];

  const corpo = (): React.ReactNode => {
    switch (cena) {
      case 0: case 1: case 2: { // gancho: 3 cartazes em 1,4 s, a frase se monta atrás dele
        const txt = [['eu não', 'sei'], ['editar'], ['vídeo']][cena];
        const cor = [C.creme, C.tinta, C.tomate][cena];
        const c = centro(0.92, 0.5);
        return (<>
          <Gigante f={f} ini={ini} linhas={txt} cor={cor} topo={cena === 0 ? 120 : 300} tam={cena === 0 ? 390 : 360} rot={[-3, 2, -1.5][cena]} />
          <Pessoa src={pessoa} s={0.92} x={c.x} y={c.y + 200} />
        </>);
      }
      case 3: { // nunca abri um programa: print REAL do programa vira adesivo e leva um X à mão em "vida"
        const c = centro(0.9, 0.52);
        const pe = clamp(mola(f, marcos.programa, 0.4, 0.65), 0, 1.1);
        return (<>
          <Gigante f={f} ini={ini} linhas={['nunca']} cor={C.tinta} topo={150} tam={430} rot={-2} />
          <Pessoa src={pessoa} s={0.9} x={c.x} y={c.y + 160} />
          {props.programa && f >= marcos.programa && (
            <div style={{position: 'absolute', left: 800, top: 760, width: 400, transform: `translate(-50%,-50%) rotate(${7 - 3 * pe}deg) scale(${0.6 + 0.4 * pe})`, border: '8px solid #fff', boxShadow: '10px 14px 0 rgba(0,0,0,.22)', background: '#111'}}>
              <img src={staticFile(props.programa)} style={{width: '100%', display: 'block'}} />
            </div>
          )}
          <Traco f={f} ini={marcos.vida} d="M610,640 L990,880 M990,640 L610,880" cor={C.tomate} larg={26} dur={7} comp={1300} />
        </>);
      }
      case 4: // "e mesmo assim": o BRUTO de verdade, sem cartaz, com etiqueta
        return (<>
          <OffthreadVideo src={staticFile(base.arquivo)} muted style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', filter: 'saturate(.85)'}} />
          <Fita f={f} ini={ini + 2} texto="BRUTO · CELULAR" x={540} y={250} cor={C.giz} rot={-3} />
        </>);
      case 5: { // "esse vídeo saiu em alta qualidade": cartaz + círculo à mão nele em "alta"
        const c = centro(0.86, 0.47);
        return (<>
          <Gigante f={f} ini={ini} linhas={['alta', 'qualidade']} cor={C.tomate} topo={120} tam={250} rot={-2} />
          <Pessoa src={pessoa} s={0.86} x={c.x} y={c.y + 200} />
          <Traco f={f} ini={marcos.alta + 4} d={circuloMao(540, 330, 480, 230)} cor={C.tinta} larg={14} dur={14} comp={4200} />
          <Fita f={f} ini={ini + 1} texto="EDITADO PELO CLAUDE" x={540} y={620} cor={C.tinta} tinta={C.giz} rot={2} tam={40} />
        </>);
      }
      case 6: { // "e não foi só ele": punch-in grande no rosto (olho de peixe leve) + setas de giz apontando
        const s = 1.45;
        const c = centro(s, 0.42);
        return (<>
          <Pessoa src={pessoa} s={s * (1 + 0.04 * clamp((f - ini) / 30))} x={c.x} y={c.y} adesivo={false} />
          {[[120, 300, 330, 560], [960, 280, 760, 560], [100, 1180, 340, 940], [980, 1200, 740, 950]].map((a, i) => (
            <Traco key={i} f={f} ini={ini + 2 + i * 2} d={seta(a[0], a[1], a[2], a[3])} cor={C.giz} larg={11} dur={7} comp={800} />
          ))}
        </>);
      }
      case 7: { // "essa mesma gravação virou vários vídeos": a mesma pessoa em 5 cartazes, um a cada palavra
        const cores = [C.tomate, C.mostarda, C.lousa, C.kraft, C.tinta];
        const tintas = [C.creme, C.tinta, C.giz, C.tinta, C.mostarda];
        const quando = [marcos.virou, marcos.varios, marcos.varios + 5, t('vídeos'), t('diferentes.')];
        const pos = [[60, 560], [560, 560], [60, 1060], [560, 1060], [310, 810]];
        return (<>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: SERIFA, fontStyle: 'italic', fontSize: 130, color: C.tinta, lineHeight: 1}}>a mesma gravação</div>
          {f < marcos.virou && <Pessoa src={pessoa} s={0.8} {...centro(0.8, 0.55)} />}
          {pos.map((p, i) => {
            if (f < quando[i]) return null;
            const e = clamp(mola(f, quando[i], 0.45, 0.6), 0, 1.15);
            return (
              <div key={i} style={{position: 'absolute', left: p[0], top: p[1], width: 460, height: 460 * 16 / 9 * 0.62, transform: `rotate(${[-4, 3, 2, -3, 0][i]}deg) scale(${0.5 + 0.5 * e})`}}>
                <Mini cor={cores[i]} num={`0${i + 1}`} pessoa={pessoa} tinta={tintas[i]} w={460} h={460 * 16 / 9 * 0.62} />
              </div>
            );
          })}
        </>);
      }
      case 8: { // VERSÃO 01 corte seco: cartaz vermelho, zoom em degrau a cada palavra (jump cut sem cortar a fala)
        const passos = [marcos.seco, marcos.corte, t('seco'), marcos.legenda, marcos.forte];
        let j = 0;
        while (j + 1 < passos.length && passos[j + 1] <= f) j++;
        const s = [0.9, 1.0, 1.12, 0.96, 1.18][j];
        const c = centro(s, 0.5);
        return (<>
          <Gigante f={f} ini={marcos.corte} linhas={['corte', 'seco']} cor={C.creme} topo={140} tam={370} rot={-2} />
          <Pessoa src={pessoa} s={s} x={c.x} y={c.y + 140} />
          <Fita f={f} ini={ini + 1} texto="VERSÃO 01" x={250} y={150} cor={C.tinta} tinta={C.mostarda} rot={-4} tam={44} />
        </>);
      }
      case 9: { // VERSÃO 02 tela dividida: em cima um quadro de papel com o diagrama se desenhando, embaixo ele
        const c = centro(0.62, 0.74);
        const cx = [230, 540, 850];
        const quando = [t('tela'), marcos.explicacao, marcos.montando];
        return (<>
          <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.5, bottom: 0, background: C.mostarda}} />
          <Pessoa src={pessoa} s={0.62} x={c.x} y={c.y} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 60, height: H * 0.5 - 100, background: '#FFFDF6', border: `5px solid ${C.tinta}`, boxShadow: '12px 14px 0 rgba(0,0,0,.2)'}} />
          {['GRAVA', 'MONTA', 'EXPLICA'].map((w, i) => f >= quando[i] && (
            <React.Fragment key={i}>
              <Traco f={f} ini={quando[i]} d={`M${cx[i] - 125},360 L${cx[i] + 125},360 L${cx[i] + 125},560 L${cx[i] - 125},560 Z`} cor={C.tinta} larg={8} dur={8} comp={1000} />
              <div style={{position: 'absolute', left: cx[i] - 125, width: 250, top: 425, textAlign: 'center', fontFamily: COND, fontWeight: 900, fontStretch: '62%', fontSize: 70, color: C.tinta, opacity: clamp((f - quando[i] - 4) / 3)}}>{w}</div>
              {i > 0 && <Traco f={f} ini={quando[i] - 2} d={seta(cx[i - 1] + 135, 460, cx[i] - 140, 460)} cor={C.tomate} larg={9} dur={5} comp={500} />}
            </React.Fragment>
          ))}
          <div style={{position: 'absolute', left: 90, top: 150, fontFamily: SERIFA, fontStyle: 'italic', fontSize: 100, color: C.tinta}}>a explicação se monta</div>
          <Fita f={f} ini={ini + 1} texto="VERSÃO 02" x={880} y={H * 0.5 + 60} cor={C.tinta} tinta={C.mostarda} rot={3} tam={44} />
        </>);
      }
      case 10: { // VERSÃO 03 aula: lousa verde, gráfico de giz se desenha, ele embaixo à esquerda
        const c = centro(0.7, 0.66);
        const bar = (i: number, h: number, q: number) => <Traco key={i} f={f} ini={q} d={`M${560 + i * 130},780 L${560 + i * 130},${780 - h}`} cor={i === 3 ? C.mostarda : C.giz} larg={56} dur={8} comp={h + 10} />;
        return (<>
          <div style={{position: 'absolute', left: 70, top: 120, fontFamily: COND, fontWeight: 900, fontStretch: '62%', fontSize: 300, color: C.giz, lineHeight: 0.9, opacity: 0.95}}>AULA</div>
          <Traco f={f} ini={marcos.quadro} d="M520,790 L1020,790 M520,790 L520,330" cor={C.giz} larg={8} dur={8} comp={1000} />
          {f >= marcos.grafico && [160, 240, 310, 440].map((h, i) => bar(i, h, marcos.grafico + i * 3))}
          <Pessoa src={pessoa} s={0.7} x={c.x - 170} y={c.y} />
          <Fita f={f} ini={ini + 1} texto="VERSÃO 03" x={850} y={150} cor={C.mostarda} rot={-3} tam={44} />
        </>);
      }
      case 11: { // VERSÃO 04 3D: carrossel de cartazes girando em volta dele (os de trás passam ATRÁS do recorte)
        const c = centro(0.86, 0.46);
        const giro = (f - marcos.objetos) / fpsB * 1.1;
        const cartas = [C.tomate, C.mostarda, C.lousa, C.creme, C.tinta, C.tomate].map((cor, i) => {
          const a = giro + (i / 6) * Math.PI * 2;
          return {cor, i, a, z: Math.cos(a), x: Math.sin(a) * 460, y: 1020 + Math.cos(a) * 60};
        });
        const entra = clamp(mola(f, marcos.objetos, 0.25, 0.8));
        const carta = (q: (typeof cartas)[number]) => (
          <div key={q.i} style={{position: 'absolute', left: 540 + q.x * entra - 150, top: q.y - 210, width: 300, height: 420,
            transform: `perspective(1400px) rotateY(${Math.sin(q.a) * -48}deg) scale(${0.75 + 0.25 * (q.z + 1) / 2})`, opacity: entra, filter: `brightness(${0.75 + 0.25 * (q.z + 1) / 2})`}}>
            <Mini cor={q.cor} num={`0${(q.i % 4) + 1}`} pessoa={pessoa} tinta={q.cor === C.tinta || q.cor === C.lousa ? C.giz : C.tinta} w={300} h={420} />
          </div>
        );
        return (<>
          <Gigante f={f} ini={ini} linhas={['3D']} cor={C.tinta} topo={70} tam={560} rot={-3} />
          {f >= marcos.objetos && cartas.filter((q) => q.z < 0).sort((a, b) => a.z - b.z).map(carta)}
          <Pessoa src={pessoa} s={0.86} x={c.x} y={c.y + 220} />
          {f >= marcos.objetos && cartas.filter((q) => q.z >= 0).sort((a, b) => a.z - b.z).map(carta)}
          <Fita f={f} ini={ini + 1} texto="VERSÃO 04" x={840} y={150} cor={C.tinta} tinta={C.mostarda} rot={4} tam={44} />
        </>);
      }
      case 12: { // uma gravação, cinco vídeos: mosaico dos 5 cartazes que se abre sobre o fundo preto
        const cores = [C.tomate, C.mostarda, C.lousa, C.kraft, C.creme];
        return (<>
          <Gigante f={f} ini={ini} linhas={f < marcos.cinco ? ['1 gravação'] : ['5 vídeos']} cor={C.mostarda} topo={140} tam={250} />
          {cores.map((cor, i) => {
            const e = clamp(mola(f, marcos.cinco + i * 2, 0.4, 0.7), 0, 1.1);
            const x = f < marcos.cinco ? 540 : 540 + (i - 2) * 200 * e;
            return (
              <div key={i} style={{position: 'absolute', left: x - 150, top: 700 + Math.abs(i - 2) * 40 * e, width: 300, height: 520, transform: `rotate(${(i - 2) * 5 * e}deg)`, zIndex: 5 - Math.abs(i - 2)}}>
                <Mini cor={cor} num={f < marcos.cinco ? '1' : `0${i + 1}`} pessoa={pessoa} tinta={cor === C.lousa ? C.giz : C.tinta} w={300} h={520} />
              </div>
            );
          })}
        </>);
      }
      case 13: { // zero edição da minha parte: 0 gigante atrás + sublinhado
        const c = centro(0.88, 0.5);
        return (<>
          <Gigante f={f} ini={ini} linhas={['0']} cor={C.tomate} topo={40} tam={1100} />
          <Pessoa src={pessoa} s={0.88} x={c.x} y={c.y + 180} />
        </>);
      }
      case 14: { // quer ver como?
        const c = centro(1.0, 0.5);
        return (<>
          <Gigante f={f} ini={ini} linhas={['quer', 'ver como?']} cor={C.tinta} topo={110} tam={270} rot={2} />
          <Pessoa src={pessoa} s={1.0} x={c.x} y={c.y + 140} />
        </>);
      }
      default: { // comenta EDIÇÃO: volta ao cartaz vermelho do primeiro quadro (loop)
        const c = centro(0.92, 0.5);
        const b = clamp(mola(f, t('edição#3'), 0.4, 0.6), 0, 1.15);
        return (<>
          <Gigante f={f} ini={ini} linhas={['comenta']} cor={C.creme} topo={260} tam={260} rot={-3} />
          <Pessoa src={pessoa} s={0.92} x={c.x} y={c.y + 120} />
          {f >= t('edição#3') && (
            <div style={{position: 'absolute', left: 540, top: 1460, transform: `translate(-50%,-50%) rotate(-4deg) scale(${0.5 + 0.5 * b})`, background: '#fff', color: C.tinta,
              padding: '26px 54px', borderRadius: 60, fontFamily: COND, fontWeight: 900, fontStretch: '62%', fontSize: 150, boxShadow: '10px 14px 0 rgba(0,0,0,.22)'}}>EDIÇÃO</div>
          )}
          <Traco f={f} ini={t('edição#3') + 4} d={seta(880, 1250, 760, 1400)} cor={C.tinta} larg={12} dur={6} comp={600} />
        </>);
      }
    }
  };

  // legenda em fita: blocos de até 3 palavras, entra a palavra falada; some no gancho (o cartaz já é a fala)
  const legenda = (() => {
    if (f < marcos.nunca || cena === 12) return null;
    const i = pal.findIndex((w) => w.f <= f + 1 && f < (pal[pal.indexOf(w) + 1]?.f ?? dur));
    if (i < 0) return null;
    const ini3 = i - (i % 3);
    const ws = pal.slice(ini3, ini3 + 3).filter((w) => w.f <= f + 1);
    const y = cena === 9 ? H * 0.93 : cena === 6 ? H * 0.8 : H * 0.865;
    return (
      <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: C.tinta, color: C.giz, padding: '8px 22px 10px', fontFamily: INTER, fontWeight: 800, fontSize: 50, letterSpacing: '-0.02em', transform: `rotate(${(ini3 % 2 ? 1 : -1) * 1.5}deg)`}}>
          {ws.map((w) => w.w.replace(/[.,!?]$/, '')).join(' ')}
        </div>
      </div>
    );
  })();

  // som: voz; música à frente nas pausas e 20 LU abaixo na fala; efeitos de papel poucos e variados nas trocas
  const falando = React.useMemo(() => {
    const v = new Array(dur + 1).fill(0);
    pal.forEach((w) => { for (let q = Math.max(0, w.f - 4); q <= Math.min(dur, w.fe + 6); q++) v[q] = 1; });
    const out = new Array(dur + 1).fill(0);
    let y = v[0];
    for (let q = 0; q <= dur; q++) { y += (v[q] - y) * (v[q] > y ? 0.3 : 0.07); out[q] = y; }
    return out;
  }, [pal, dur]);
  const efeitos: {em: number; som: string; vol: number}[] = [];
  const giro = ['swish', 'ar', 'pop', 'whoosh'];
  let ultimo = -99;
  cortes.forEach((c, i) => {
    if (c - ultimo < 1.2 * fpsB) return;
    efeitos.push({em: c, som: giro[i % giro.length], vol: 0.3});
    ultimo = c;
  });

  const fundo = fundoDe[cena];
  return (
    <AbsoluteFill style={{background: C.tinta, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${tapa})`}}>
        {fundo && <Papel cor={fundo} id={`c${cena}`} />}
        {corpo()}
      </AbsoluteFill>
      {legenda}
      <Audio src={staticFile(base.arquivo)} />
      {props.musica && <Audio src={staticFile(props.musica)} volume={(q) => 0.32 - 0.24 * (falando[Math.min(Math.round(q / k), dur)] ?? 0)} />}
      {efeitos.map((e, i) => (
        <Sequence key={i} from={Math.round(e.em * k)} durationInFrames={Math.round(40 * k)}><Audio src={staticFile(`sons/sfx_${e.som}.wav`)} volume={e.vol} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
