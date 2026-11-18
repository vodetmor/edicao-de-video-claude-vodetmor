import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate, Img} from 'remotion';
import geo from './data/africa.json';
import {T} from './theme';
import {approach, prog, cam, s, hash} from './kit';

// Cena "A África não é um país" (fala do Vítor, WA0017).
// Tempos = início de cada palavra na transcrição do áudio limpo + OFF.
export const OFF = 15;
const w = (t: number) => s(t) + OFF;
export const PAIS = {
  fome: w(4.06), guerra: w(4.66), a: w(5.26), africa: w(5.78), pais: w(6.54),
  sao: w(7.46), n54: w(7.76), mil: w(9.9), linguas: w(10.28), fim: w(11.1),
};
export const DUR_PAIS = PAIS.fim + s(5.6);

type C = typeof geo.countries[number];
const somalia = geo.countries.find(c => c.name === 'Somalia')!;
const [mx, my] = [960, 487];
// ordem das bandeiras: do centro do continente para fora; a Somália por último
const ordem = geo.countries
  .filter(c => c.iso && c.iso !== 'so')
  .map(c => ({c, d: Math.hypot(c.label[0] - 900, c.label[1] - 560) + hash(c.label[0]) * 60}))
  .sort((a, b) => a.d - b.d).map(o => o.c);
const F0 = PAIS.n54, F1 = w(9.75);
const quando = new Map<string, number>(ordem.map((c, i) => [c.iso!, F0 + Math.round((i / (ordem.length - 1)) * (F1 - F0))]));
quando.set('so', w(10.35));

// ponto da "?": na ponta do Chifre (51,3 L · 11,8 N) empurrada para o mar
const Q = {x: 1328, y: 365};

