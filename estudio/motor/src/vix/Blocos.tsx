import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {V, TIT, TXT, W} from './tema';

// v2 (06/11): motion COMPACTO por cima da imagem. Nada de fundo chapado nem escurecer a TV:
// a tela do aplicativo é o produto e tem de aparecer o tempo todo.

export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};
export const mola = (f: number, fps: number, delay = 0, damping = 18) =>
  spring({frame: f - delay * fps, fps, config: {damping, stiffness: 140, mass: 0.7}});
const sai = (t: number, dur: number, d = 0.25) =>
  interpolate(t, [dur - d, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const SOMBRA = '0 3px 18px rgba(1,2,4,0.95), 0 0 6px rgba(1,2,4,0.8)';
const PAINEL: React.CSSProperties = {
  borderRadius: 22, border: `2px solid ${V.linhaForte}`,
  background: 'linear-gradient(180deg, rgba(10,17,11,0.93), rgba(6,10,7,0.93))',
};

export const Cartao: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{...PAINEL, ...style}}>{children}</div>
);

export const Chip: React.FC<{label: string; delay: number; dur: number; destaque?: boolean}> = ({label, delay, dur, destaque}) => {
  const {f, fps, t} = useT();
  const m = mola(f, fps, delay, 16);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 28px', borderRadius: 999,
      border: `2px solid ${destaque ? V.neon : V.linhaForte}`, background: destaque ? V.neon : 'rgba(6,10,7,0.94)',
      color: destaque ? V.sobre : V.txt, fontFamily: TXT, fontWeight: 700, fontSize: 40,
      transform: `translateY(${(1 - m) * 24}px) scale(${0.9 + 0.1 * m})`, opacity: clamp01(m) * sai(t, dur),
      boxShadow: destaque ? '0 0 26px rgba(153,226,0,0.5)' : '0 4px 16px rgba(1,2,4,0.6)',
    }}>
      <span style={{width: 13, height: 13, borderRadius: 99, background: destaque ? V.sobre : V.neon}} />
      {label}
    </div>
  );
};

// Gancho: a imagem da TV segue visível; três pílulas "Assinatura" se juntam e viram a marca
export const Gancho: React.FC<{dur: number; titulo: string; sub?: string; colapsa?: number}> = ({dur, titulo, sub, colapsa}) => {
  const {f, fps, t} = useT();
  const tc = colapsa ?? dur - 1.0;
  const col = clamp01((t - tc) / 0.5);
  const colE = col * col * (3 - 2 * col);
  const logo = mola(f, fps, tc + 0.3, 14);
  const mt = mola(f, fps, 0.05);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur, 0.3)}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 900, background: 'linear-gradient(180deg, rgba(1,2,4,0.82) 0%, rgba(1,2,4,0.62) 55%, rgba(1,2,4,0) 100%)'}} />
      <div style={{position: 'absolute', top: 300, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 104, lineHeight: 1.03, color: V.txt, padding: '0 60px', boxSizing: 'border-box', textShadow: SOMBRA, transform: `translateY(${(1 - mt) * 36}px)`, opacity: clamp01(mt) * (1 - colE)}}>
        {titulo}
      </div>
      {sub && <div style={{position: 'absolute', top: 640, width: W, textAlign: 'center', fontFamily: TXT, fontWeight: 700, fontSize: 46, color: V.txt, textShadow: SOMBRA, opacity: mola(f, fps, 0.8) * (1 - colE)}}>{sub}</div>}
      {[0, 1, 2].map((i) => {
        const m = mola(f, fps, 0.45 + i * 0.4, 15);
        const x0 = 70 + i * 320;
        const x = x0 + (1 - m) * (i % 2 ? 200 : -200) + (380 - x0) * colE;
        return (
          <div key={i} style={{...PAINEL, position: 'absolute', left: x, top: 790, width: 300, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TXT, fontWeight: 700, fontSize: 38, color: V.txt, opacity: clamp01(m) * (1 - colE), transform: `scale(${1 - 0.5 * colE})`}}>Assinatura</div>
        );
      })}
      <Img src={staticFile('vix/vixplay-logo-mark.png')} style={{position: 'absolute', left: 230, top: 700, width: 620, opacity: clamp01(logo), transform: `scale(${0.8 + 0.2 * logo})`, filter: 'drop-shadow(0 4px 16px rgba(1,2,4,0.9))'}} />
    </div>
  );
};

