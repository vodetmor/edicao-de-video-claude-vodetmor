import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import geo from './data/africa.json';
import {T} from './theme';
import {approach, prog, cam, s, hash} from './kit';
import {Grao, estrela} from './AfricaPais';

const somalia = geo.countries.find(c => c.name === 'Somalia')!;
const Rot: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{fontFamily: T.sans, fontWeight: 600, fontSize: 26, letterSpacing: '0.3em', color: T.papelMeio, ...style}}>{children}</div>
);

// Ficha do povo (Anna Augusta): entra com molas ao lado das imagens. Fundo transparente para ir por cima do vídeo.
export const Ficha: React.FC = () => {
  const f = useCurrentFrame();
  const itens = [['19 milhões', 'de pessoas'], ['1 língua', 'o somali'], ['fé', 'muçulmana']];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(18,16,13,0.82) 0%, rgba(18,16,13,0.0) 55%)'}} />
      <div style={{position: 'absolute', left: 130, top: 300}}>
        {itens.map(([a, b], i) => {
          const t0 = 8 + i * s(1.1);
          const x = approach(f, t0, -60, 0, 0.17), o = prog(f, t0, t0 + 8);
          return (
            <div key={i} style={{opacity: o, transform: `translateX(${x}px)`, marginBottom: 46, display: 'flex', alignItems: 'baseline', gap: 22}}>
              <div style={{width: 6, height: 64, background: i === 0 ? T.azul : T.papel, alignSelf: 'center'}} />
              <div>
                <div style={{fontFamily: T.serif, fontSize: 92, lineHeight: 0.95, color: T.papel}}>{a}</div>
                <div style={{fontFamily: T.sans, fontWeight: 500, fontSize: 30, color: T.papel, opacity: 0.8, marginTop: 4}}>{b}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Linha do tempo + mapa que racha (Yago)
export const Tempo: React.FC<{t?: {t1960: number; t1969: number; t1991: number; racha: number}}> = ({t = {t1960: 0.4, t1969: 2.5, t1991: 4.6, racha: 6.2}}) => {
  const f = useCurrentFrame();
  const marcos = [['1960', 'independência'], ['1969', 'Siad Barre toma o poder'], ['1991', 'o Estado desmorona']];
  const tm = [t.t1960, t.t1969, t.t1991];
  const racha = prog(f, s(t.racha), s(t.racha + 1.2), cam);
  const [x0, y0, x1, y1] = somalia.bbox; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; const z = 4.4;
  const linha = prog(f, 4, s(t.t1991 + 0.6), (x) => x);
  // pedaços: o mapa é cortado por 7 linhas e cada pedaço se afasta
  const peda = Array.from({length: 7}, (_, i) => i);
  return (
    <AbsoluteFill style={{background: T.bg}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>{peda.map(i => <clipPath id={`pz${i}`} key={i}><polygon points={`${-2000},${cy - 120 + i * 40 + (hash(i) - 0.5) * 30} 4000,${cy - 160 + i * 40 + (hash(i + 9) - 0.5) * 50} 4000,${cy - 120 + (i + 1) * 40} -2000,${cy - 80 + (i + 1) * 40}`} /></clipPath>)}</defs>
        <g transform={`translate(1240 560) scale(${z * (1 + f * 0.0004)}) translate(${-cx} ${-cy})`}>
          {peda.map(i => (
            <g key={i} clipPath={`url(#pz${i})`} transform={`translate(${(hash(i * 3) - 0.5) * 14 * racha} ${(i - 3) * 5 * racha}) rotate(${(hash(i * 5) - 0.5) * 6 * racha} ${cx} ${cy})`}>
              <path d={geo.somalia} fill={T.terraLuz} stroke={T.papel} strokeWidth={0.5} />
            </g>
          ))}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 130, top: 250, width: 640}}>
        <div style={{position: 'absolute', left: 9, top: 20, width: 2, height: 520 * linha, background: T.papelMeio}} />
        {marcos.map(([a, b], i) => {
          const t0 = s(tm[i]);
          const o = prog(f, t0, t0 + 10), y = approach(f, t0, 26, 0, 0.17);
          return (
            <div key={i} style={{opacity: o, transform: `translateY(${y}px)`, position: 'relative', paddingLeft: 52, marginBottom: 70}}>
              <div style={{position: 'absolute', left: 0, top: 34, width: 20, height: 20, borderRadius: 10, background: i === 2 ? T.azul : T.papel}} />
              <div style={{fontFamily: T.serif, fontSize: 96, lineHeight: 1, color: T.papel}}>{a}</div>
              <div style={{fontFamily: T.sans, fontWeight: 500, fontSize: 30, color: T.papel, opacity: 0.8}}>{b}</div>
            </div>
          );
        })}
      </div>
      <Grao />
    </AbsoluteFill>
  );
};

// Atentado de 14/10/2017 (Maria Eduarda): data seca, número devagar e fica
export const Atentado: React.FC<{t?: {data: number; num: number}}> = ({t = {data: 0.3, num: 1.6}}) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(prog(f, s(t.num), s(t.num + 2.4), (x) => 1 - Math.pow(1 - x, 3)), [0, 1], [0, 500]));
  const data = f >= s(t.data);
  return (
    <AbsoluteFill style={{background: T.bg, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', transform: `scale(${1 + f * 0.0006})`}}>
        <div style={{fontFamily: T.sans, fontWeight: 600, fontSize: 34, letterSpacing: '0.34em', color: T.papel, opacity: data ? 1 : 0}}>MOGADÍSCIO · 14/10/2017</div>
        <div style={{fontFamily: T.serif, fontSize: 300, lineHeight: 1, color: T.papel, marginTop: 24, opacity: prog(f, s(t.num - 0.2), s(t.num + 0.2)), fontVariantNumeric: 'tabular-nums'}}>
          {n}{n >= 500 ? <span style={{color: T.azul}}>+</span> : null}
        </div>
        <div style={{fontFamily: T.serif, fontStyle: 'italic', fontSize: 50, color: T.papel, opacity: prog(f, s(t.num + 2.6), s(t.num + 3.3))}}>pessoas mortas por um caminhão-bomba</div>
      </div>
      <Grao />
    </AbsoluteFill>
  );
};

// Seca de 2011 (Luisa): 1 ponto = 1.000 pessoas; contador até 250.000 e metade (crianças) marcada
export const Seca: React.FC<{t?: {ini: number; cheio: number; metade: number}}> = ({t = {ini: 0.5, cheio: 4.0, metade: 5.0}}) => {
  const f = useCurrentFrame();
  const N = 250, cols = 25;
  const cheio = prog(f, s(t.ini), s(t.cheio), (x) => x);
  const vis = Math.floor(cheio * N);
  const metade = prog(f, s(t.metade), s(t.metade + 1.0));
  return (
    <AbsoluteFill style={{background: T.bg}}>
      <div style={{position: 'absolute', left: 130, top: 340}}>
        <Rot>SOMÁLIA · SECA DE 2011</Rot>
        <div style={{fontFamily: T.serif, fontSize: 170, lineHeight: 1, color: T.papel, marginTop: 14, fontVariantNumeric: 'tabular-nums'}}>{(vis * 1000).toLocaleString('pt-BR')}</div>
        <div style={{fontFamily: T.sans, fontWeight: 500, fontSize: 32, color: T.papel, opacity: 0.85}}>mortos pela fome</div>
        <div style={{fontFamily: T.sans, fontWeight: 500, fontSize: 32, color: T.azul, marginTop: 30, opacity: metade}}>metade eram crianças</div>
        <div style={{fontFamily: T.sans, fontSize: 22, color: T.papelMeio, marginTop: 40}}>cada ponto = 1.000 pessoas</div>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: vis}, (_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const crianca = i % 2 === 0;
          return <circle key={i} cx={1020 + c * 30} cy={250 + r * 58} r={9} fill={crianca && metade > 0 ? T.azul : T.papel} opacity={crianca ? 1 : 1 - metade * 0.55} />;
        })}
      </svg>
      <Grao />
    </AbsoluteFill>
  );
};

// Final (Vítor): a estrela fica sozinha e o título entra
export const Final: React.FC = () => {
  const f = useCurrentFrame();
  const e = approach(f, 6, 0, 1, 0.08);
  const t = prog(f, s(2.2), s(3.4));
  return (
    <AbsoluteFill style={{background: T.bg}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={estrela(960, 430, 150 * e * (1 + f * 0.0006))} fill={T.papel} />
      </svg>
      <div style={{position: 'absolute', top: 650, width: '100%', textAlign: 'center', opacity: t, transform: `translateY(${(1 - t) * 14}px)`}}>
        <div style={{fontFamily: T.serif, fontSize: 96, color: T.papel, lineHeight: 1}}>Somália</div>
        <div style={{fontFamily: T.serif, fontStyle: 'italic', fontSize: 50, color: T.papel, opacity: 0.75, marginTop: 10}}>a África que ninguém conta</div>
      </div>
      <Grao />
    </AbsoluteFill>
  );
};
