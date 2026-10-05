// PARTE 6 · Maria Alice (justiça ambiental e resistência). A VIRADA do filme: do problema para a luta.
// Relógio: public/p6/words.json. Vitrines: a balança que se equilibra (5,9-11,9) e o mosaico das lutas (31-43,4).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, E, approach, arrive, clamp, f, rand, tween} from '../lib';
import {Grain, Kinetic, NameTape, Photo, SERIF, TYPE, TypeTag, useFonts} from '../kit';
import {Isolinhas, Painel, TituloConceito, palavras} from '../kit2';
import {CIDADE, Desenho, ESCADA, PREDIO} from '../p4/Parte4';
import {Caption} from '../Caption';
import {CUES} from './captions';
import words from '../../public/p6/words.json';
import dados from '../p3/brasil-data.json';

export const DURACAO_P6 = 59.8;
const W = words as {w: string; s: number; e: number}[];

// ---------------------------------------------------------------- A+B · 0-5,9 · onde há injustiça, há resistência
const Abre: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= f(5.95)) return null;
  const foto = clamp((frame - f(2.25)) / 24);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: foto}}>
        <Photo src="fotos/marcha.jpg" from={f(2.25)} zoom0={1.14} zoomRate={-0.014} filter="atual" />
        <AbsoluteFill style={{background: `rgba(0,0,0,${0.6 - 0.25 * clamp((frame - f(3.75)) / 20)})`}} />
      </AbsoluteFill>
      <Kinetic words={palavras(W, 0, 3.6)} size={96} y={540} accent={['resistência.']} end={f(3.75)} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C · 5,95-10,4 · a balança (riscos desiguais → equilíbrio)
const Balanca: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(5.95) || frame >= f(10.45)) return null;
  // ângulo: pende para a esquerda enquanto os riscos caem; em "justiça" (10,46) quem equilibra é a mola
  const ang = (() => {
    const cai = tween(frame, f(6.9), f(8.7), 0, -17, E.expressiva);
    if (frame < f(9.3)) return cai;
    const t = (frame - f(9.3)) / 30; // mola amortecida (0,68 por meia-oscilação)
    return -17 * Math.exp(-4.2 * t) * Math.cos(9 * t);
  })();
  const cx = 960, cy = 330, braco = 460;
  const a = (ang * Math.PI) / 180;
  const L = {x: cx - braco * Math.cos(a), y: cy - braco * Math.sin(a)};
  const R = {x: cx + braco * Math.cos(a), y: cy + braco * Math.sin(a)};
  const prato = (p: {x: number; y: number}) => `M ${p.x - 150} ${p.y + 230} Q ${p.x} ${p.y + 300}, ${p.x + 150} ${p.y + 230} Z`;
  const eq = clamp((frame - f(9.3)) / 20);
  const N = 30;
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const t0 = f(6.95) + i * 1.2;
    if (frame < t0) continue;
    const vaiDir = i % 2 === 1; // metade muda de prato quando equilibra
    const lado = vaiDir && eq > 0 ? R : L;
    const col = i % 10, row = Math.floor(i / 10);
    const ox = (col - 4.5) * 24 + (rand(i) - 0.5) * 6, oy = 222 - row * 22;
    const alvoL = {x: L.x + ox, y: L.y + oy};
    const colR = Math.floor(i / 2) % 10, rowR = Math.floor(Math.floor(i / 2) / 10);
    const alvoLado = vaiDir ? {x: lado.x + (colR - 4.5) * 24, y: lado.y + 222 - rowR * 22} : {x: L.x + ((Math.floor(i / 2) % 10) - 4.5) * 24, y: L.y + 222 - Math.floor(Math.floor(i / 2) / 10) * 22};
    const caindo = approach(frame, t0, alvoL.y - 500, alvoL.y, 0.2);
    const x = eq > 0 ? alvoL.x + (alvoLado.x - alvoL.x) * E.expressiva(eq) : alvoL.x;
    const y = eq > 0 ? alvoL.y + (alvoLado.y - alvoL.y) * E.expressiva(eq) - Math.sin(Math.PI * eq) * (vaiDir ? 160 : 0) : caindo;
    dots.push(<circle key={i} cx={x} cy={y} r={10} fill={C.terracota} />);
  }
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <svg width={1920} height={1080}>
        <g stroke={C.papel} strokeWidth={4} fill="none" strokeLinecap="round" opacity={arrive(frame, f(5.95), 0.2)}>
          <path d={`M ${cx} ${cy} L ${cx} 900 M ${cx - 160} 900 L ${cx + 160} 900`} />
          <circle cx={cx} cy={cy} r={12} fill={C.papel} />
          <path d={`M ${L.x} ${L.y} L ${R.x} ${R.y}`} />
          <path d={`M ${L.x} ${L.y} L ${L.x - 150} ${L.y + 230} M ${L.x} ${L.y} L ${L.x + 150} ${L.y + 230}`} opacity={0.6} />
          <path d={`M ${R.x} ${R.y} L ${R.x - 150} ${R.y + 230} M ${R.x} ${R.y} L ${R.x + 150} ${R.y + 230}`} opacity={0.6} />
          <path d={prato(L)} fill={C.fundo} />
          <path d={prato(R)} fill={C.fundo} />
        </g>
        {dots}
      </svg>
      <TypeTag text="RISCOS" start={f(8.7)} end={f(9.25)} x={L.x - 90} y={L.y + 330} size={32} cps={22} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- D · 11,9-25,95 · o princípio, datilografado
