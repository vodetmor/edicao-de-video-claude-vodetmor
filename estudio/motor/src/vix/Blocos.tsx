import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {V, TIT, TXT, W} from './tema';

export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};
// mola suave (sem balanço exagerado)
export const mola = (f: number, fps: number, delay = 0, damping = 18) =>
  spring({frame: f - delay * fps, fps, config: {damping, stiffness: 140, mass: 0.7}});
const sai = (t: number, dur: number, d = 0.25) =>
  interpolate(t, [dur - d, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const Cartao: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{borderRadius: 20, border: `2px solid ${V.linhaForte}`, background: `linear-gradient(180deg, ${V.s2}, ${V.s1})`, ...style}}>{children}</div>
);

export const Chip: React.FC<{label: string; delay: number; dur: number; destaque?: boolean}> = ({label, delay, dur, destaque}) => {
  const {f, fps, t} = useT();
  const m = mola(f, fps, delay, 16);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 14, padding: '16px 30px', borderRadius: 999,
      border: `2px solid ${destaque ? V.neon : V.linhaForte}`, background: destaque ? V.neon : 'rgba(6,10,7,0.94)',
      color: destaque ? V.sobre : V.txt, fontFamily: TXT, fontWeight: 700, fontSize: 42,
      transform: `translateY(${(1 - m) * 26}px) scale(${0.9 + 0.1 * m})`, opacity: clamp01(m) * sai(t, dur),
      boxShadow: destaque ? '0 0 28px rgba(153,226,0,0.5)' : 'none',
    }}>
      <span style={{width: 14, height: 14, borderRadius: 99, background: destaque ? V.sobre : V.neon}} />
      {label}
    </div>
  );
};

const Dim: React.FC<{o: number}> = ({o}) => {
  const {f, fps} = useT();
  return <div style={{position: 'absolute', inset: 0, background: `rgba(1,2,4,${o * clamp01(mola(f, fps, 0, 22))})`}} />;
};

// B1 Gancho: cartões "Assinatura" empilham e colapsam na marca; texto grande
export const Gancho: React.FC<{dur: number; titulo: string; sub?: string; valores?: string[]; colapsa?: number}> = ({dur, titulo, sub, valores, colapsa}) => {
  const {f, fps, t} = useT();
  const tc = colapsa ?? dur - 1.0;
  const col = clamp01((t - tc) / 0.55);
  const colE = col * col * (3 - 2 * col);
  const logo = mola(f, fps, tc + 0.35, 14);
  const mt = mola(f, fps, 0.1);
  return (
    <div style={{position: 'absolute', inset: 0, background: V.bg, opacity: sai(t, dur, 0.3)}}>
      <div style={{position: 'absolute', top: 210, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 108, lineHeight: 1.04, color: V.txt, padding: '0 70px', boxSizing: 'border-box', transform: `translateY(${(1 - mt) * 40}px)`, opacity: clamp01(mt) * (1 - colE)}}>
        {titulo}
      </div>
      {sub && <div style={{position: 'absolute', top: 560, width: W, textAlign: 'center', fontFamily: TXT, fontWeight: 600, fontSize: 46, color: V.apoio, opacity: mola(f, fps, 0.9) * (1 - colE)}}>{sub}</div>}
      {[0, 1, 2].map((i) => {
        const m = mola(f, fps, 0.5 + i * 0.45, 15);
        const y0 = 800 + i * 190;
        const y = y0 + (1 - m) * -260 + (960 - y0) * colE;
        return (
          <Cartao key={i} style={{position: 'absolute', left: 130, width: 820, height: 150, top: y, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 44px', boxSizing: 'border-box', opacity: clamp01(m) * (1 - colE * 0.9), transform: `scale(${1 - 0.7 * colE})`}}>
            <span style={{fontFamily: TXT, fontWeight: 600, fontSize: 44, color: V.txt}}>Assinatura</span>
            <span style={{fontFamily: TIT, fontWeight: 800, fontSize: 44, color: V.apoio}}>{valores ? valores[i] : 'R$ ?'}</span>
          </Cartao>
        );
      })}
      <Img src={staticFile('vix/vixplay-logo-mark.png')} style={{position: 'absolute', left: 190, top: 770, width: 700, opacity: clamp01(logo), transform: `scale(${0.8 + 0.2 * logo})`}} />
    </div>
  );
};

// Seção (B2): título em botão neon + chips que entram na palavra falada
export const Secao: React.FC<{dur: number; titulo: string; chips?: {l: string; t: number; d?: boolean}[]; y?: number}> = ({dur, titulo, chips = [], y = 300}) => {
  const {f, fps, t} = useT();
  const m = mola(f, fps, 0.05);
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: W, opacity: sai(t, dur)}}>
      <div style={{margin: '0 auto', width: 900, transform: `translateY(${(1 - m) * -30}px)`, opacity: clamp01(m)}}>
        <div style={{display: 'inline-block', background: `linear-gradient(90deg, ${V.brilho}, ${V.neon} 45%, ${V.fim})`, borderRadius: 14, padding: '12px 30px', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 64, color: V.sobre, textTransform: 'uppercase', boxShadow: '0 0 0 1px rgba(153,226,0,.35), 0 0 24px rgba(153,226,0,.45)'}}>{titulo}</div>
      </div>
      <div style={{width: 900, margin: '28px auto 0', display: 'flex', flexWrap: 'wrap', gap: 16}}>
        {chips.map((c, i) => (c.t > t + 0.5 ? null : <Chip key={i} label={c.l} delay={Math.max(0, c.t)} dur={dur} destaque={c.d} />))}
      </div>
    </div>
  );
};

