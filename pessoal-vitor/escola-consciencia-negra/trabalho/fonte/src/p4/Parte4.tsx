// PARTE 4 · Luísa Brasil (sociologia: racismo estrutural). Fio visual: PLANTA / DESENHO TÉCNICO,
// a "estrutura" que ninguém vê. Relógio: public/p4/words.json.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {getLength} from '@remotion/paths';
import {C, E, FILTRO, approach, arrive, clamp, f, rand, tween} from '../lib';
import {Grain, NameTape, Photo, SERIF, TYPE, TypeTag, useFonts} from '../kit';
import {Contador, TituloConceito, Traco, tremido} from '../kit2';
import {ICON} from '../icons';
import {Caption} from '../Caption';
import {CUES} from './captions';
import words from '../../public/p4/words.json';

export const DURACAO_P4 = 63.4;
const W = words as {w: string; s: number; e: number}[];

// Grade de papel milimetrado escuro (fundo de projeto), desenha-se da esquerda para a direita.
const Grade: React.FC<{start: number; onda?: number; opacity?: number}> = ({start, onda = 0, opacity = 0.13}) => {
  const frame = useCurrentFrame();
  const p = E.produtiva(clamp((frame - start) / 26));
  const ls: React.ReactNode[] = [];
  for (let x = 0; x <= 1920; x += 60) {
    let d = `M ${x} 0`;
    for (let y = 0; y <= 1080; y += 40) d += ` L ${x + onda * 26 * Math.sin(y / 90 + frame / 9 + x / 300)} ${y}`;
    ls.push(<path key={`v${x}`} d={d} stroke={C.papel} strokeWidth={x % 300 === 0 ? 1.6 : 0.8} fill="none" opacity={x / 1920 < p ? 1 : 0} />);
  }
  for (let y = 0; y <= 1080; y += 60) {
    let d = `M 0 ${y}`;
    for (let x = 0; x <= 1920; x += 40) d += ` L ${x} ${y + onda * 22 * Math.sin(x / 110 + frame / 8 + y / 200)}`;
    ls.push(<path key={`h${y}`} d={d} stroke={C.papel} strokeWidth={y % 300 === 0 ? 1.6 : 0.8} fill="none" strokeDasharray={2000} strokeDashoffset={2000 * (1 - p)} />);
  }
  return <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity}}>{ls}</svg>;
};

// Desenho técnico: lista de caminhos que se traçam em sequência (a partir de start, em quadros).
export const Desenho: React.FC<{ds: string[]; start: number; stagger?: number; dur?: number; cor?: string; w?: number; dash?: string}> = ({
  ds, start, stagger = 2, dur = 12, cor = C.papel, w = 3, dash,
}) => (
  <>
    {ds.map((d, i) => {
      const L = Math.ceil(getLength(d)) + 2;
      return dash ? (
        <DashLinha key={i} d={d} start={start + i * stagger} cor={cor} w={w} dash={dash} />
      ) : (
        <Traco key={i} d={d} start={start + i * stagger} dur={dur} cor={cor} w={w} len={L} />
      );
    })}
  </>
);
const DashLinha: React.FC<{d: string; start: number; cor: string; w: number; dash: string}> = ({d, start, cor, w, dash}) => {
  const frame = useCurrentFrame();
  return <path d={d} stroke={cor} strokeWidth={w} fill="none" strokeDasharray={dash} opacity={clamp((frame - start) / 8)} />;
};

