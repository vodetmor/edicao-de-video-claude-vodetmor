import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import geo from './data/africa.json';
import {T} from './theme';
import {approach, prog, cam, s, hash} from './kit';
import {Grao} from './AfricaPais';

// "Os europeus cortaram esse povo em pedaços": mapa real de 1884 (Ravenstein) -> terra somali inteira com a estrela
// -> cada ponta da estrela voa para uma das 5 partes e a régua risca a fronteira.
// Tempos provisórios (fala do Urley ainda não chegou): trocar por início de palavra quando chegar.
export const TP0 = {
  dissolve: s(3.4), britanico: s(5.0), italiano: s(6.2), frances: s(7.3), etiopia: s(8.9), quenia: s(10.0), pontas: s(11.6), fim: s(14),
};
export const TP = TP0;
export const DUR_PARTILHA = TP0.fim;
const P = {papel: '#E6DAC3', papelEsc: '#CDBB98', tinta: '#4A3626', tintaMeio: 'rgba(74,54,38,0.55)'};
const R = geo.regions as Record<string, {d: string; c: number[]; bbox: number[]}>;
const partesDe = (TP: typeof TP0) => [
  {k: 'britanica', t: TP.britanico, nome: 'BRITÂNICA', ano: '1884', ang: 0, off: [60, -48]},
  {k: 'italiana', t: TP.italiano, nome: 'ITALIANA', ano: '1889', ang: 1, off: [52, 30]},
  {k: 'francesa', t: TP.frances, nome: 'FRANCESA', ano: '1883', ang: 4, off: [-70, -8]},
  {k: 'etiope', t: TP.etiopia, nome: 'ETIÓPIA', ano: '1897', ang: 3, off: [-34, 6]},
  {k: 'queniana', t: TP.quenia, nome: 'QUÊNIA', ano: '1895', ang: 2, off: [-36, 18]},
];
const C0 = {x: 1226, y: 428};
const TONS: Record<string, string> = {britanica: '#B99C74', italiana: '#C8AF86', francesa: '#A88D68', etiope: '#BFA27A', queniana: '#AF946E'}; // centro da terra somali (coordenadas do mapa)
// triângulo de cada ponta da estrela (ponta k, apontando para cima quando k = 0)
const ponta = (k: number, Rr: number) => {
  const a = -Math.PI / 2 + k * 2 * Math.PI / 5, r = Rr * 0.382, b1 = a - Math.PI / 5, b2 = a + Math.PI / 5;
  return [[Rr * Math.cos(a), Rr * Math.sin(a)], [r * Math.cos(b1), r * Math.sin(b1)], [r * Math.cos(b2), r * Math.sin(b2)]];
};