// Seção (B2): título em botão neon + chips que entram na palavra falada (topo, compacto)
export const Secao: React.FC<{dur: number; titulo: string; chips?: {l: string; t: number; d?: boolean}[]; y?: number}> = ({dur, titulo, chips = [], y = 290}) => {
  const {f, fps, t} = useT();
  const m = mola(f, fps, 0.05);
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: W, opacity: sai(t, dur)}}>
      <div style={{margin: '0 auto', width: 940, transform: `translateY(${(1 - m) * -30}px)`, opacity: clamp01(m)}}>
        <div style={{display: 'inline-block', background: `linear-gradient(90deg, ${V.brilho}, ${V.neon} 45%, ${V.fim})`, borderRadius: 14, padding: '10px 28px', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 58, color: V.sobre, textTransform: 'uppercase', boxShadow: '0 0 0 1px rgba(153,226,0,.35), 0 0 24px rgba(153,226,0,.45)'}}>{titulo}</div>
      </div>
      <div style={{width: 940, margin: '22px auto 0', display: 'flex', flexWrap: 'wrap', gap: 14}}>
        {chips.map((c, i) => (c.t > t + 0.5 ? null : <Chip key={i} label={c.l} delay={Math.max(0, c.t)} dur={dur} destaque={c.d} />))}
      </div>
    </div>
  );
};

// B3 Até 3 telas: faixa compacta na parte baixa da imagem
export const Telas: React.FC<{dur: number; a?: string; b?: string; sub?: string}> = ({dur, a = 'Até ', b = '3 telas', sub = 'no mesmo plano'}) => {
  const {f, fps, t} = useT();
  const itens = [{img: 'vix/smart-tv.png', l: 'Smart TV'}, {img: 'vix/tv-box.png', l: 'TV Box'}, {img: '', l: 'Celular'}];
  const mt = mola(f, fps, 0.05);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur)}}>
      <div style={{position: 'absolute', top: 300, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 96, color: V.txt, textShadow: SOMBRA, opacity: clamp01(mt), transform: `translateY(${(1 - mt) * -30}px)`}}>
        {a}<span style={{color: V.neon}}>{b}</span>
      </div>
      <div style={{position: 'absolute', top: 1070, left: 0, width: W, display: 'flex', justifyContent: 'center', gap: 20}}>
        {itens.map((it, i) => {
          const m = mola(f, fps, 0.35 + i * 0.4, 15);
          return (
            <Cartao key={i} style={{width: 300, height: 250, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, transform: `translateY(${(1 - m) * 50}px) scale(${0.92 + 0.08 * m})`, opacity: clamp01(m), boxShadow: m > 0.9 ? '0 0 28px rgba(153,226,0,0.3)' : 'none'}}>
              {it.img ? <Img src={staticFile(it.img)} style={{width: 170, height: 125, objectFit: 'contain'}} /> : (
                <svg width="80" height="125" viewBox="0 0 120 170"><rect x="10" y="4" width="100" height="162" rx="20" fill="none" stroke={V.neon} strokeWidth="7" /><rect x="40" y="16" width="40" height="8" rx="4" fill={V.neon} /><path d="M48 70 L48 110 L82 90 Z" fill={V.neon} /></svg>
              )}
              <span style={{fontFamily: TXT, fontWeight: 700, fontSize: 34, color: V.txt}}>{it.l}</span>
            </Cartao>
          );
        })}
      </div>
      {sub && <div style={{position: 'absolute', top: 1335, width: W, textAlign: 'center', fontFamily: TXT, fontWeight: 700, fontSize: 36, color: V.txt, textShadow: SOMBRA, opacity: mola(f, fps, 1.5)}}>{sub}</div>}
    </div>
  );
};

