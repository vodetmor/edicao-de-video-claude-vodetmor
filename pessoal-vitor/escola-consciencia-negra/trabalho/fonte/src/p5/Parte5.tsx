// PARTE 5 · Anna Augusta (saneamento e dignidade). Relógio: public/p5/words.json.
// Vitrines: a lista do "mínimo" que vira negação (0-12,8) e o MAPA da parte 1 com a rede que não chega (31,5-37,3).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, E, FILTRO, approach, arrive, clamp, f, rand, tween} from '../lib';
import {Grain, NameTape, Photo, SERIF, TYPE, TypeTag, useFonts} from '../kit';
import {Traco} from '../kit2';
import {Caption} from '../Caption';
import {CUES} from './captions';
import {CENTRO, QUADS, rioY} from '../scenes/Riscos';
import words from '../../public/p5/words.json';

export const DURACAO_P5 = 56.4;
const W = words as {w: string; s: number; e: number}[];

// ---------------------------------------------------------------- A+B · 0-12,85 · a lista do mínimo
const ITENS = [
  {t: 'ÁGUA TRATADA', at: 0.72, num: '33 MILHÕES SEM', nt: 11.1},
  {t: 'COLETA DE ESGOTO', at: 1.88, num: '90 MILHÕES SEM', nt: 11.55},
  {t: 'COLETA DE LIXO', at: 3.02, num: '', nt: 0},
  {t: 'DRENAGEM', at: 4.16, num: '', nt: 0},
];
const Lista: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= f(12.85)) return null;
  const cam = tween(frame, 0, f(12.85), 1.0, 1.1, E.camera);
  const nega = f(10.72);
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <AbsoluteFill style={{transform: `scale(${cam}) rotate(${-0.6 + 0.6 * (frame / f(12.85))}deg)`, transformOrigin: '50% 45%'}}>
        <div style={{position: 'absolute', left: 620, top: 90, width: 1180, height: 650, background: C.papel, boxShadow: '0 40px 80px rgba(0,0,0,.6)',
          transform: `rotate(-1deg) translateY(${approach(frame, 0, 40, 0, 0.1)}px)`, padding: '64px 80px', boxSizing: 'border-box'}}>
          <div style={{fontFamily: TYPE, fontSize: 30, color: C.tinta, letterSpacing: '0.12em', opacity: 0.75, height: 44}}>
            {frame >= f(5.0) ? 'O MÍNIMO PARA UMA VIDA DIGNA'.slice(0, Math.floor(((frame - f(5.0)) / 30) * 20) + 1) : ''}
          </div>
          <div style={{height: 2, background: C.tinta, opacity: 0.25, marginTop: 10, marginBottom: 34, width: `${arrive(frame, f(5.0), 0.08) * 100}%`}} />
          {ITENS.map((it, i) => {
            const n = frame < f(it.at) ? 0 : Math.floor(((frame - f(it.at)) / 30) * 26) + 1;
            const check = f(6.4) + i * 3;
            const x = nega + i * 3;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', height: 104, position: 'relative'}}>
                <svg width={70} height={70} style={{marginRight: 34, overflow: 'visible', opacity: frame >= f(it.at) ? 1 : 0}}>
                  <rect x={4} y={4} width={62} height={62} fill="none" stroke={C.tinta} strokeWidth={4} />
                  {frame < x && <Traco d="M 14 36 L 30 54 L 62 8" start={check} dur={6} cor={C.tinta} w={7} len={90} />}
                  {frame >= x && (
                    <>
                      <Traco d="M 8 8 L 64 62" start={x} dur={4} cor={C.vermelho} w={9} len={90} />
                      <Traco d="M 64 8 L 8 62" start={x + 3} dur={4} cor={C.vermelho} w={9} len={90} />
                    </>
                  )}
                </svg>
                <span style={{fontFamily: TYPE, fontSize: 46, color: C.tinta, letterSpacing: '0.04em', whiteSpace: 'pre'}}>
                  {it.t.slice(0, n)}
                  <span style={{opacity: 0}}>{it.t.slice(n)}</span>
                </span>
                {it.num && frame >= f(it.nt) && (
                  <span style={{position: 'absolute', right: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: C.vermelho,
                    opacity: arrive(frame, f(it.nt), 0.2), transform: `translateX(${approach(frame, f(it.nt), 30, 0, 0.2)}px) rotate(-2deg)`,
                    fontVariantNumeric: 'lining-nums'}}>
                    {it.num}
                  </span>
                )}
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 80, bottom: 44, fontFamily: TYPE, fontSize: 22, color: C.tinta, opacity: 0.6 * arrive(frame, f(12.0), 0.2), letterSpacing: '0.08em'}}>
            SINISA 2024 · INSTITUTO TRATA BRASIL
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C+D · 12,85-22,4 · o essencial (em cor) e a desigualdade
const NATUREZA = [
  {src: 'fotos/natureza-espaco.jpg', at: 12.85, tag: ''},
  {src: 'fotos/natureza-agua.jpg', at: 15.66, tag: 'ÁGUA'},
  {src: 'fotos/natureza-solo.jpg', at: 16.28, tag: 'SOLO'},
  {src: 'fotos/natureza-ar.jpg', at: 16.95, tag: 'AR'},
  {src: 'fotos/natureza-espaco.jpg', at: 17.98, tag: 'ESPAÇO'},
];
const Essencial: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(12.85) || frame >= f(22.42)) return null;
  const k = [...NATUREZA].reverse().findIndex((n) => frame >= f(n.at));
  const n = NATUREZA[NATUREZA.length - 1 - k];
  const corte = clamp((frame - f(20.84)) / 18);
  const s0 = f(n.at);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${n.at > 13 ? approach(frame, s0, 1.08, 1, 0.2) : 1})`}}>
        <Photo src={n.src} from={s0} zoom0={1.02} zoomRate={0.02} filter="cor" />
      </AbsoluteFill>
      {corte > 0 && (
        <AbsoluteFill style={{clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 42% 100%)', opacity: corte}}>
          <Photo src={n.src} from={s0} zoom0={1.02} zoomRate={0.02} filter="grayscale(1) contrast(1.15) brightness(0.55)" />
        </AbsoluteFill>
      )}
      {corte > 0 && (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <Traco d="M 1114 -10 L 806 1090" start={f(20.84)} dur={10} cor={C.terracota} w={6} len={1200} />
        </svg>
      )}
      {n.tag && <TypeTag text={n.tag} start={s0 + 1} x={150} y={170} size={46} cps={20} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- E+F · 22,4-31,5 · crianças e enchente, ano após ano
const Cotidiano: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(22.42) || frame >= f(31.52)) return null;
  const enchente = frame >= f(26.1);
  const anos = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const ai = Math.min(anos.length - 1, Math.max(0, Math.floor((frame - f(29.05)) / 5)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!enchente && <Photo src="obra/balde-buraco.mp4" from={f(22.42)} zoom0={1.04} zoomRate={0.018} filter="atual" />}
      {enchente && <Photo src="obra/enchente-carro.mp4" from={f(26.1)} zoom0={1.1} zoomRate={-0.012} filter="atual" />}
      {frame >= f(29.05) && (
        <div style={{position: 'absolute', right: 150, top: 150, width: 300, height: 250, background: C.papel, boxShadow: '0 20px 50px rgba(0,0,0,.6)',
          transform: `rotate(2deg) scale(${approach(frame, f(29.05), 0.8, 1, 0.25)})`, overflow: 'hidden', perspective: 600}}>
          <div style={{height: 60, background: C.vermelho}} />
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 120, color: C.tinta, textAlign: 'center', lineHeight: '180px', fontVariantNumeric: 'lining-nums',
            transform: `rotateX(${(frame - f(29.05)) % 5 < 2 && ai < anos.length - 1 ? 60 : 0}deg)`}}>
            {anos[ai]}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- G · 31,5-37,35 · VITRINE: o mapa da parte 1 e a rede que não chega
const REDE = (() => {
  const fonte = {x: 120, y: 80};
  const qs = QUADS.filter((q) => !q.bairro && q.cy < rioY(q.cx) + 400)
    .map((q) => ({...q, d: Math.hypot(q.cx - fonte.x, q.cy - fonte.y)}))
    .sort((a, b) => a.d - b.d);
  const segs: {x1: number; y1: number; x2: number; y2: number; d: number}[] = [];
  qs.forEach((q, i) => {
    if (i === 0) { segs.push({x1: fonte.x, y1: fonte.y, x2: q.cx, y2: q.cy, d: 0}); return; }
    let best = qs[0], bd = 1e9;
    for (let j = 0; j < i; j++) { const dd = Math.hypot(qs[j].cx - q.cx, qs[j].cy - q.cy); if (dd < bd) { bd = dd; best = qs[j]; } }
    segs.push({x1: best.cx, y1: best.cy, x2: q.cx, y2: q.cy, d: best.d});
  });
  return {segs, casas: qs};
})();
const Rede: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(31.5) || frame >= f(37.35)) return null;
  const t0 = f(32.6);
  const vel = 2400 / f(1.5); // px de rede por quadro
  const cam = tween(frame, f(34.9), f(36.4), 1, 1.35, E.camera);
  const bairroPulso = 0.5 + 0.5 * Math.sin((frame - t0) / 5);
  return (
    <AbsoluteFill style={{background: '#16110E', opacity: arrive(frame, f(31.5), 0.25)}}>
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: `${CENTRO.x}px ${CENTRO.y}px`}}>
        <svg width={1920} height={1080}>
          {QUADS.map((q, i) => (
            <polygon key={i} points={q.pts.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={q.bairro ? C.vermelho : '#2A211B'} fillOpacity={q.bairro ? 0.35 + 0.25 * clamp((frame - f(33.3)) / 12) : 0.7 + 0.3 * rand(i)}
              stroke={q.bairro ? C.terracota : 'none'} strokeWidth={3} strokeOpacity={q.bairro ? 0.4 + 0.5 * bairroPulso * clamp((frame - f(33.3)) / 12) : 0} />
          ))}
          <path d={(() => { const r: string[] = []; for (let x = -60; x <= 1980; x += 30) r.push(`${x === -60 ? 'M' : 'L'} ${x} ${rioY(x).toFixed(1)}`); return r.join(' '); })()}
            stroke="#23302F" strokeWidth={96} fill="none" strokeLinejoin="round" />
          {REDE.segs.map((s, i) => {
            const L = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
            const start = t0 + s.d / vel;
            const p = clamp((frame - start) / Math.max(3, L / vel));
            if (p <= 0) return null;
            return <line key={i} x1={s.x1} y1={s.y1} x2={s.x1 + (s.x2 - s.x1) * p} y2={s.y1 + (s.y2 - s.y1) * p} stroke={C.papel} strokeWidth={2.4} opacity={0.75} />;
          })}
          {REDE.casas.map((q, i) => {
            const start = t0 + q.d / vel + 4;
            if (frame < start) return null;
            return <circle key={i} cx={q.cx} cy={q.cy} r={6 * arrive(frame, start, 0.3)} fill={C.papel} />;
          })}
        </svg>
        <TypeTag text="BEIRA DO RIO" start={f(35.3)} x={CENTRO.x - 170} y={CENTRO.y - 250} size={40} cps={24} />
      </AbsoluteFill>
      <TypeTag text="ÁGUA · ESGOTO · DRENAGEM" start={f(32.7)} end={f(34.8)} x={110} y={930} size={30} cps={26} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- H · 37,35-45,4 · a proposta da obra (página tipográfica)
const Pagina: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(37.35) || frame >= f(45.45)) return null;
  const ws = W.filter((w) => w.s >= 39.45 && w.s < 44.5);
  const sub = ws.findIndex((w) => w.w === 'direito');
  return (
    <AbsoluteFill style={{background: C.fundo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{width: 1300, background: C.papel, padding: '90px 110px 100px', boxSizing: 'border-box', boxShadow: '0 40px 90px rgba(0,0,0,.6)',
        transform: `rotate(0.6deg) scale(${tween(frame, f(37.35), f(45.4), 1, 1.05, E.camera)}) translateY(${approach(frame, f(37.35), 50, 0, 0.12)}px)`, position: 'relative'}}>
        <TypeTag text="A OBRA PROPÕE" start={f(38.1)} x={-40} y={-30} size={32} cps={22} rot={-2} />
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 70, lineHeight: '96px', color: C.tinta}}>
          {ws.map((w, i) => {
            const vis = frame >= f(w.s);
            const u = i >= sub && sub >= 0;
            return (
              <span key={i} style={{opacity: vis ? arrive(frame, f(w.s), 0.25) : 0, position: 'relative', display: 'inline-block', marginRight: 18,
                color: u ? C.vermelho : C.tinta}}>
                {w.w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- I · 45,4-56,4 · dignidade negada no lugar onde vive
const Dignidade: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(45.4)) return null;
  const retrato = frame >= f(48.2);
  const lugar = frame >= f(53.2);
  const fim = clamp((frame - f(55.4)) / 30);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!retrato && <Photo src="fotos/esgoto.jpg" from={f(45.4)} zoom0={1.12} zoomRate={-0.015} filter="atual" />}
      {retrato && !lugar && <Photo src="fotos/retrato-periferia-b.jpg" from={f(48.2)} zoom0={1.02} zoomRate={0.022} filter="atual" />}
      {lugar && (
        <AbsoluteFill style={{opacity: arrive(frame, f(53.2), 0.12)}}>
          <Photo src="fotos/favela-hoje-aberta.jpg" from={f(53.2)} zoom0={1.18} zoomRate={-0.03} filter="atual" />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: '#000', opacity: fim}} />
    </AbsoluteFill>
  );
};

export const Parte5: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Lista />
      <Essencial />
      <Cotidiano />
      <Rede />
      <Pagina />
      <Dignidade />
      <NameTape name="Anna Augusta" start={f(8.52)} dur={f(3.0)} x={140} y={560} />
      <Caption cues={CUES} />
      <Grain amount={0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

export {FILTRO};