// B3 Até 3 telas
export const Telas: React.FC<{dur: number; a?: string; b?: string; sub?: string}> = ({dur, a = 'Até ', b = '3 telas', sub = 'no mesmo plano'}) => {
  const {f, fps, t} = useT();
  const itens = [{img: 'vix/smart-tv.png', l: 'Smart TV'}, {img: 'vix/tv-box.png', l: 'TV Box'}, {img: '', l: 'Celular'}];
  const mt = mola(f, fps, 0.05);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur)}}>
      <Dim o={0.72} />
      <div style={{position: 'absolute', top: 330, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 118, color: V.txt, opacity: clamp01(mt)}}>
        {a}<span style={{color: V.neon}}>{b}</span>
      </div>
      <div style={{position: 'absolute', top: 640, left: 0, width: W, display: 'flex', justifyContent: 'center', gap: 26}}>
        {itens.map((it, i) => {
          const m = mola(f, fps, 0.4 + i * 0.5, 15);
          return (
            <Cartao key={i} style={{width: 290, height: 360, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, transform: `translateY(${(1 - m) * 60}px) scale(${0.92 + 0.08 * m})`, opacity: clamp01(m), boxShadow: m > 0.9 ? '0 0 30px rgba(153,226,0,0.30)' : 'none'}}>
              {it.img ? <Img src={staticFile(it.img)} style={{width: 210, height: 170, objectFit: 'contain'}} /> : (
                <svg width="120" height="170" viewBox="0 0 120 170"><rect x="10" y="4" width="100" height="162" rx="20" fill="none" stroke={V.neon} strokeWidth="6" /><rect x="40" y="16" width="40" height="8" rx="4" fill={V.neon} /><path d="M48 70 L48 110 L82 90 Z" fill={V.neon} /></svg>
              )}
              <span style={{fontFamily: TXT, fontWeight: 700, fontSize: 38, color: V.txt}}>{it.l}</span>
            </Cartao>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1090, width: W, textAlign: 'center', fontFamily: TXT, fontWeight: 600, fontSize: 40, color: V.apoio, opacity: mola(f, fps, 1.9)}}>{sub}</div>
    </div>
  );
};