// B4 Preço: etiqueta de oferta compacta (a TV continua aparecendo acima)
export const Preco: React.FC<{dur: number; renova?: boolean; tRenova?: number; tPix?: number; tNum?: number}> = ({dur, renova = true, tRenova = 2.6, tPix = 4, tNum = 0.3}) => {
  const {f, fps, t} = useT();
  const k = clamp01((t - tNum) / 0.9);
  const ease = 1 - Math.pow(1 - k, 3);
  const n = Math.round(35 * ease);
  const mp = mola(f, fps, 0.05, 20);
  const mr = mola(f, fps, tRenova);
  const m1 = mola(f, fps, tNum + 0.8);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur)}}>
      <Cartao style={{position: 'absolute', left: 60, top: 940, width: 960, height: renova ? 330 : 270, transform: `translateY(${(1 - mp) * 60}px)`, opacity: clamp01(mp), boxShadow: '0 0 0 1px rgba(153,226,0,.25), 0 10px 40px rgba(1,2,4,.7)'}}>
        <div style={{position: 'absolute', left: 44, top: 20, fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 200, color: V.neon, lineHeight: 1, textShadow: '0 0 36px rgba(153,226,0,0.4)', opacity: clamp01(k * 3)}}>
          <span style={{fontSize: 80, color: V.txt}}>R$ </span>{n}
        </div>
        <div style={{position: 'absolute', left: 560, top: 62, fontFamily: TXT, fontWeight: 800, fontSize: 56, color: V.txt, lineHeight: 1.1, opacity: clamp01(m1), transform: `translateX(${(1 - m1) * 30}px)`}}>no 1º mês<br /><span style={{fontSize: 38, fontWeight: 600, color: V.apoio}}>Pix, sem cartão</span></div>
        {renova && (
          <div style={{position: 'absolute', left: 44, right: 44, bottom: 22, height: 74, borderRadius: 14, border: `2px solid ${V.linhaForte}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: clamp01(mr), transform: `translateY(${(1 - mr) * 24}px)`}}>
            <span style={{fontFamily: TXT, fontWeight: 600, fontSize: 38, color: V.apoio}}>Renovando em dia:</span>
            <span style={{fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 50, color: V.neon}}>R$ 30</span>
          </div>
        )}
      </Cartao>
      <div style={{position: 'absolute', top: renova ? 1295 : 1235, left: 0, width: W, display: 'flex', justifyContent: 'center', gap: 14, padding: '0 40px', boxSizing: 'border-box'}}>
        {['Pix', 'Sem cartão', 'Sem fidelidade'].map((l, i) => (t >= tPix + i * 0.4 - 0.5 ? <Chip key={l} label={l} delay={tPix + i * 0.4} dur={dur} /> : null))}
      </div>
    </div>
  );
};

// B5 Três passos: três cartões lado a lado na parte baixa
export const Passos: React.FC<{dur: number; ts: number[]}> = ({dur, ts}) => {
  const {f, fps, t} = useT();
  const L = ['Escolha o plano', 'Pague por Pix', 'Receba o acesso no WhatsApp'];
  const mt = mola(f, fps, 0.05);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur)}}>
      <div style={{position: 'absolute', top: 300, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 92, color: V.txt, textShadow: SOMBRA, opacity: clamp01(mt)}}>Em <span style={{color: V.neon}}>3 passos</span></div>
      <div style={{position: 'absolute', top: 1050, left: 0, width: W, display: 'flex', justifyContent: 'center', gap: 18}}>
        {L.map((l, i) => {
          const m = mola(f, fps, ts[i], 15);
          return (
            <Cartao key={i} style={{width: 308, height: 270, boxSizing: 'border-box', padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, transform: `translateY(${(1 - m) * 60}px)`, opacity: clamp01(m)}}>
              <div style={{width: 76, height: 76, borderRadius: 99, background: `linear-gradient(90deg, ${V.brilho}, ${V.fim})`, color: V.sobre, fontFamily: TIT, fontWeight: 900, fontSize: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
              <div style={{fontFamily: TXT, fontWeight: 700, fontSize: 34, color: V.txt, lineHeight: 1.12, textAlign: 'center'}}>{l}</div>
            </Cartao>
          );
        })}
      </div>
    </div>
  );
};

// Suporte: balões pequenos, sem nome de pessoa
export const Suporte: React.FC<{dur: number}> = ({dur}) => {
  const {f, fps, t} = useT();
  const b = (txt: string, d: number, lado: 'e' | 'd', y: number) => {
    const m = mola(f, fps, d, 16);
    const pos: React.CSSProperties = lado === 'e' ? {left: 70} : {right: 70};
    return (
      <div style={{position: 'absolute', top: y, ...pos, maxWidth: 700, padding: '24px 36px', borderRadius: 30, borderBottomLeftRadius: lado === 'e' ? 8 : 30, borderBottomRightRadius: lado === 'd' ? 8 : 30, background: lado === 'e' ? 'rgba(17,28,16,0.95)' : `linear-gradient(90deg, ${V.brilho}, ${V.neon})`, color: lado === 'e' ? V.txt : V.sobre, border: lado === 'e' ? `2px solid ${V.linhaForte}` : 'none', fontFamily: TXT, fontWeight: 700, fontSize: 42, transform: `translateY(${(1 - m) * 40}px)`, opacity: clamp01(m)}}>{txt}</div>
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur)}}>
      <div style={{position: 'absolute', top: 300, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 80, color: V.txt, textShadow: SOMBRA, opacity: clamp01(mola(f, fps, 0.05))}}>Suporte <span style={{color: V.neon}}>humano</span></div>
      {b('Dúvida na instalação?', 0.4, 'e', 1010)}
      {b('Atendimento pelo WhatsApp', 1.2, 'd', 1180)}
    </div>
  );
};

// Dor em texto, uma frase por vez, direto sobre a imagem
export const Dor: React.FC<{dur: number; frases: {l: string; t: number}[]}> = ({dur, frases}) => {
  const {f, fps, t} = useT();
  let idx = 0;
  frases.forEach((x, i) => { if (t >= x.t) idx = i; });
  const x = frases[idx];
  const m = mola(f, fps, x.t, 17);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sai(t, dur, 0.3)}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1000, background: 'linear-gradient(180deg, rgba(1,2,4,0.8) 0%, rgba(1,2,4,0.55) 60%, rgba(1,2,4,0) 100%)'}} />
      <div key={idx} style={{position: 'absolute', top: 380, width: W, textAlign: 'center', padding: '0 50px', boxSizing: 'border-box', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 112, lineHeight: 1.05, color: idx === frases.length - 1 ? V.neon : V.txt, textShadow: SOMBRA, transform: `translateY(${(1 - m) * 44}px)`, opacity: clamp01(m)}}>{x.l}</div>
    </div>
  );
};

// Título de abertura (tour)
export const Titulo: React.FC<{dur: number; l1: string; l2: string}> = ({dur, l1, l2}) => {
  const {f, fps, t} = useT();
  const m = mola(f, fps, 0.05);
  return (
    <div style={{position: 'absolute', left: 0, top: 320, width: W, textAlign: 'center', opacity: sai(t, dur)}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: -90, height: 520, background: 'linear-gradient(180deg, rgba(1,2,4,0.75), rgba(1,2,4,0))'}} />
      <div style={{position: 'relative', fontFamily: TXT, fontWeight: 800, fontSize: 50, color: V.txt, textShadow: SOMBRA, opacity: clamp01(m), letterSpacing: 2, textTransform: 'uppercase'}}>{l1}</div>
      <div style={{position: 'relative', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 120, color: V.neon, lineHeight: 1, textShadow: SOMBRA, transform: `translateY(${(1 - m) * 40}px)`, opacity: clamp01(m), marginTop: 12}}>{l2}</div>
    </div>
  );
};

// B6 CTA: painel inferior; a imagem do aplicativo continua rodando por cima
export const CTA: React.FC<{dur: number; horas?: boolean}> = ({dur, horas}) => {
  const {f, fps, t} = useT();
  const m = mola(f, fps, 0.0, 20);
  const bt = mola(f, fps, 0.35, 14);
  const pulso = 1 + 0.045 * Math.max(0, Math.sin(Math.max(0, t - 1.0) * Math.PI * 2 * 0.9));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, bottom: 0, background: `linear-gradient(180deg, rgba(1,2,4,0) 0%, rgba(1,2,4,0.88) 22%, rgba(1,2,4,0.95) 100%)`, opacity: clamp01(m)}} />
      <div style={{position: 'absolute', top: 880, width: W, textAlign: 'center', fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 60, whiteSpace: 'nowrap', color: V.txt, textShadow: SOMBRA, opacity: clamp01(mola(f, fps, 0.15)), transform: `translateY(${(1 - m) * 30}px)`}}>Solicite seu <span style={{color: V.neon}}>teste grátis</span></div>
      {horas && <div style={{position: 'absolute', top: 962, width: W, textAlign: 'center', fontFamily: TXT, fontWeight: 700, fontSize: 44, color: V.txt, textShadow: SOMBRA, opacity: clamp01(mola(f, fps, 0.3))}}>de 4 horas</div>}
      <div style={{position: 'absolute', top: 1050, left: 150, width: 780, height: 140, borderRadius: 14, background: `linear-gradient(90deg, ${V.brilho}, ${V.neon} 45%, ${V.fim})`, boxShadow: '0 0 0 1px rgba(153,226,0,.35), 0 0 40px rgba(153,226,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TIT, fontWeight: 800, fontSize: 66, letterSpacing: 4, color: V.sobre, textTransform: 'uppercase', transform: `scale(${(0.85 + 0.15 * bt) * pulso})`, opacity: clamp01(bt)}}>Saiba mais</div>
      <div style={{position: 'absolute', top: 1225, width: W, textAlign: 'center', fontFamily: TXT, fontWeight: 700, fontSize: 40, color: V.txt, textShadow: SOMBRA, opacity: clamp01(mola(f, fps, 0.8))}}>vixplaytv.com/teste</div>
    </div>
  );
};

// Cena de história (só para o PDF de aprovação): cartão com a descrição da cena a ser gerada/gravada
export const Cena: React.FC<{dur: number; n: string; texto: string; tag?: string}> = ({n, texto, tag = 'Cena a gerar no Google Flow'}) => (
  <div style={{position: 'absolute', inset: 0, background: V.bg}}>
    <div style={{position: 'absolute', left: 70, right: 70, top: 300, fontFamily: TXT, fontWeight: 800, fontSize: 44, letterSpacing: 6, color: V.neon, textTransform: 'uppercase'}}>{n}</div>
    <div style={{position: 'absolute', left: 70, right: 70, top: 400, fontFamily: TIT, fontStyle: 'italic', fontWeight: 900, fontSize: 84, lineHeight: 1.08, color: V.txt}}>{texto}</div>
    <div style={{position: 'absolute', left: 70, top: 1380, padding: '16px 30px', borderRadius: 999, border: `2px solid ${V.linhaForte}`, fontFamily: TXT, fontWeight: 700, fontSize: 36, color: V.apoio}}>{tag}</div>
  </div>
);