export const Partilha: React.FC<{t?: Partial<Record<keyof typeof TP0, number>>}> = ({t}) => {
  const f = useCurrentFrame();
  const TP = t ? {...TP0, ...Object.fromEntries(Object.entries(t).map(([k, v]) => [k, s(v as number)]))} as typeof TP0 : TP0;
  const partes = partesDe(TP);
  // 1) mapa de 1884: push lento em direção ao Chifre
  const velho = 1 - prog(f, TP.dissolve, TP.dissolve + 18);
  const pv = prog(f, 0, TP.dissolve + 18, cam);
  const vs = interpolate(pv, [0, 1], [0.8, 1.9]);
  // 2) mapa vetorial sépia, câmera no Chifre com deriva
  const z = 5.1 * (1 + f * 0.0002) * interpolate(prog(f, TP.dissolve - 6, TP.dissolve + 30, cam), [0, 1], [0.8, 1]);
  const cx = 1214, cy = 430;
  const tr = (x: number, y: number) => [960 + (x - cx) * z, 540 + (y - cy) * z];
  const lw = 1 / z;
  const estrelaR = 30;
  const pontasBrilham = prog(f, TP.pontas, TP.pontas + 14);
  return (
    <AbsoluteFill style={{background: P.papel}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <pattern id="hach" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform={`scale(${lw}) rotate(45)`}>
            <line x1={0} y1={0} x2={0} y2={6} stroke={P.tinta} strokeWidth={1.3} strokeOpacity={0.5} />
          </pattern>
          <filter id="papel"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} seed={3} />
            <feColorMatrix values="0 0 0 0 0.29  0 0 0 0 0.21  0 0 0 0 0.15  0 0 0 -1.6 1.1" /></filter>
        </defs>
        <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>
          {/* terra em volta (os países vizinhos), apagada */}
          {geo.countries.map((c, i) => (
            <path key={i} d={c.d} fill={P.papelEsc} stroke={P.tintaMeio} strokeWidth={0.8 * lw} />
          ))}
          {/* terra somali: começa como um povo só (mesma cor, sem linha) */}
          {partes.map(p => {
            const corte = prog(f, p.t + 6, p.t + 20);
            return <path key={p.k} d={R[p.k].d} fill={corte > 0 ? TONS[p.k] : '#C9A46A'} stroke={corte > 0 ? TONS[p.k] : '#C9A46A'} strokeWidth={0.6 * lw} />;
          })}
          {partes.map(p => prog(f, p.t + 6, p.t + 20) > 0 ? <path key={'h' + p.k} d={R[p.k].d} fill="url(#hach)" opacity={prog(f, p.t + 6, p.t + 20)} /> : null)}
          {/* régua: a fronteira de cada parte risca reta */}
          {partes.map(p => {
            const r = prog(f, p.t + 2, p.t + 20, cam);
            if (r <= 0) return null;
            return <path key={'l' + p.k} d={R[p.k].d} fill="none" stroke={P.tinta} strokeWidth={2.2 * lw} pathLength={1} strokeDasharray={`${r} 1`} strokeLinejoin="miter" />;
          })}
        </g>
      </svg>
      {/* estrela: cada ponta voa para uma parte */}
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {(() => {
          const [sx, sy] = tr(C0.x, C0.y);
          const nasce = approach(f, TP.dissolve + 10, 0, 1, 0.14);
          return partes.map((p, i) => {
            const voo = prog(f, p.t - 4, p.t + 14, cam);
            const [tx, ty] = tr(R[p.k].c[0], R[p.k].c[1]);
            const x = interpolate(voo, [0, 1], [sx, tx]), y = interpolate(voo, [0, 1], [sy, ty]) - Math.sin(voo * Math.PI) * 60;
            const sc = nasce * interpolate(voo, [0, 1], [150, 70]);
            const rot = voo * (i % 2 ? 40 : -40);
            const pts = ponta(p.ang, 1).map(([a, b]) => `${a * sc},${b * sc}`).join(' ');
            const cor = pontasBrilham > 0 ? T.azul : (voo > 0 ? '#FFFFFF' : '#FFFFFF');
            return (
              <g key={p.k} transform={`translate(${x} ${y}) rotate(${rot})`}>
                <polygon points={pts} fill={voo > 0.98 ? cor : '#fff'} stroke={pontasBrilham > 0 ? '#fff' : P.tinta} strokeWidth={1.2} strokeOpacity={0.4 + 0.4 * voo} />
              </g>
            );
          });
        })()}
        {/* centro vazio: a estrela que ficou sem pontas */}
        {(() => {
          const [sx, sy] = tr(C0.x, C0.y);
          const o = prog(f, TP.pontas, TP.pontas + 20);
          return <polygon points={[0, 1, 2, 3, 4].map(k => { const a = -Math.PI / 2 + Math.PI / 5 + k * 2 * Math.PI / 5; const r = 0.382 * 150; return `${sx + r * Math.cos(a)},${sy + r * Math.sin(a)}`; }).join(' ')}
            fill="none" stroke={P.tinta} strokeWidth={1.5} strokeDasharray="5 5" opacity={o} />;
        })()}
      </svg>
      {/* carimbos */}
      {partes.map((p, i) => {
        const t0 = p.t + 12;
        if (f < t0) return null;
        const [tx, ty] = tr(R[p.k].c[0], R[p.k].c[1]);
        const sc = approach(f, t0, 1.6, 1, 0.24);
        const op = Math.min(1, (f - t0) / 3);
        return (
          <div key={'c' + p.k} style={{position: 'absolute', left: tx + p.off[0] * 2.4, top: ty + p.off[1] * 2.2, transform: `translate(-50%,-50%) rotate(${(hash(i) - 0.5) * 10}deg) scale(${sc})`, opacity: op * 0.92,
            border: `3px solid ${P.tinta}`, borderRadius: 6, padding: '8px 16px 6px', color: P.tinta, fontFamily: T.sans, fontWeight: 600, fontSize: 26, letterSpacing: '0.16em', textAlign: 'center', background: 'rgba(230,218,195,0.75)'}}>
            {p.nome}<div style={{fontFamily: T.serif, fontWeight: 400, fontSize: 30, letterSpacing: '0.04em'}}>{p.ano}</div>
          </div>
        );
      })}
      {/* mapa real de 1884 por cima, que se dissolve */}
      {velho > 0 && (
        <AbsoluteFill style={{opacity: velho, overflow: 'hidden', background: P.papel}}>
          <Img src={staticFile('mapa-1884.jpg')} style={{position: 'absolute', width: 1920 * vs, left: interpolate(pv, [0, 1], [960, 1000]) - interpolate(pv, [0, 1], [960, 1600]) * vs,
            top: interpolate(pv, [0, 1], [540, 560]) - interpolate(pv, [0, 1], [900, 720]) * vs,
            filter: 'sepia(0.55) contrast(1.05)'}} />
          <div style={{position: 'absolute', left: 120, bottom: 110, fontFamily: '"Courier New", monospace', fontSize: 34, color: P.tinta, background: 'rgba(230,218,195,0.85)', padding: '10px 18px',
            opacity: prog(f, 12, 22)}}>{'BERLIM, 1884'.slice(0, Math.max(0, Math.floor((f - 12) / 2)))}</div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px 40px rgba(74,54,38,0.45)', pointerEvents: 'none'}} />
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.35, mixBlendMode: 'multiply'}}><rect width="1920" height="1080" filter="url(#papel)" /></svg>
    </AbsoluteFill>
  );
};