const LINHA1 = 'Nenhum grupo deve suportar uma parte desproporcional dos danos.';
const LINHA2 = 'As comunidades têm o direito de decidir sobre o próprio território.';
const Principio: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(11.9) || frame >= f(25.95)) return null;
  const typed = (txt: string, a: number, b: number) => txt.slice(0, Math.round(clamp((frame - f(a)) / (f(b) - f(a))) * txt.length));
  const FOTOS = [{src: 'fotos/poluicao.jpg', at: 17.5, tag: 'NATUREZA', x: 1450, y: 70, r: 4}, {src: 'fotos/favela-aerea.jpg', at: 19.5, tag: 'URBANIZAÇÃO', x: 1490, y: 370, r: -3},
    {src: 'fotos/industria-casas.jpg', at: 20.5, tag: 'ECONOMIA', x: 1440, y: 665, r: 2.5}];
  const cam = tween(frame, f(11.9), f(25.95), 1.0, 1.07, E.camera);
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '42% 50%'}}>
        <div style={{position: 'absolute', left: 150, top: 90, width: 1060, height: 660, background: C.papel, boxShadow: '0 40px 80px rgba(0,0,0,.6)',
          transform: `rotate(-0.8deg) translateY(${approach(frame, f(11.9), 60, 0, 0.12)}px)`, padding: '70px 80px', boxSizing: 'border-box'}}>
          <div style={{fontFamily: TYPE, fontSize: 30, color: C.tinta, letterSpacing: '0.14em', opacity: 0.7}}>{typed('PRINCÍPIO DA JUSTIÇA AMBIENTAL', 11.95, 13.3)}</div>
          <div style={{height: 2, background: C.tinta, opacity: 0.25, margin: '18px 0 46px', width: `${arrive(frame, f(12.2), 0.08) * 100}%`}} />
          <div style={{display: 'flex', gap: 26, fontFamily: TYPE, fontSize: 46, lineHeight: '64px', color: C.tinta}}>
            <span style={{color: C.vermelho, opacity: frame >= f(14.0) ? 1 : 0}}>1.</span>
            <span>{typed(LINHA1, 14.0, 17.4)}</span>
          </div>
          <div style={{display: 'flex', gap: 26, fontFamily: TYPE, fontSize: 46, lineHeight: '64px', color: C.tinta, marginTop: 44}}>
            <span style={{color: C.vermelho, opacity: frame >= f(22.05) ? 1 : 0}}>2.</span>
            <span>{typed(LINHA2, 22.05, 25.3)}</span>
          </div>
        </div>
        {FOTOS.map((p, i) => frame >= f(p.at) && (
          <div key={i} style={{position: 'absolute', left: p.x, top: p.y, width: 400, height: 262, background: '#000', boxShadow: '0 20px 40px rgba(0,0,0,.6)',
            transform: `rotate(${p.r}deg) scale(${approach(frame, f(p.at), 1.3, 1, 0.25)})`, opacity: arrive(frame, f(p.at), 0.3), border: `10px solid ${C.papel}`}}>
            <Photo src={p.src} from={f(p.at)} zoom0={1.02} zoomRate={0.01} filter="atual" />
            <TypeTag text={p.tag} start={f(p.at) + 6} x={-20} y={230} size={26} cps={24} />
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- E · 25,95-31 · de vítimas a sujeitos políticos (a foto ganha cor)
const Sujeitos: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(25.95) || frame >= f(31.0)) return null;
  const cor = clamp((frame - f(29.0)) / 26);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Photo src="obra/educacao-ambiental.mp4" from={f(25.95)} zoom0={1.08} zoomRate={0.02} filter="arquivo" />
      <AbsoluteFill style={{opacity: cor}}>
        <Photo src="obra/educacao-ambiental.mp4" from={f(25.95)} zoom0={1.08} zoomRate={0.02} filter="cor" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- F · 31-43,45 · VITRINE: o mosaico das lutas
const LUTAS = [
  {src: 'fotos/quilombolas.jpg', at: 31.1, tag: 'QUILOMBOLAS'},
  {src: 'fotos/movimento-moradia.jpg', at: 34.4, tag: 'MORADIA'},
  {src: 'obra/mutirao-limpeza.mp4', at: 36.15, tag: 'SANEAMENTO'},
  {src: 'fotos/coletivos-poluicao.jpg', at: 39.4, tag: 'CONTRA A POLUIÇÃO'},
];
const Mosaico: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(31.0) || frame >= f(43.45)) return null;
  const G = 16, PW = (1920 - 3 * G) / 2, PH = (1080 - 3 * G) / 2;
  const recua = tween(frame, f(42.4), f(43.45), 1, 0.9, E.expressiva);
  return (
    <AbsoluteFill style={{background: C.fundo, transform: `scale(${recua})`}}>
      {LUTAS.map((l, i) => (
        <React.Fragment key={i}>
          <Painel x={G + (i % 2) * (PW + G)} y={G + Math.floor(i / 2) * (PH + G)} w={PW} h={PH} start={f(l.at)} fotos={[{src: l.src, at: f(l.at), filtro: 'cor'}]} zoom={1.05} />
          <TypeTag text={l.tag} start={f(l.at) + 5} x={G + (i % 2) * (PW + G) + 40} y={G + Math.floor(i / 2) * (PH + G) + 40} size={34} cps={24} />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- G · 43,45-50,4 · campo de disputa · pode ser transformado
const Campo: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(43.45) || frame >= f(50.45)) return null;
  const cor = clamp((frame - f(49.3)) / 30);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Photo src="fotos/favela-hoje-aberta.jpg" from={f(43.45)} zoom0={1.16} zoomRate={-0.02} filter="atual" />
      <AbsoluteFill style={{opacity: cor}}>
        <Photo src="fotos/favela-hoje-aberta.jpg" from={f(43.45)} zoom0={1.16} zoomRate={-0.02} filter="cor" />
      </AbsoluteFill>
      <Isolinhas start={f(46.7)} cx={960} cy={540} cor={cor > 0.5 ? C.papel : C.terracota} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- H · 50,4-fim · Geografia: ONDE · Sociologia: POR QUÊ
const D3 = dados as {mapa: number[][]; favela: number[]};
const fav = new Set(D3.favela);
const Sintese: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(50.45)) return null;
  const dir = frame >= f(54.6);
  const corte = dir ? tween(frame, f(54.6), f(55.1), 1920, 960, E.expressiva) : 1920;
  const fim = clamp((frame - f(58.7)) / 30);
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <AbsoluteFill style={{clipPath: `inset(0 ${1920 - corte}px 0 0)`}}>
        <AbsoluteFill style={{transform: `translateX(${-(1920 - corte) / 2}px)`}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform="translate(470 40) scale(0.9)">
              {D3.mapa.map(([x, y], i) => {
                const ap = arrive(frame, f(50.6) + Math.hypot(x - 600, y - 540) / 30, 0.25);
                const lit = fav.has(i) && frame >= f(52.6);
                return <circle key={i} cx={x} cy={y} r={lit ? 5 : 3.4} fill={lit ? C.terracota : C.papel} opacity={ap * (lit ? 1 : 0.35)} />;
              })}
            </g>
          </svg>
          <TypeTag text="GEOGRAFIA · ONDE" start={f(51.1)} x={760} y={960} size={36} cps={24} />
        </AbsoluteFill>
      </AbsoluteFill>
      {dir && (
        <AbsoluteFill style={{clipPath: `inset(0 0 0 ${corte}px)`}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform="translate(870 70) scale(0.85)">
              <Desenho ds={PREDIO} start={f(54.8)} stagger={1} dur={10} />
              <Desenho ds={CIDADE} start={f(55.2)} stagger={1} dur={8} />
              <Desenho ds={ESCADA} start={f(55.6)} dur={10} />
            </g>
          </svg>
          <TypeTag text="SOCIOLOGIA · POR QUÊ" start={f(55.1)} x={1180} y={960} size={36} cps={24} />
        </AbsoluteFill>
      )}
      {dir && <div style={{position: 'absolute', left: corte - 3, top: 0, width: 6, height: 1080 * clamp((frame - f(54.6)) / 12), background: C.terracota}} />}
      <AbsoluteFill style={{background: '#000', opacity: fim}} />
    </AbsoluteFill>
  );
};

export const Parte6: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Abre />
      <Balanca />
      <TituloConceito l1="JUSTIÇA" l2="AMBIENTAL" t1={10.46} t2={11.04} size={210} desde={10.4} ate={11.95} />
      <Principio />
      <Sujeitos />
      <Mosaico />
      <Campo />
      <Sintese />
      <NameTape name="Maria Alice" start={f(4.9)} dur={f(2.6)} x={140} y={560} />
      <Caption cues={CUES} />
      <Grain amount={0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

export {SERIF};