const Palavra: React.FC<{txt: string; x: number; y: number; ini: number; fim: number; rot: number}> = ({txt, x, y, ini, fim, rot}) => {
  const f = useCurrentFrame();
  if (f < ini) return null;
  const sc = approach(f, ini, 1.35, 1, 0.22);
  const op = Math.min(1, (f - ini) / 3);
  const letras = txt.split('');
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`,
      fontFamily: T.serif, fontStyle: 'italic', fontSize: 132, color: T.papel, opacity: op, whiteSpace: 'nowrap', letterSpacing: '-0.01em'}}>
      {letras.map((l, i) => {
        const t = Math.max(0, f - fim - i * 1.5);
        const dx = (hash(i + txt.length) - 0.5) * t * 4, dy = -t * (1.2 + hash(i * 3) * 2);
        return <span key={i} style={{display: 'inline-block', transform: `translate(${dx}px,${dy}px)`,
          filter: `blur(${Math.min(14, t * 0.7)}px)`, opacity: interpolate(t, [0, 22], [1, 0], {extrapolateRight: 'clamp'})}}>{l}</span>;
      })}
    </div>
  );
};

export const AfricaPais: React.FC<{comAudio?: boolean}> = ({comAudio = true}) => {
  const f = useCurrentFrame();
  // câmera: deriva lenta (nunca congela) e depois mergulha na Somália
  const z0 = 1 + f * 0.0006;
  const zPush = prog(f, PAIS.fim + s(1.0), PAIS.fim + s(4.2), cam);
  const [sx0, sy0, sx1, sy1] = somalia.bbox;
  const zT = 3.4;
  const cx = interpolate(zPush, [0, 1], [mx, (sx0 + sx1) / 2 - 20]);
  const cy = interpolate(zPush, [0, 1], [my, (sy0 + sy1) / 2]);
  const z = z0 * interpolate(zPush, [0, 1], [1, zT]);
  const camT = `translate(960 540) scale(${z}) translate(${-cx} ${-cy})`;

  const silh = prog(f, 0, 40);
  const contorno = prog(f, 4, 80, cam);
  const duvida = prog(f, PAIS.africa, PAIS.africa + 12);
  const bordas = prog(f, PAIS.sao, PAIS.sao + 24);
  const apaga = prog(f, PAIS.fim + s(0.4), PAIS.fim + s(1.6));
  const qIn = f >= PAIS.pais - 4 ? approach(f, PAIS.pais - 4, 0, 1, 0.2) : 0;
  const qOut = prog(f, PAIS.sao + 4, PAIS.sao + 16);
  const nShown = [...quando.values()].filter(q => f >= q).length;
  const contador = Math.min(54, nShown);
  const painel = prog(f, PAIS.n54 - 2, PAIS.n54 + 12) * (1 - prog(f, PAIS.fim + s(1.0), PAIS.fim + s(1.8)));
  const linguas = prog(f, PAIS.mil, PAIS.mil + 14);
  const nome = prog(f, PAIS.fim + s(3.4), PAIS.fim + s(4.6));
  const lw = 1 / z; // linhas finas com qualquer zoom

  return (
    <AbsoluteFill style={{background: T.bg}}>
      {comAudio && <Audio src={staticFile('audio/vitor-WA0017-limpo.wav')} startFrom={0} volume={1} />}
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          {geo.countries.map((c, i) => (
            <clipPath id={`k${i}`} key={i}><path d={c.d} /></clipPath>
          ))}
          <filter id="sombra" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy={6 * lw} stdDeviation={8 * lw} floodColor="#000" floodOpacity="0.7" />
          </filter>
        </defs>
        <g transform={camT}>
          {/* silhueta: o continente como "um país" só */}
          <path d={geo.outline} fill={T.terra} opacity={silh} />
          {/* bandeiras entram derramando a partir do centro visual de cada país */}
          {geo.countries.map((c, i) => {
            if (!c.iso) return null;
            const q = quando.get(c.iso)!;
            if (f < q) return null;
            const [x0, y0, x1, y1] = c.bbox;
            const R = Math.hypot(x1 - x0, y1 - y0);
            const r = approach(f, q, 0, R, 0.16);
            const ehSom = c.iso === 'so';
            const dim = ehSom ? 1 : 1 - apaga * 0.84;
            return (
              <g key={c.iso} clipPath={`url(#k${i})`} opacity={dim} style={{filter: ehSom ? 'none' : `saturate(${1 - apaga * 0.9})`}}>
                <clipPath id={`r${i}`}><circle cx={c.label[0]} cy={c.label[1]} r={r} /></clipPath>
                {c.iso === 'so' ? (
                  // Somália: azul + estrela do tamanho do território (a bandeira inteira some no recorte)
                  <g clipPath={`url(#r${i})`}>
                    <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={T.azul} />
                    <path d={estrela(c.label[0] + c.inR * 0.1, c.label[1], c.inR * 0.95)} fill="#fff" />
                  </g>
                ) : (() => {
                  // bandeira centrada no centro visual do país (a estrela da Somália cai no meio do território)
                  const [lx, ly] = c.label;
                  let fw = 2 * Math.max(lx - x0, x1 - lx), fh = 2 * Math.max(ly - y0, y1 - ly);
                  if (fw / fh > 1.5) fh = fw / 1.5; else fw = fh * 1.5;
                  return <image href={staticFile(`flags/${c.iso}.svg`)} x={lx - fw / 2} y={ly - fh / 2} width={fw} height={fh}
                    preserveAspectRatio="xMidYMid slice" clipPath={`url(#r${i})`} />;
                })()}
              </g>
            );
          })}
          {/* fronteiras internas se desenham em "São 54 países" */}
          {geo.countries.map((c, i) => {
            const d0 = PAIS.sao + Math.round(hash(i * 7) * 14);
            const p = prog(f, d0, d0 + 16);
            if (p <= 0) return null;
            return <path key={'b' + i} d={c.d} fill="none" stroke={T.papel} strokeOpacity={0.55 * (1 - apaga * 0.5)}
              strokeWidth={1.1 * lw} pathLength={1} strokeDasharray={`${p} 1`} strokeLinejoin="round"
              strokeDashoffset={0} />;
          })}
          {/* contorno externo: vira tracejado quando a dúvida aparece */}
          <path d={geo.outline} fill="none" stroke={T.papel} strokeWidth={2.4 * lw} strokeLinejoin="round"
            pathLength={1} strokeDasharray={duvida > 0 && bordas < 0.5 ? `${0.004 * duvida + 0.0001} ${0.004 * duvida}` : `${contorno} 1`}
            opacity={1 - apaga * 0.6} />
          {geo.countries.filter(c => c.iso && c.inR < 4.5).map(c => {
            const q = quando.get(c.iso!)!;
            if (f < q) return null;
            const k = approach(f, q, 0, 1, 0.2);
            const r = 11 * k / Math.sqrt(z);
            return (
              <g key={'s' + c.iso} opacity={1 - apaga * 0.84}>
                <clipPath id={`sc${c.iso}`}><circle cx={c.label[0]} cy={c.label[1]} r={r} /></clipPath>
                <image href={staticFile(`flags/${c.iso}.svg`)} x={c.label[0] - r * 1.5} y={c.label[1] - r} width={r * 3} height={r * 2}
                  preserveAspectRatio="xMidYMid slice" clipPath={`url(#sc${c.iso})`} />
                <circle cx={c.label[0]} cy={c.label[1]} r={r} fill="none" stroke={T.papel} strokeWidth={1.4 * lw} />
              </g>
            );
          })}
          {/* Somália em evidência no mergulho */}
          {apaga > 0 && (
            <g filter="url(#sombra)">
              <path d={geo.somalia} fill="none" stroke={T.papel} strokeWidth={2.2 * lw} opacity={apaga} />
            </g>
          )}
        </g>
      </svg>

      {/* "?" pousada sobre a fronteira, no Chifre */}
      {qIn > 0 && qOut < 1 && (() => {
        const [px, py] = [960 + (Q.x - cx) * z, 540 + (Q.y - cy) * z];
        return (
          <div style={{position: 'absolute', left: px, top: py, transform: `translate(-50%,-62%) scale(${0.5 + 0.5 * qIn}) rotate(${(1 - qIn) * -14}deg)`,
            opacity: Math.min(1, qIn * 1.5) * (1 - qOut), fontFamily: T.serif, fontSize: 190, lineHeight: 1, color: T.azul}}>?</div>
        );
      })()}

      {/* rótulo de país dado ao continente inteiro */}
      <div style={{position: 'absolute', left: 960 + (985 - cx) * z, top: 540 + (430 - cy) * z, transform: 'translate(-50%,-50%)',
        fontFamily: T.sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.42em', color: T.papel,
        opacity: prog(f, 26, 46) * (1 - prog(f, PAIS.sao - 2, PAIS.sao + 8))}}>ÁFRICA</div>

      <Palavra txt="Fome" x={560} y={360} ini={PAIS.fome} fim={PAIS.a} rot={-4} />
      <Palavra txt="guerra" x={1390} y={720} ini={PAIS.guerra} fim={PAIS.a + 3} rot={3} />

      {/* contador */}
      <div style={{position: 'absolute', left: 140, top: 330, opacity: painel, transform: `translateY(${(1 - painel) * 24}px)`}}>
        <div style={{fontFamily: T.serif, fontSize: 210, lineHeight: 0.9, color: T.papel, fontVariantNumeric: 'tabular-nums'}}>{contador}</div>
        <div style={{fontFamily: T.sans, fontWeight: 500, fontSize: 34, color: T.papel, letterSpacing: '0.08em', marginTop: 6}}>países</div>
        <div style={{marginTop: 54, opacity: linguas, transform: `translateY(${(1 - linguas) * 18}px)`}}>
          <div style={{fontFamily: T.serif, fontSize: 112, lineHeight: 0.9, color: T.papel}}>1.000+</div>
          <div style={{fontFamily: T.sans, fontWeight: 500, fontSize: 34, color: T.papel, letterSpacing: '0.08em', marginTop: 6}}>línguas</div>
        </div>
      </div>

      {/* nome da Somália ao fim do mergulho */}
      {nome > 0 && (
        <div style={{position: 'absolute', left: 300, top: 470, opacity: nome}}>
          <div style={{fontFamily: T.sans, fontWeight: 600, fontSize: 30, letterSpacing: '0.32em', color: T.azul, marginBottom: 14}}>CHIFRE DA ÁFRICA</div>
          <div style={{fontFamily: T.serif, fontSize: 150, lineHeight: 0.95, color: T.papel, letterSpacing: `${(1 - nome) * 0.2 + 0.02}em`}}>Somália</div>
        </div>
      )}
      <Grao />
    </AbsoluteFill>
  );
};

export const estrela = (cx: number, cy: number, R: number) => {
  const r = R * 0.382; let d = '';
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5; const rr = k % 2 ? r : R;
    d += (k ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(2) + ' ' + (cy + rr * Math.sin(a)).toFixed(2); }
  return d + 'Z';
};

export const Grao: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.07, mixBlendMode: 'screen'}}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 24} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="1920" height="1080" filter="url(#g)" />
      </svg>
      <AbsoluteFill style={{boxShadow: 'inset 0 0 260px 60px rgba(0,0,0,0.55)'}} />
    </AbsoluteFill>
  );
};