// B4 Preço
export const Preco: React.FC<{dur: number; renova?: boolean; tRenova?: number; tPix?: number; tNum?: number}> = ({dur, renova = true, tRenova = 2.6, tPix = 4, tNum = 0.3}) => {
  const {f, fps, t} = useT();
  const k = clamp01((t - tNum) / 0.9);
  const ease = 1 - Math.pow(1 - k, 3);
  const n = Math.round(35 * ease);
  const mr = mola(f, fps, tRenova);
  const m1 = mola(f, fps, tNum + 0.9);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur)}}>
      <Dim o={0.78} />
      <div style={{position: 'absolute', top: 380, width: W, textAlign: 'center'}}>
        <div style={{fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 270, color: V.neon, lineHeight: 1, textShadow: '0 0 40px rgba(153,226,0,0.45)', opacity: clamp01(k * 3)}}>
          <span style={{fontSize: 110, color: V.txt}}>R$ </span>{n}
        </div>
        <div style={{fontFamily: TXT, fontWeight: 700, fontSize: 62, color: V.txt, marginTop: 16, opacity: clamp01(m1), transform: `translateY(${(1 - m1) * 20}px)`}}>no 1º mês</div>
      </div>
      {renova && (
        <Cartao style={{position: 'absolute', top: 900, left: 140, width: 800, padding: '30px 0', textAlign: 'center', opacity: clamp01(mr), transform: `translateY(${(1 - mr) * 40}px)`}}>
          <span style={{fontFamily: TXT, fontWeight: 600, fontSize: 44, color: V.apoio}}>Renovando em dia: </span>
          <span style={{fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 60, color: V.neon}}>R$ 30</span>
        </Cartao>
      )}
      <div style={{position: 'absolute', top: 1110, left: 0, width: W, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', padding: '0 40px', boxSizing: 'border-box'}}>
        {['Pix', 'Sem cartão', 'Sem fidelidade'].map((l, i) => (t >= tPix + i * 0.45 - 0.5 ? <Chip key={l} label={l} delay={tPix + i * 0.45} dur={dur} /> : null))}
      </div>
    </div>
  );
};

// B5 Três passos
export const Passos: React.FC<{dur: number; ts: number[]}> = ({dur, ts}) => {
  const {f, fps, t} = useT();
  const L = ['Escolha o plano', 'Pague por Pix', 'Receba o acesso no WhatsApp'];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur)}}>
      <Dim o={0.8} />
      <div style={{position: 'absolute', top: 300, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 96, color: V.txt, opacity: clamp01(mola(f, fps, 0.05))}}>Em <span style={{color: V.neon}}>3 passos</span></div>
      {L.map((l, i) => {
        const m = mola(f, fps, ts[i], 15);
        return (
          <Cartao key={i} style={{position: 'absolute', left: 90, width: 900, top: 520 + i * 250, height: 190, display: 'flex', alignItems: 'center', gap: 36, padding: '0 40px', boxSizing: 'border-box', transform: `translateX(${(1 - m) * 120}px)`, opacity: clamp01(m)}}>
            <div style={{width: 100, height: 100, borderRadius: 99, background: `linear-gradient(90deg, ${V.brilho}, ${V.fim})`, color: V.sobre, fontFamily: TIT, fontWeight: 900, fontSize: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</div>
            <div style={{fontFamily: TXT, fontWeight: 700, fontSize: 48, color: V.txt, lineHeight: 1.15}}>{l}</div>
          </Cartao>
        );
      })}
    </div>
  );
};

// Suporte: balões simples, sem nome de pessoa
export const Suporte: React.FC<{dur: number}> = ({dur}) => {
  const {f, fps, t} = useT();
  const b = (txt: string, d: number, lado: 'e' | 'd', y: number) => {
    const m = mola(f, fps, d, 16);
    const pos: React.CSSProperties = lado === 'e' ? {left: 90} : {right: 90};
    return (
      <div style={{position: 'absolute', top: y, ...pos, maxWidth: 700, padding: '30px 40px', borderRadius: 32, borderBottomLeftRadius: lado === 'e' ? 8 : 32, borderBottomRightRadius: lado === 'd' ? 8 : 32, background: lado === 'e' ? V.s3 : `linear-gradient(90deg, ${V.brilho}, ${V.neon})`, color: lado === 'e' ? V.txt : V.sobre, border: lado === 'e' ? `2px solid ${V.linhaForte}` : 'none', fontFamily: TXT, fontWeight: 700, fontSize: 46, transform: `translateY(${(1 - m) * 40}px)`, opacity: clamp01(m)}}>{txt}</div>
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur)}}>
      <Dim o={0.8} />
      <div style={{position: 'absolute', top: 330, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 84, color: V.txt, opacity: clamp01(mola(f, fps, 0.05))}}>Suporte <span style={{color: V.neon}}>humano</span></div>
      {b('Dúvida na instalação?', 0.4, 'e', 620)}
      {b('Atendimento pelo WhatsApp', 1.3, 'd', 820)}
    </div>
  );
};