// ---------------------------------------------------------------- A · 0-5,3 · a frase que se apaga
const Silencio: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= f(5.35)) return null;
  const ws = W.filter((w) => w.s < 4.6);
  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{width: 1500, textAlign: 'center'}}>
        {ws.map((w, i) => {
          const s0 = f(w.s);
          const p = arrive(frame, s0, 0.22);
          const apaga = clamp((frame - (f(4.62) + (ws.length - 1 - i) * 1.6)) / 7);
          return (
            <span key={i} style={{
              display: 'inline-block', marginRight: 22, fontFamily: SERIF, fontWeight: 600, fontSize: 88,
              color: w.w === 'palavra.' ? C.terracota : C.papel, opacity: frame >= s0 ? p * (1 - apaga) : 0,
              transform: `translateY(${(1 - p) * 18 - apaga * 14}px)`, filter: `blur(${(1 - p) * 6 + apaga * 10}px)`,
            }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- B · 5,3-11,6 · geração após geração
const GER = [
  {src: 'fotos/geracao-1.jpg', tag: 'SÉCULO XIX', filtro: 'arquivo'},
  {src: 'fotos/geracao-2.jpg', tag: 'SÉCULO XX', filtro: 'arquivo'},
  {src: 'fotos/geracao-3.jpg', tag: 'HOJE', filtro: 'atual'},
];
const Geracoes: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(5.3) || frame >= f(11.65)) return null;
  const x1 = tween(frame, f(9.72), f(10.02), 0, 2100, E.expressiva);
  const x2 = tween(frame, f(10.55), f(10.85), 0, 2100, E.expressiva);
  const camX = x1 + x2 + 3 * (frame - f(5.3));
  const v = Math.abs(tween(frame + 1, f(9.72), f(10.02), 0, 2100, E.expressiva) - x1) + Math.abs(tween(frame + 1, f(10.55), f(10.85), 0, 2100, E.expressiva) - x2);
  return (
    <AbsoluteFill style={{background: C.fundo, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateX(${-camX}px)`, filter: v > 8 ? `blur(${Math.min(22, v / 12)}px)` : undefined}}>
        {GER.map((g, i) => (
          <div key={i} style={{position: 'absolute', left: 110 + i * 2100, top: 70, width: 1700, height: 940, transform: `rotate(${[-1.2, 0.9, -0.6][i]}deg)`,
            boxShadow: '0 30px 60px rgba(0,0,0,.6)', overflow: 'hidden', background: '#000'}}>
            <Img src={staticFile(g.src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: (FILTRO as Record<string, string>)[g.filtro],
              transform: `scale(${1.04 + 0.01 * ((frame - f(5.3)) / 30)})`}} />
            <TypeTag text={g.tag} start={f([5.6, 9.95, 10.8][i])} x={60} y={60} size={38} cps={22} />
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C · 11,6-15,85 · a grade e o conceito
const Conceito: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(11.6) || frame >= f(15.85)) return null;
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Grade start={f(11.62)} />
      <TypeTag text="SOCIOLOGIA" start={f(12.3)} end={f(13.95)} x={760} y={500} size={50} cps={20} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- D · 15,85-22,1 · a instituição e suas linhas
const Instituicao: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(15.85) || frame >= f(22.1)) return null;
  const vs = [240, 520, 800, 1080, 1360, 1640].map((x) => `M ${x} 1080 L ${x} 120`);
  const hs = [300, 560, 820].map((y) => `M 80 ${y} L 1840 ${y}`);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Photo src="fotos/predio-institucional.jpg" from={f(15.85)} zoom0={1.1} zoomRate={-0.012} filter="arquivo" />
      <AbsoluteFill style={{background: 'rgba(10,7,5,0.35)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.55}}>
        <Desenho ds={vs} start={f(16.3)} stagger={9} dur={30} w={2} />
        <Desenho ds={hs} start={f(18.2)} stagger={12} dur={30} w={2} />
        {[240, 520, 800, 1080, 1360, 1640].map((x, i) => (
          <circle key={i} cx={x} cy={300} r={7} fill="none" stroke={C.papel} strokeWidth={2} opacity={clamp((frame - f(19.6) - i * 3) / 6)} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- E · 22,1-26,8 · VITRINE: o desenho técnico da estrutura
export const PREDIO = [
  'M 200 730 L 640 730 L 640 700 L 200 700 Z',
  ...[0, 1, 2, 3, 4, 5].map((i) => `M ${240 + i * 72} 700 L ${240 + i * 72} 478 L ${266 + i * 72} 478 L ${266 + i * 72} 700`),
  'M 215 478 L 625 478 L 625 446 L 215 446 Z',
  'M 205 446 L 420 334 L 635 446',
  'M 380 420 L 460 420',
];
export const CIDADE = (() => {
  const d: string[] = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
    const x = 800 + i * 84, y = 470 + j * 90;
    d.push(`M ${x} ${y} L ${x + 64} ${y} L ${x + 64} ${y + 70} L ${x} ${y + 70} Z`);
  }
  return d;
})();
// escada: seis degraus; os dois de baixo NÃO existem
const DEG = 58, ALT = 48, EX = 1330, EY = 730;
export const ESCADA = (() => {
  let d = `M ${EX + 2 * DEG} ${EY - 2 * ALT}`;
  for (let k = 2; k < 6; k++) d += ` L ${EX + k * DEG} ${EY - (k + 1) * ALT} L ${EX + (k + 1) * DEG} ${EY - (k + 1) * ALT}`;
  d += ` L ${EX + 6 * DEG} ${EY} L ${EX + 2 * DEG} ${EY}`;
  return [d];
})();
const FANTASMA = [`M ${EX} ${EY} L ${EX} ${EY - ALT} L ${EX + DEG} ${EY - ALT} L ${EX + DEG} ${EY - 2 * ALT} L ${EX + 2 * DEG} ${EY - 2 * ALT}`];
const CAM4: [number, number, number, number][] = [[22.1, 960, 600, 1.16], [26.8, 960, 590, 0.98]];
const cam4 = (frame: number) => {
  const t = frame / 30;
  let k = 0;
  while (k < CAM4.length - 1 && t >= CAM4[k + 1][0]) k++;
  const a = CAM4[k], b = CAM4[Math.min(k + 1, CAM4.length - 1)];
  const p = a === b ? 1 : E.camera(clamp((t - a[0]) / (b[0] - a[0])));
  return {x: a[1] + (b[1] - a[1]) * p, y: a[2] + (b[2] - a[2]) * p, s: a[3] + (b[3] - a[3]) * p};
};
const Estrutura: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(22.1) || frame >= f(26.85)) return null;
  const c = cam4(frame);
  const rotulo = (txt: string, x: number, t: number) => (
    <text x={x} y={800} textAnchor="middle" fontFamily={TYPE} fontSize={26} fill={C.papel} letterSpacing="3" opacity={0.85 * clamp((frame - f(t)) / 8)}>
      {txt}
    </text>
  );
  const cota = (x1: number, x2: number, y: number, t: number) => (
    <g opacity={0.5 * clamp((frame - f(t)) / 10)}>
      <path d={`M ${x1} ${y} L ${x2} ${y} M ${x1} ${y - 8} L ${x1} ${y + 8} M ${x2} ${y - 8} L ${x2} ${y + 8}`} stroke={C.papel} strokeWidth={1.4} />
    </g>
  );
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Grade start={f(22.1) - 30} opacity={0.12} />
      <AbsoluteFill style={{transform: `translate(${960 - c.x * c.s}px, ${540 - c.y * c.s}px) scale(${c.s})`, transformOrigin: '0 0'}}>
        <svg width={1920} height={1080} style={{overflow: 'visible'}}>
          <Desenho ds={PREDIO} start={f(23.4)} stagger={2} dur={12} />
          {rotulo('INSTITUIÇÕES', 420, 23.9)}
          {cota(200, 640, 770, 24.0)}
          <Desenho ds={CIDADE} start={f(24.45)} stagger={1} dur={10} />
          {rotulo('CIDADES', 960, 24.8)}
          {cota(800, 1116, 770, 24.9)}
          <Desenho ds={ESCADA} start={f(25.1)} dur={16} />
          <Desenho ds={FANTASMA} start={f(25.7)} cor={C.vermelho} w={3} dash="10 10" />
          {rotulo('OPORTUNIDADES', 1504, 25.5)}
          <Traco d={tremido(EX + 58, EY - 50, 105, 0.4)} start={f(26.05)} dur={10} len={900} w={6} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- F · 26,8-41,95 · três pares em tela dividida
const Par: React.FC<{a: number; b: number; split: number; esq: React.ReactNode; dir: React.ReactNode}> = ({a, b, split, esq, dir}) => {
  const frame = useCurrentFrame();
  if (frame < f(a) || frame >= f(b)) return null;
  const corte = tween(frame, f(split) - 4, f(split) + 10, 1920, 960, E.expressiva);
  const shift = (1920 - corte) / 2; // o lado esquerdo recentraliza no meio da metade
  return (
    <AbsoluteFill style={{background: '#000', opacity: arrive(frame, f(a), 0.35)}}>
      <AbsoluteFill style={{clipPath: `inset(0 ${1920 - corte}px 0 0)`}}>
        <AbsoluteFill style={{transform: `translateX(${-shift / 2}px)`}}>{esq}</AbsoluteFill>
      </AbsoluteFill>
      {frame >= f(split) - 4 && (
        <AbsoluteFill style={{clipPath: `inset(0 0 0 ${corte}px)`}}>
          <AbsoluteFill style={{transform: `translateX(${480 - (corte - 960) * 0.3}px)`}}>{dir}</AbsoluteFill>
        </AbsoluteFill>
      )}
      {frame >= f(split) - 4 && <div style={{position: 'absolute', left: corte - 3, top: 0, width: 6, height: 1080 * clamp((frame - f(split) + 4) / 10), background: C.terracota}} />}
    </AbsoluteFill>
  );
};
const Documento: React.FC<{t0: number; carimbo: string; tc: number; cor: string}> = ({t0, carimbo, tc, cor}) => {
  const frame = useCurrentFrame();
  const s = approach(frame, f(tc), 1.8, 1, 0.3);
  return (
    <AbsoluteFill style={{background: C.fundo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{width: 580, height: 700, background: C.papel, transform: `rotate(-1.4deg) translateY(${approach(frame, f(t0), 60, 0, 0.14) - 135}px)`, boxShadow: '0 30px 70px rgba(0,0,0,.65)',
        padding: '70px 64px', boxSizing: 'border-box', position: 'relative'}}>
        <div style={{fontFamily: TYPE, fontSize: 30, color: C.tinta, letterSpacing: '0.06em', lineHeight: '40px'}}>CONTRATO DE<br />FINANCIAMENTO<br />HABITACIONAL</div>
        {Array.from({length: 8}).map((_, i) => (
          <div key={i} style={{height: 12, width: `${60 + rand(i * 3.3) * 38}%`, background: C.tinta, opacity: 0.16, marginTop: i === 0 ? 50 : 22}} />
        ))}
        {frame >= f(tc) && (
          <div style={{position: 'absolute', left: 70, top: 380, transform: `rotate(-14deg) scale(${s})`, border: `8px solid ${cor}`, padding: '10px 34px',
            fontFamily: TYPE, fontSize: 76, color: cor, letterSpacing: '0.08em', opacity: 0.88, mixBlendMode: 'multiply'}}>
            {carimbo}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
const Cadeira: React.FC<{t0: number}> = ({t0}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0E0B09', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 520, background: 'radial-gradient(ellipse 30% 50% at 50% 40%, rgba(237,230,218,0.10), rgba(0,0,0,0) 70%)'}} />
      <svg width={360} height={360} viewBox="0 0 256 256" style={{opacity: arrive(frame, f(t0), 0.12), transform: `translateY(${approach(frame, f(t0), 30, 0, 0.12)}px)`}}>
        <path d={ICON.chair} fill={C.papel} opacity={0.85} />
      </svg>
      <TypeTag text="NINGUÉM CHAMOU" start={f(t0) + 20} x={620} y={820} size={34} cps={20} />
    </AbsoluteFill>
  );
};
const Anos: React.FC<{a: number; b: number}> = ({a, b}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Photo src="obra/barracos.mp4" from={f(40.1)} zoom0={1.08} zoomRate={0.01} filter="atual" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: arrive(frame, f(a), 0.2)}}>
        <Contador de={1996} ate={2026} a={f(a)} b={f(b)} size={190} ano />
      </div>
    </AbsoluteFill>
  );
};
const Pares: React.FC = () => (
  <>
    <Par a={26.8} b={32.4} split={30.94}
      esq={<Documento t0={26.8} carimbo="APROVADO" tc={29.3} cor={C.tinta} />}
      dir={<Documento t0={30.9} carimbo="NEGADO" tc={31.82} cor={C.vermelho} />} />
    <Par a={32.4} b={38.35} split={35.7}
      esq={<Photo src="fotos/audiencia-publica.jpg" from={f(32.4)} zoom0={1.06} zoomRate={0.014} filter="atual" />}
      dir={<Cadeira t0={35.9} />} />
    <Par a={38.35} b={41.95} split={40.12}
      esq={<Photo src="fotos/obra-asfalto.jpg" from={f(38.35)} zoom0={1.06} zoomRate={0.014} filter="atual" />}
      dir={<Anos a={40.8} b={41.85} />} />
  </>
);

// ---------------------------------------------------------------- G · 41,95-55,85 · retrato e as barreiras
const Barreiras: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(41.95) || frame >= f(55.85)) return null;
  const retrato = frame < f(47.2);
  if (retrato) {
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <Photo src="fotos/retrato-periferia.jpg" from={f(41.95)} zoom0={1.02} zoomRate={0.02} dx={-6} filter="atual" />
      </AbsoluteFill>
    );
  }
  const BAR = [{x: 700, t: 48.05, tag: 'MORADIA', tt: 50.84}, {x: 1110, t: 51.9, tag: 'SERVIÇOS PÚBLICOS', tt: 52.32}, {x: 1560, t: 53.3, tag: 'DECISÕES', tt: 53.58}];
  const head = Math.min(tween(frame, f(47.4), f(48.3), 140, 640, E.expressiva), 640);
  return (
    <AbsoluteFill style={{background: C.fundo, opacity: arrive(frame, f(47.2), 0.3)}}>
      <Grade start={f(47.2) - 30} opacity={0.1} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d={`M 140 600 L ${head} 600`} stroke={C.terracota} strokeWidth={8} strokeLinecap="round" />
        <circle cx={head} cy={600} r={14} fill={C.terracota} />
        {BAR.map((b, i) => {
          if (frame < f(b.t)) return null;
          const y = approach(frame, f(b.t), -700, 0, 0.3);
          return (
            <g key={i} transform={`translate(${b.x} ${y})`}>
              <rect x={-14} y={440} width={28} height={320} fill={C.papel} />
              <rect x={-14} y={440} width={28} height={320} fill="none" stroke={C.tinta} strokeWidth={2} opacity={0.3} />
            </g>
          );
        })}
      </svg>
      {BAR.map((b, i) => (
        <TypeTag key={i} text={b.tag} start={f(b.tt)} x={b.x - (i === 1 ? 150 : 60)} y={[360, 300, 360][i]} size={30} cps={24} rot={-2 + i} />
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- H · 55,85-63,4 · a estrutura vira água
const Ponte: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(55.85)) return null;
  const onda = tween(frame, f(59.5), f(61.0), 0, 1.4, E.entrada);
  const foto = clamp((frame - f(60.5)) / 30);
  const fim = clamp((frame - f(62.4)) / 30);
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Grade start={f(55.85) - 26} onda={onda} opacity={0.16 * (1 - foto)} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.8 * (1 - foto)}}>
        <g transform="translate(560 90) scale(0.62)">
          <Desenho ds={PREDIO} start={f(57.3)} stagger={1} dur={10} />
          <Desenho ds={CIDADE} start={f(57.5)} stagger={1} dur={8} />
          <Desenho ds={ESCADA} start={f(57.7)} dur={10} />
        </g>
      </svg>
      <AbsoluteFill style={{opacity: foto}}>
        <Photo src="fotos/natureza-agua.jpg" from={f(60.5)} zoom0={1.12} zoomRate={0.018} filter="cor" />
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: fim}} />
    </AbsoluteFill>
  );
};

export const Parte4: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Silencio />
      <Geracoes />
      <Conceito />
      <TituloConceito l1="RACISMO" l2="ESTRUTURAL" t1={14.05} t2={14.7} size={200} desde={13.98} ate={15.85} fundo="transparent" />
      <Instituicao />
      <Estrutura />
      <Pares />
      <Barreiras />
      <Ponte />
      <NameTape name="Luísa Brasil" start={f(6.3)} dur={f(3.2)} x={140} y={560} />
      <Caption cues={CUES} />
      <Grain amount={0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};