// Dor em texto, uma frase por vez
export const Dor: React.FC<{dur: number; frases: {l: string; t: number}[]}> = ({dur, frases}) => {
  const {f, fps, t} = useT();
  let idx = 0;
  frases.forEach((x, i) => { if (t >= x.t) idx = i; });
  const x = frases[idx];
  const m = mola(f, fps, x.t, 17);
  return (
    <div style={{position: 'absolute', inset: 0, background: V.bg, opacity: sai(t, dur, 0.3)}}>
      <div key={idx} style={{position: 'absolute', top: 700, width: W, textAlign: 'center', padding: '0 60px', boxSizing: 'border-box', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 124, lineHeight: 1.05, color: idx === frases.length - 1 ? V.neon : V.txt, transform: `translateY(${(1 - m) * 50}px)`, opacity: clamp01(m)}}>{x.l}</div>
      <div style={{position: 'absolute', top: 1180, width: W, display: 'flex', justifyContent: 'center', gap: 16}}>
        {frases.map((_, i) => <div key={i} style={{width: i === idx ? 54 : 16, height: 16, borderRadius: 99, background: i <= idx ? V.neon : V.s3}} />)}
      </div>
    </div>
  );
};

// Título de abertura (tour)
export const Titulo: React.FC<{dur: number; l1: string; l2: string}> = ({dur, l1, l2}) => {
  const {f, fps, t} = useT();
  const m = mola(f, fps, 0.05);
  return (
    <div style={{position: 'absolute', left: 0, top: 330, width: W, textAlign: 'center', opacity: sai(t, dur)}}>
      <div style={{fontFamily: TXT, fontWeight: 700, fontSize: 52, color: V.apoio, opacity: clamp01(m), letterSpacing: 2, textTransform: 'uppercase'}}>{l1}</div>
      <div style={{fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 120, color: V.txt, lineHeight: 1, transform: `translateY(${(1 - m) * 40}px)`, opacity: clamp01(m), marginTop: 14}}>{l2}</div>
    </div>
  );
};

// B6 CTA
export const CTA: React.FC<{dur: number; horas?: boolean}> = ({dur, horas}) => {
  const {f, fps, t} = useT();
  const m = mola(f, fps, 0.0, 20);
  const bt = mola(f, fps, 0.45, 14);
  const pulso = 1 + 0.045 * Math.max(0, Math.sin(Math.max(0, t - 1.1) * Math.PI * 2 * 0.9));
  return (
    <div style={{position: 'absolute', inset: 0, background: V.bg, opacity: clamp01(m)}}>
      <Img src={staticFile('vix/vixplay-logo-mark.png')} style={{position: 'absolute', left: 190, top: 380, width: 700, transform: `translateY(${(1 - m) * 30}px)`}} />
      <div style={{position: 'absolute', top: 780, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 70, color: V.txt, opacity: clamp01(mola(f, fps, 0.25))}}>Solicite seu <span style={{color: V.neon}}>teste grátis</span></div>
      {horas && <div style={{position: 'absolute', top: 905, width: W, textAlign: 'center', fontFamily: TXT, fontWeight: 600, fontSize: 44, color: V.apoio, opacity: clamp01(mola(f, fps, 0.4))}}>de 4 horas</div>}
      <div style={{position: 'absolute', top: 1040, left: 150, width: 780, height: 150, borderRadius: 14, background: `linear-gradient(90deg, ${V.brilho}, ${V.neon} 45%, ${V.fim})`, boxShadow: '0 0 0 1px rgba(153,226,0,.35), 0 0 40px rgba(153,226,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TIT, fontWeight: 800, fontSize: 70, letterSpacing: 4, color: V.sobre, textTransform: 'uppercase', transform: `scale(${(0.85 + 0.15 * bt) * pulso})`, opacity: clamp01(bt)}}>Saiba mais</div>
      <div style={{position: 'absolute', top: 1260, width: W, textAlign: 'center', fontFamily: TXT, fontWeight: 600, fontSize: 40, color: V.apoio, opacity: clamp01(mola(f, fps, 0.9))}}>vixplaytv.com/teste</div>
    </div>
  );
};
