import React from 'react';
import {AbsoluteFill, Easing, Img, continueRender, delayRender, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/montserrat/800-italic.css';
import '@fontsource/montserrat/900-italic.css';
import '@fontsource-variable/inter/opsz.css';
import PAL from './palavras.json';

// VSL VixPlay TV (aprovada pelo sócio em 26/11/2026). Quadros G01..G20 em
// clientes/vixplaytv/mini-vsl-gratis/trabalho/quadros-v7.html: mesmo CSS, mesmas posições.
// Tempos presos às palavras faladas (palavras.json = roteiro literal + tempos do Groq).
// O vídeo sai mudo; voz, trilha e efeitos são mixados no ffmpeg (mix_vsl_vixplay.sh).
const F = 30;
export const DUR_VSL_VIXPLAY = Math.round(139.0 * F);

const AS = (p: string) => staticFile(`vsl-vixplay/${p}`);
const PX = (n: number) => AS(`px/p${n}.jpg`);
const IMGS = [...[0, 1, 2, 3, 4, 6, 8, 10, 13, 14, 15].map(PX), AS('logo.png'), AS('serie-tv.jpg'), AS('serie-cel.jpg')];

const useT = () => useCurrentFrame() / F;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const EO = Easing.bezier(0.16, 1, 0.3, 1);
const EIO = Easing.bezier(0.65, 0, 0.35, 1);
const pr = (t: number, a: number, d: number, e: (x: number) => number = EO) => e(cl((t - a) / d));
const mola = (t: number, at: number, damping = 15, stiffness = 120) =>
  t < at ? 0 : spring({frame: (t - at) * F, fps: F, config: {damping, stiffness, mass: 1}});
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- CSS da identidade (copiado do quadros-v7.html) ----------
const CSS = `
p{margin:0}
.s{position:absolute;inset:0;font-family:'Inter Variable',Inter,sans-serif;color:#f2f7ee;overflow:hidden;background:#010204}
.ab{position:absolute}
.hl{font-family:Montserrat,sans-serif;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-.01em;line-height:.95}
.lime{background:linear-gradient(180deg,#b8ff1f,#99e200 55%,#3fbf00);-webkit-background-clip:text;background-clip:text;color:transparent}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(153,226,0,.06) 2px,transparent 2px),linear-gradient(90deg,rgba(153,226,0,.06) 2px,transparent 2px);background-size:96px 96px;-webkit-mask-image:radial-gradient(ellipse 70% 55% at 50% 40%,#000 40%,transparent 100%)}
.orb{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(153,226,0,.24) 0%,transparent 65%);filter:blur(20px)}
.badge{position:absolute;padding:14px 46px;background:linear-gradient(100deg,#e6ff3a,#99e200 50%,#3fbf00);color:#061000;clip-path:polygon(6% 0,100% 0,94% 100%,0 100%);font-family:Montserrat;font-weight:900;font-style:italic;text-transform:uppercase;font-size:34px;letter-spacing:.02em}
.btn{position:absolute;left:110px;right:110px;padding:46px;border-radius:30px;background:linear-gradient(100deg,#b8ff1f,#99e200 45%,#4fd000);color:#061000;text-align:center;font-family:Montserrat;font-weight:800;text-transform:uppercase;font-size:50px;letter-spacing:.02em}
.card{position:absolute;border-radius:36px;background:#0a110b;border:2px solid rgba(153,226,0,.28);box-shadow:0 0 0 1px rgba(153,226,0,.2),0 0 60px -10px rgba(153,226,0,.35)}
.cap{position:absolute;left:70px;right:70px;top:1300px;text-align:center;font-family:Montserrat;font-weight:900;font-style:italic;text-transform:uppercase;font-size:66px;line-height:1.04;color:#f2f7ee;text-shadow:0 4px 24px rgba(0,0,0,.85)}
.cap b{color:#99e200;text-shadow:0 0 22px rgba(153,226,0,.55)}
.chip{position:absolute;padding:14px 30px;border-radius:999px;background:rgba(1,2,4,.75);border:2px solid rgba(153,226,0,.5);font-weight:600;font-size:32px;color:#f2f7ee}
.av{width:104px;height:104px;border-radius:50%;background:#111c10;border:4px solid #99e200;display:inline-flex;align-items:center;justify-content:center;font-family:Montserrat;font-weight:900;font-size:40px;color:#99e200;box-shadow:0 0 24px -4px rgba(153,226,0,.6)}
.lbl{font-size:30px;font-weight:600;color:#a7b5a2;letter-spacing:.04em}
.tv{position:absolute;background:#0b0c0e;border-radius:14px;padding:10px;box-shadow:0 0 0 2px #2a2d31,0 50px 90px rgba(0,0,0,.7),0 0 120px -20px rgba(153,226,0,.35)}
.tv .sc{position:relative;width:100%;height:100%;border-radius:6px;overflow:hidden;background:#05080a}
.tv .sc::after{content:"";position:absolute;inset:0;background:linear-gradient(125deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,0) 38%);pointer-events:none}
.tv .foot{position:absolute;bottom:-34px;width:14px;height:40px;background:linear-gradient(#2a2d31,#121316);border-radius:3px}
.tv .bar{position:absolute;left:0;right:0;top:100%;height:14px;margin-top:-2px;background:#15171a;border-radius:0 0 10px 10px}
.ui{position:absolute;left:0;right:0;bottom:0;padding:22px 26px 18px;background:linear-gradient(transparent,rgba(0,0,0,.8))}
.ui p{font-family:Montserrat;font-weight:800;color:#fff}
.ui .pr{height:6px;border-radius:6px;background:rgba(255,255,255,.3);margin-top:12px}.ui .pr i{display:block;height:100%;border-radius:6px;background:#99e200}
.cel{position:absolute;background:#0b0c0e;border-radius:64px;padding:14px;box-shadow:0 0 0 3px #3a3d42,0 0 0 5px #15171a,0 50px 90px rgba(0,0,0,.7),0 0 100px -20px rgba(153,226,0,.4)}
.cel .sc{position:relative;width:100%;height:100%;border-radius:52px;overflow:hidden}
.cel .sc::after{content:"";position:absolute;inset:0;background:linear-gradient(130deg,rgba(255,255,255,.12),rgba(255,255,255,0) 40%)}
.cel .isl{position:absolute;left:50%;top:22px;width:34%;height:34px;margin-left:-17%;border-radius:20px;background:#000;z-index:2}
.cel .bt{position:absolute;width:6px;border-radius:3px;background:#3a3d42}
.floor{position:absolute;left:80px;right:80px;height:120px;border-radius:50%;background:radial-gradient(ellipse,rgba(153,226,0,.18),transparent 70%)}
.lk{position:absolute;left:80px;right:80px}
.lk .sm{font-family:'Inter Variable',Inter;font-weight:300;font-size:64px;color:#a7b5a2;letter-spacing:-.01em}
.lk .xl{font-family:Montserrat;font-weight:900;font-style:italic;text-transform:uppercase;line-height:.9;letter-spacing:-.02em}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 30%,rgba(1,2,4,.92) 85%)}
.app{position:absolute;inset:0;background:#05080a;display:flex;font-family:'Inter Variable',Inter}
.app .side{width:9%;background:#020405;display:flex;flex-direction:column;align-items:center;padding-top:5%;gap:9%}
.app .side i{width:40%;aspect-ratio:1;border-radius:30%;background:#1b2420}.app .side i.on{background:#99e200}
.app .main{flex:1;padding:3% 3.5%;overflow:hidden}
.app .hero{height:46%;border-radius:12px;position:relative;overflow:hidden}
.app .row{display:flex;gap:2%;margin-top:3%}
.app .row div{flex:1;aspect-ratio:2/3;border-radius:8px;overflow:hidden;position:relative}
.app .t{font-family:Montserrat;font-weight:800;color:#fff}
.cat{border-radius:14px;position:relative;overflow:hidden}
.cat span{position:absolute;left:8%;bottom:8%;font-family:Montserrat;font-weight:900;font-style:italic;text-transform:uppercase;color:#fff;text-shadow:0 2px 12px #000;z-index:2}
.cat::before{content:"";position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(0,0,0,.75));z-index:1}
.cover{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
`;

// ---------- peças básicas ----------
const Cover: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) => <Img src={src} className="cover" style={style} />;

// Cena: monta entre a e b; entra e sai com dissolve curto e desfoque leve (sem exagero)
const Cena: React.FC<{a: number; b: number; fi?: number; fo?: number; children: React.ReactNode; z?: number}> = ({a, b, fi = 0.35, fo = 0.35, children, z}) => {
  const t = useT();
  if (t < a - 0.01 || t > b + 0.01) return null;
  const kin = fi > 0 ? pr(t, a, fi, EIO) : 1;
  const kout = fo > 0 ? 1 - pr(t, b - fo, fo, EIO) : 1;
  const o = Math.min(kin, kout);
  const bl = (1 - kin) * 10 + (1 - kout) * 10;
  return (
    <AbsoluteFill style={{opacity: o, filter: bl > 0.05 ? `blur(${bl}px)` : undefined, zIndex: z}}>
      <div className="s">{children}</div>
    </AbsoluteFill>
  );
};

// Palavra que surge do desfoque, letra por letra
const Blur: React.FC<{at: number; txt: string; lime?: boolean; stag?: number; dur?: number; style?: React.CSSProperties}> = ({at, txt, lime, stag = 0.035, dur = 0.75, style}) => {
  const t = useT();
  const ch = [...txt];
  return (
    <span style={{whiteSpace: 'pre', ...style}}>
      {ch.map((c, i) => {
        const k = pr(t, at + i * stag, dur);
        const b = (1 - k) * 26;
        const filtro = [b > 0.1 ? `blur(${b}px)` : '', lime ? 'drop-shadow(0 0 18px rgba(153,226,0,.35))' : ''].join(' ').trim();
        return (
          <span key={i} className={lime ? 'lime' : undefined} style={{display: 'inline-block', opacity: cl(k * 1.5), filter: filtro || undefined, transform: `translateY(${(1 - k) * 26}px) scale(${lerp(1.08, 1, k)})`}}>
            {c === ' ' ? ' ' : c}
          </span>
        );
      })}
    </span>
  );
};

// Grupo que sai desfocando (troca de lockup)
const Sai: React.FC<{out: number; d?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({out, d = 0.32, children, style}) => {
  const t = useT();
  const k = pr(t, out, d, EIO);
  if (k >= 1) return null;
  return <div style={{opacity: 1 - k, filter: k > 0.01 ? `blur(${k * 18}px)` : undefined, transform: `scale(${1 + k * 0.05})`, ...style}}>{children}</div>;
};

// Aparece com mola (UI, cartões, avatares)
const Pop: React.FC<{at: number; children: React.ReactNode; dy?: number; s0?: number; style?: React.CSSProperties; blur?: boolean}> = ({at, children, dy = 40, s0 = 0.9, style, blur = true}) => {
  const t = useT();
  const k = mola(t, at);
  const o = pr(t, at, 0.25, EO);
  const b = blur ? (1 - o) * 14 : 0;
  return <div style={{opacity: o, transform: `translateY(${(1 - k) * dy}px) scale(${lerp(s0, 1, k)})`, filter: b > 0.1 ? `blur(${b}px)` : undefined, ...style}}>{children}</div>;
};

// Fundo base: grade que respira devagar + brilho verde
const Base: React.FC<{orb?: boolean}> = ({orb = true}) => {
  const t = useT();
  return (
    <>
      <div className="grid" style={{backgroundPosition: `0 ${(t * 6) % 96}px`}} />
      {orb ? <div className="orb" style={{left: 140, top: 420, width: 800, height: 800, transform: `scale(${1 + Math.sin(t * 0.8) * 0.04})`}} /> : null}
    </>
  );
};

// Deriva lenta para nada congelar
const Deriva: React.FC<{a: number; b: number; s0?: number; s1?: number; children: React.ReactNode; origin?: string}> = ({a, b, s0 = 1, s1 = 1.04, children, origin = '50% 45%'}) => {
  const t = useT();
  const s = lerp(s0, s1, cl((t - a) / (b - a)));
  return <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: origin}}>{children}</AbsoluteFill>;
};

// ---------- legenda contínua ----------
type P = {w: string; s: number; e: number};
const pal = PAL as P[];
const CHAVE = new Set(['imaginou', 'além', 'mensalidade', 'minutos', 'vixplay', 'menos', 'r$10', 'praticidade', 'entretenimento', 'utilizar', 'relaxar', 'curtir', 'assistir', 'agradável', 'veja', 'interface', 'opções', 'prática', 'procura', 'vantagem', 'créditos', 'indicação', 'ativo', 'r$5', 'bônus', 'seis', 'r$30', 'r$35', 'zero', 'prometemos', 'especial', 'desbloqueou', 'começar', 'cupom', 'abaixo', 'grátis']);
const norm = (w: string) => w.toLowerCase().replace(/[.,!?:;]/g, '');
type Cue = {ws: P[]; s: number; e: number};
const CUES: Cue[] = (() => {
  const out: Cue[] = [];
  let cur: P[] = [];
  const len = () => cur.map((x) => x.w).join(' ').length;
  const flush = () => {
    if (cur.length) out.push({ws: cur, s: cur[0].s, e: cur[cur.length - 1].e});
    cur = [];
  };
  pal.forEach((p, i) => {
    const prox = pal[i + 1];
    // "TV" nunca abre legenda sozinho: fica junto do "VixPlay"
    if (cur.length && len() + 1 + p.w.length > 21 && !/^TV/.test(p.w)) flush();
    cur.push(p);
    const pausa = prox ? prox.s - p.e > 0.3 : true;
    if (/[.?!]$/.test(p.w) || (/,$/.test(p.w) && len() > 9) || (pausa && len() > 8)) flush();
  });
  flush();
  return out.map((c, i) => ({...c, e: Math.min(out[i + 1] ? out[i + 1].s : 999, c.e + 0.5)}));
})();
const FIM_LEGENDA = 126.6;
const Legenda: React.FC = () => {
  const t = useT();
  if (t >= FIM_LEGENDA) return null;
  const c = CUES.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const k = pr(t, c.s - 0.04, 0.16, EO);
  const ko = 1 - pr(t, c.e - 0.08, 0.08, EIO);
  return (
    <p className="cap" style={{opacity: Math.min(k, ko), transform: `translateY(${(1 - k) * 14}px)`, filter: k < 0.99 ? `blur(${(1 - k) * 8}px)` : undefined}}>
      {c.ws.map((w, i) => (
        <React.Fragment key={i}>
          {i ? ' ' : ''}
          {CHAVE.has(norm(w.w)) ? <b>{w.w}</b> : w.w}
        </React.Fragment>
      ))}
    </p>
  );
};

// ---------- pôsteres em 3D ----------
const Parede: React.FC<{top: number; ids: number[]; a: number; vel?: number; style?: React.CSSProperties}> = ({top, ids, a, vel = 34, style}) => {
  const t = useT();
  const y = 60 - (t - a) * vel;
  return (
    <div className="ab" style={{left: -120, top, width: 1320, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 26, transform: `perspective(1600px) rotateX(18deg) rotateZ(-8deg) translateY(${y}px)`, ...style}}>
      {ids.map((n, i) => (
        <div key={i} style={{aspectRatio: '2/3', borderRadius: 22, overflow: 'hidden', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,.6)'}}>
          <Cover src={PX(n)} />
        </div>
      ))}
    </div>
  );
};

// ---------- TV, celular e interface ----------
const TV: React.FC<{x: number; y: number; w: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, children, style}) => {
  const h = Math.round((w * 9) / 16);
  return (
    <div className="tv" style={{left: x, top: y, width: w, height: h, ...style}}>
      <div className="sc">{children}</div>
      <span className="bar" />
      <span className="foot" style={{left: '18%'}} />
      <span className="foot" style={{right: '18%'}} />
    </div>
  );
};

const Home: React.FC<{a: number}> = ({a}) => {
  const t = useT();
  const f = 22;
  const troca = pr(t, 51.76, 0.6, EIO); // destaque passando
  const foco = Math.min(5, Math.max(0, Math.floor((t - a - 0.8) / 0.75)));
  return (
    <div className="app">
      <div className="side">
        <Img src={AS('logo.png')} style={{width: '80%', marginBottom: '10%'}} />
        <i className="on" />
        <i />
        <i />
        <i />
      </div>
      <div className="main">
        <div className="hero">
          <Cover src={PX(13)} style={{transform: `scale(${1.05 + (t - a) * 0.004}) translateX(${-troca * 30}px)`, opacity: 1 - troca}} />
          <Cover src={PX(15)} style={{transform: `scale(1.05) translateX(${(1 - troca) * 30}px)`, opacity: troca}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(5,8,10,.9),transparent 60%)'}} />
          <div style={{position: 'absolute', left: '5%', top: '24%', zIndex: 2}}>
            <p className="t" style={{fontSize: f * 1.6, fontStyle: 'italic'}}>AO VIVO</p>
            <p style={{color: '#cfd6cc', fontSize: f * 0.8, marginTop: 6}}>Esportes em alta definição</p>
            <span style={{display: 'inline-block', marginTop: 12, padding: '6px 16px', borderRadius: 8, background: '#99e200', color: '#061000', fontWeight: 800, fontSize: f * 0.7}}>ASSISTIR</span>
          </div>
        </div>
        <p className="t" style={{fontSize: f, marginTop: '3%'}}>Em alta</p>
        <div className="row">
          {[0, 1, 2, 3, 8, 10].map((n, i) => (
            <div key={i} style={{outline: i === foco ? '4px solid #99e200' : 'none', outlineOffset: 3, transform: `scale(${i === foco ? 1.06 : 1})`, transition: 'none'}}>
              <Cover src={PX(n)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Categorias: React.FC<{a: number}> = ({a}) => {
  const t = useT();
  const foco = Math.min(5, Math.max(0, Math.floor((t - a - 0.6) / 0.9)));
  const cats: [string, number][] = [['Filmes', 0], ['Séries', 1], ['Esportes', 15], ['Documentários', 8], ['Infantil', 4], ['Ao vivo', 13]];
  return (
    <div className="app" style={{padding: '3%', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2.5%'}}>
      {cats.map(([nome, n], i) => (
        <div key={i} className="cat" style={{outline: i === foco ? '4px solid #99e200' : 'none', outlineOffset: 3, transform: `scale(${i === foco ? 1.04 : 1})`}}>
          <Cover src={PX(n)} />
          <span style={{fontSize: 30}}>{nome}</span>
        </div>
      ))}
    </div>
  );
};

const Busca: React.FC<{a: number}> = ({a}) => {
  const t = useT();
  const palavra = 'futeb';
  const n = Math.max(0, Math.min(palavra.length, Math.floor((t - a - 0.15) / 0.16) + 1));
  const res = pr(t, a + 1.1, 0.5);
  const cursor = Math.floor(t * 2.2) % 2 === 0;
  return (
    <div className="app" style={{flexDirection: 'column', padding: '4% 5%'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 22px', borderRadius: 12, background: '#0f1614', border: '2px solid #99e200'}}>
        <span style={{width: 22, height: 22, border: '4px solid #cfd6cc', borderRadius: '50%'}} />
        <span style={{fontSize: 30, color: '#fff', fontWeight: 600}}>
          {palavra.slice(0, n)}
          <span style={{borderRight: `3px solid ${cursor ? '#99e200' : 'transparent'}`}}>&nbsp;</span>
        </span>
      </div>
      <div style={{display: 'flex', gap: '2%', marginTop: '4%', opacity: res, transform: `translateY(${(1 - res) * 20}px)`}}>
        {[13, 14, 15, 13].map((m, i) => (
          <div key={i} style={{flex: 1, aspectRatio: '16/10', borderRadius: 10, overflow: 'hidden', position: 'relative', outline: i === 0 ? '4px solid #99e200' : 'none', outlineOffset: 3}}>
            <Cover src={PX(m)} />
          </div>
        ))}
      </div>
      <p className="t" style={{fontSize: 26, marginTop: '4%', opacity: res}}>Resultados para "futeb"</p>
    </div>
  );
};

// ---------- letra gigante que a câmera atravessa ----------
const LetraGigante: React.FC<{txt: string; a: number; b: number; left: number; top: number; size: number; stroke: string; origin: string; ls?: string}> = ({txt, a, b, left, top, size, stroke, origin, ls}) => {
  const t = useT();
  const chega = pr(t, a, 1.0, EO);
  const atravessa = pr(t, b - 0.5, 0.5, Easing.in(Easing.cubic));
  const s = lerp(0.45, 1, chega) * lerp(1, 1.06, cl((t - a) / (b - a))) * lerp(1, 9, atravessa);
  return (
    <p className="ab hl" style={{left, top, fontSize: size, lineHeight: 1, letterSpacing: ls, color: '#0c140a', WebkitTextStroke: stroke, opacity: chega, transform: `scale(${s})`, transformOrigin: origin}}>
      {txt}
    </p>
  );
};

const Av: React.FC<{on: number; letra: string; at: number}> = ({on, letra, at}) => {
  const t = useT();
  const k = pr(t, on, 0.35);
  return (
    <Pop at={at} dy={0} s0={0.6} blur={false}>
      <span className="av" style={{borderColor: k > 0.5 ? '#99e200' : '#6f7f6b', color: k > 0.5 ? '#99e200' : '#6f7f6b', boxShadow: `0 0 24px -4px rgba(153,226,0,${0.6 * k})`, transform: `scale(${1 + Math.sin(Math.PI * k) * 0.12})`}}>
        {k > 0.5 ? letra : '+'}
      </span>
    </Pop>
  );
};

const useCarrega = () => {
  const [h] = React.useState(() => delayRender('fontes e imagens'));
  React.useEffect(() => {
    const fontes = ["italic 900 100px Montserrat", "900 100px Montserrat", "800 100px Montserrat", "italic 800 100px Montserrat", "600 40px Montserrat", "300 64px 'Inter Variable'", "600 30px 'Inter Variable'"].map((s) => document.fonts.load(s, 'AÇÃÊ açãê R$ 0123 ↓'));
    const imgs = IMGS.map((src) => new Promise<void>((ok) => { const i = new Image(); i.onload = () => ok(); i.onerror = () => ok(); i.src = src; }));
    Promise.all([...fontes, ...imgs]).then(() => document.fonts.ready).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

// ---------- composição ----------
export const VslVixplay: React.FC = () => {
  useCarrega();
  const t = useT();
  const seta = Math.sin(t * 5) * 16;

  return (
    <AbsoluteFill style={{background: '#010204'}}>
      <style>{CSS}</style>

      {/* ===== Cena 1 · Gancho ===== */}
      {/* G01 */}
      <Cena a={0} b={2.85} fi={0} fo={0.3}>
        <AbsoluteFill style={{transform: `scale(${lerp(1.14, 1.02, pr(t, 0, 2.85, EIO))})`}}><Cover src={PX(14)} /></AbsoluteFill>
        <div className="vig" />
        <Base orb={false} />
        <div className="lk" style={{top: 640}}>
          <p className="sm"><Blur at={0.0} txt="já" /></p>
          <p className="xl" style={{fontSize: 158}}><Blur at={0.2} txt="IMAGINOU?" lime stag={0.05} /></p>
        </div>
      </Cena>

      {/* G02 */}
      <Cena a={2.55} b={6.0}>
        <Parede top={300} a={2.55} ids={[0, 14, 1, 8, 2, 13, 3, 10, 6, 15, 0, 1, 14, 8, 2, 13]} />
        <div className="vig" />
        <div className="lk" style={{top: 820, textAlign: 'center'}}>
          <p className="sm" style={{color: '#f2f7ee'}}><Blur at={2.6} txt="uma experiência que" stag={0.015} /></p>
          <p className="xl" style={{fontSize: 150}}><Blur at={2.84} txt="VAI ALÉM" lime stag={0.045} /></p>
        </div>
      </Cena>

      {/* G03: lockups em 3 tamanhos */}
      <Cena a={5.75} b={19.5} fo={0.3}>
        <Base />
        <Deriva a={5.75} b={9.6}>
          <Sai out={9.3}>
            <div className="lk" style={{top: 560}}>
              <p className="sm"><Blur at={5.3} txt="reduza a sua" stag={0.02} /></p>
              <p className="xl" style={{fontSize: 150}}><Blur at={5.55} txt="MENSALI-" /></p>
              <p className="xl" style={{fontSize: 150}}><Blur at={5.85} txt="DADE" lime /></p>
              <p className="sm" style={{textAlign: 'right', marginTop: 30, fontSize: 56}}><Blur at={6.12} txt="com " stag={0.02} /><Blur at={6.2} txt="indicações" stag={0.02} style={{color: '#99e200', fontWeight: 700}} /></p>
            </div>
          </Sai>
        </Deriva>
        <Deriva a={9.6} b={12.4}>
          <Sai out={12.15}>
            <div className="lk" style={{top: 600}}>
              <p className="sm"><Blur at={10.2} txt="fique comigo por" stag={0.02} /></p>
              <p className="xl" style={{fontSize: 150}}><Blur at={10.95} txt="ALGUNS" /></p>
              <p className="xl" style={{fontSize: 150}}><Blur at={11.35} txt="MINUTOS" lime /></p>
            </div>
          </Sai>
        </Deriva>
        <Deriva a={12.4} b={14.9}>
          <Sai out={14.6}>
            <div className="lk" style={{top: 600}}>
              <p className="sm"><Blur at={12.4} txt="vou apresentar a" stag={0.02} /></p>
              <p className="xl" style={{fontSize: 150}}><Blur at={13.4} txt="VIXPLAY" lime /></p>
              <p className="xl" style={{fontSize: 150}}><Blur at={13.85} txt="TV" /></p>
            </div>
          </Sai>
        </Deriva>
        <Deriva a={14.9} b={19.5}>
          <div className="lk" style={{top: 600}}>
            <p className="sm"><Blur at={15.2} txt="uma oportunidade" stag={0.02} /></p>
            <p className="xl" style={{fontSize: 150}}><Blur at={18.15} txt="MUITO" /></p>
            <p className="xl" style={{fontSize: 150}}><Blur at={18.6} txt="MENOS" lime /></p>
          </div>
        </Deriva>
      </Cena>

      {/* G04: câmera atravessa o R$ */}
      <Cena a={19.4} b={26.45} fo={0.25}>
        <div className="grid" />
        <LetraGigante txt="R$" a={19.4} b={26.45} left={-260} top={120} size={1500} stroke="6px rgba(153,226,0,.55)" origin="62% 48%" ls="-.05em" />
        <div className="ab" style={{inset: 0, background: 'radial-gradient(circle at 60% 50%,transparent 20%,rgba(1,2,4,.85) 70%)'}} />
        <Sai out={25.9} d={0.35}>
          <div className="lk" style={{top: 780, textAlign: 'right'}}>
            <p className="sm" style={{color: '#f2f7ee'}}><Blur at={19.72} txt="no final," stag={0.02} /></p>
            <p className="xl" style={{fontSize: 170}}><Blur at={22.6} txt="R$10" lime stag={0.06} /></p>
            <p className="sm"><Blur at={23.7} txt="de desconto" stag={0.02} /></p>
          </div>
        </Sai>
      </Cena>

      {/* ===== Cena 2 · Apresentação ===== */}
      {/* G05 */}
      <Cena a={26.25} b={31.7}>
        <Base />
        <Deriva a={26.25} b={31.7} s1={1.05}>
          <div className="ab" style={{left: 0, right: 0, top: 600, height: 6, background: 'linear-gradient(90deg,transparent,#b8ff1f,transparent)', opacity: 0.8, transform: `scaleX(${pr(t, 26.3, 0.9)})`}} />
          <Pop at={26.66} dy={0} s0={0.9} style={{position: 'absolute', left: 190, top: 690, width: 700}}>
            <Img src={AS('logo.png')} style={{width: 700}} />
          </Pop>
          <div className="ab" style={{left: 0, right: 0, top: 1040, height: 6, background: 'linear-gradient(90deg,transparent,#b8ff1f,transparent)', opacity: 0.5, transform: `scaleX(${pr(t, 26.45, 0.9)})`}} />
        </Deriva>
      </Cena>

      {/* G06 */}
      <Cena a={31.6} b={37.5}>
        <Base />
        <div className="floor" style={{top: 1010, opacity: pr(t, 31.7, 0.8)}} />
        {(() => {
          const kt = mola(t, 31.7, 16, 90);
          const kc = mola(t, 32.15, 16, 90);
          const fl = Math.sin(t * 1.1) * 6;
          return (
            <>
              <TV x={80} y={470} w={700} style={{opacity: pr(t, 31.7, 0.3), transform: `translateX(${(1 - kt) * -120}px) translateY(${fl * 0.5}px)`}}>
                <Cover src={AS('serie-tv.jpg')} style={{transform: `scale(${1.04 + (t - 31.6) * 0.01})`}} />
                <div className="ui">
                  <p style={{fontSize: 27}}>NOITE ADENTRO</p>
                  <p style={{fontSize: 15, fontWeight: 600, color: '#cfd6cc', marginTop: 4}}>Temporada 1 · Episódio 3</p>
                  <div className="pr"><i style={{width: `${38 + (t - 31.6) * 1.2}%`}} /></div>
                </div>
              </TV>
              <div className="cel" style={{left: 770, top: 560, width: 240, height: 509, opacity: pr(t, 32.15, 0.3), transform: `translateY(${(1 - kc) * 160 + fl}px) rotate(4deg)`}}>
                <span className="isl" />
                <span className="bt" style={{right: -9, top: '22%', height: '13%'}} />
                <span className="bt" style={{left: -9, top: '18%', height: '7%'}} />
                <span className="bt" style={{left: -9, top: '28%', height: '7%'}} />
                <div className="sc">
                  <Cover src={AS('serie-cel.jpg')} style={{transform: `scale(${1.04 + (t - 31.6) * 0.01})`}} />
                  <div className="ui" style={{padding: '30px 26px 40px'}}>
                    <p style={{fontSize: 20}}>CHUVA DE VERÃO</p>
                    <div className="pr"><i style={{width: `${62 + (t - 31.6) * 1.2}%`}} /></div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
        <Pop at={33.4} dy={20} style={{position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center'}}>
          <p className="lbl">SMART TV · CELULAR · TV BOX · FIRE TV STICK</p>
        </Pop>
      </Cena>

      {/* G07 */}
      <Cena a={37.4} b={46.0}>
        <AbsoluteFill style={{transform: `scale(${lerp(1.0, 1.1, cl((t - 37.4) / 8.6))})`}}><Cover src={PX(6)} style={{filter: 'brightness(.4)'}} /></AbsoluteFill>
        <div className="vig" />
        <div className="lk" style={{top: 520}}>
          <p className="xl" style={{fontSize: 140, color: 'rgba(242,247,238,.35)'}}><Blur at={37.8} txt="relaxar" /></p>
          <p className="xl" style={{fontSize: 170}}><Blur at={38.86} txt="curtir" lime stag={0.05} /></p>
          <p className="xl" style={{fontSize: 140, color: 'rgba(242,247,238,.35)'}}><Blur at={41.5} txt="assistir" /></p>
        </div>
      </Cena>

      {/* G08: câmera atravessa o V */}
      <Cena a={45.9} b={49.55} fo={0.25}>
        <div className="grid" />
        <LetraGigante txt="V" a={45.9} b={49.55} left={-420} top={-60} size={2000} stroke="6px rgba(153,226,0,.5)" origin="50% 62%" />
        <Sai out={47.75} d={0.25}>
          <div className="lk" style={{top: 640, textAlign: 'center'}}>
            <p className="sm" style={{color: '#f2f7ee'}}><Blur at={46.06} txt="não queremos apenas" stag={0.015} /></p>
            <p className="xl" style={{fontSize: 200, color: 'rgba(242,247,238,.35)'}}><Blur at={47.0} txt="FALAR" /></p>
          </div>
        </Sai>
        <Sai out={49.1} d={0.35}>
          <div className="lk" style={{top: 640, textAlign: 'center'}}>
            <p className="sm" style={{color: '#f2f7ee'}}><Blur at={47.9} txt="queremos que você" stag={0.015} /></p>
            <p className="xl" style={{fontSize: 260}}><Blur at={48.66} txt="VEJA" lime stag={0.05} /></p>
          </div>
        </Sai>
      </Cena>

      {/* ===== Cena 3 · Demonstração (G09 a G11, a mesma TV) ===== */}
      <Cena a={49.3} b={64.4} fi={0.4}>
        <Base />
        {(() => {
          const ent = pr(t, 49.3, 1.0);
          const s = lerp(1.18, 1, ent) * lerp(1, 1.07, cl((t - 49.3) / 15));
          const cena = t < 54.4 ? 0 : t < 60.95 ? 1 : 2;
          const nomes = ['Tela inicial', 'Categorias', 'Busca'];
          const trocas = [49.3, 54.4, 60.95];
          const kTroca = (i: number) => (i === 0 ? 1 : pr(t, trocas[i], 0.35, EIO));
          return (
            <>
              <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '50% 45%'}}>
                <TV x={40} y={560} w={1000}>
                  <div style={{position: 'absolute', inset: 0, isolation: 'isolate', zIndex: 1}}><Home a={49.3} /></div>
                  {t >= 54.4 ? <div style={{position: 'absolute', inset: 0, isolation: 'isolate', zIndex: 2, opacity: kTroca(1), transform: `scale(${lerp(1.04, 1, kTroca(1))})`}}><Categorias a={54.4} /></div> : null}
                  {t >= 60.95 ? <div style={{position: 'absolute', inset: 0, isolation: 'isolate', zIndex: 3, opacity: kTroca(2), transform: `scale(${lerp(1.04, 1, kTroca(2))})`}}><Busca a={60.95} /></div> : null}
                </TV>
                <div className="floor" style={{top: 1150}} />
              </AbsoluteFill>
              {nomes.map((n, i) =>
                i === cena ? (
                  <Pop key={n} at={trocas[i] + 0.15} dy={16} style={{position: 'absolute', left: 60, top: 300}}>
                    <span className="chip" style={{position: 'relative'}}>{n}</span>
                  </Pop>
                ) : null,
              )}
            </>
          );
        })()}
      </Cena>

      {/* ===== Cena 4 · Indique e Ganhe ===== */}
      {/* G12 */}
      <Cena a={64.3} b={73.15}>
        <Base />
        <Deriva a={64.3} b={73.15} s1={1.05}>
          <div style={{position: 'absolute', left: 330, top: 620, clipPath: `inset(0 ${(1 - pr(t, 64.5, 0.6)) * 100}% 0 0)`}}>
            <span className="badge" style={{position: 'relative', display: 'inline-block'}}>Programa</span>
          </div>
          <p className="ab hl" style={{left: 0, right: 0, textAlign: 'center', top: 730, fontSize: 170}}><Blur at={64.8} txt="Indique" /></p>
          <p className="ab hl" style={{left: 0, right: 0, textAlign: 'center', top: 900, fontSize: 170}}><Blur at={69.5} txt="e ganhe" lime stag={0.05} /></p>
        </Deriva>
      </Cena>

      {/* G13 */}
      <Cena a={73.05} b={80.85}>
        <Base />
        <Deriva a={73.05} b={80.85} s1={1.04}>
          <div className="ab" style={{left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 14}}>
            {[0, 1, 2, 3, 4, 5].map((i) => <Av key={i} letra="A" on={i === 0 ? 75.9 : 999} at={73.25 + i * 0.07} />)}
          </div>
          <Pop at={76.95} dy={0} s0={0.75} style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center'}}>
            <p className="hl lime" style={{fontSize: 260, filter: 'drop-shadow(0 0 18px rgba(153,226,0,.35))'}}>+R$5</p>
          </Pop>
          <Pop at={77.7} dy={16} style={{position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center'}}>
            <p className="lbl">POR INDICADO ATIVO</p>
          </Pop>
        </Deriva>
      </Cena>

      {/* G14 */}
      <Cena a={80.75} b={85.7}>
        <Base />
        <Deriva a={80.75} b={85.7} s1={1.04}>
          <Pop at={80.85} dy={50} s0={0.92} style={{position: 'absolute', left: 200, top: 560, width: 680}}>
            <div className="card" style={{position: 'relative', padding: 50, textAlign: 'center'}}>
              <p className="lbl"><Blur at={81.5} txt="RENOVOU EM DIA" stag={0.015} /></p>
              <p className="hl" style={{fontSize: 220, marginTop: 20}}><Blur at={83.8} txt="+R$5" lime stag={0.05} /></p>
              <p className="lbl" style={{marginTop: 10}}><Blur at={84.7} txt="DE BÔNUS" stag={0.015} /></p>
            </div>
          </Pop>
        </Deriva>
      </Cena>

      {/* G15 + G16: créditos sobem até R$35 e viram R$0 */}
      <Cena a={85.6} b={105.6}>
        <Base />
        {(() => {
          // contador: 0 -> 30 em "R$30" (89.76), 30 -> 35 em "R$5" (93.9)
          const v1 = pr(t, 89.76, 1.0, Easing.out(Easing.quad));
          const v2 = pr(t, 93.9, 0.4, Easing.out(Easing.quad));
          const val = Math.round((v1 * 30 + v2 * 5) / 5) * 5;
          const bump = t >= 96.66 ? 1 + Math.sin(Math.PI * cl((t - 96.66) / 0.4)) * 0.06 : 1;
          const vira = pr(t, 104.45, 0.4, EIO);
          return (
            <>
              <Sai out={99.2} d={0.4}>
                <div className="ab" style={{left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 12}}>
                  {'ABCDEF'.split('').map((l, i) => <Av key={l} letra={l} on={86.48 + i * 0.3} at={85.7 + i * 0.06} />)}
                </div>
                <Pop at={89.7} dy={14} style={{position: 'absolute', left: 0, right: 0, top: 630, textAlign: 'center'}}>
                  <p className="lbl">6 INDICADOS R$ 30<span style={{opacity: pr(t, 93.35, 0.4)}}> + EM DIA R$ 5</span></p>
                </Pop>
                <Pop at={97.8} dy={14} style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center'}}>
                  <p className="lbl">EM CRÉDITOS</p>
                </Pop>
              </Sai>
              {/* R$35 grande que encolhe e vira o riscado do G16 */}
              {t >= 89.7 ? (
                <div className="ab" style={{left: 0, right: 0, top: lerp(720, 560, vira), textAlign: 'center', opacity: pr(t, 89.7, 0.3)}}>
                  <p className={vira < 0.5 ? 'hl lime' : 'hl'} style={{display: 'inline-block', fontSize: lerp(330, 110, vira), color: vira < 0.5 ? undefined : '#6f7f6b', filter: vira < 0.5 ? 'drop-shadow(0 0 18px rgba(153,226,0,.35))' : undefined, transform: `scale(${bump})`, position: 'relative'}}>
                    R${val}
                    <span style={{position: 'absolute', left: 0, top: '52%', height: 8, background: '#6f7f6b', width: `${pr(t, 104.75, 0.3) * 100}%`}} />
                  </p>
                </div>
              ) : null}
              <Pop at={104.85} dy={0} s0={1.35} style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center'}}>
                <p className="hl lime" style={{fontSize: 440, filter: 'drop-shadow(0 0 18px rgba(153,226,0,.35))'}}>R$0</p>
              </Pop>
            </>
          );
        })()}
      </Cena>

      {/* ===== Cena 5 · Revelação ===== */}
      {/* G17 */}
      <Cena a={105.5} b={111.75} fo={0.2}>
        <div className="grid" />
        {(() => {
          const abre = pr(t, 110.6, 0.45, EO);
          const brilho = lerp(0.6, 1, pr(t, 106.5, 3)) + abre * 0.6;
          const flash = pr(t, 110.9, 0.7, EIO);
          return (
            <>
              <div className="orb" style={{left: 40, top: 260, width: 1000, height: 1000, background: 'radial-gradient(circle,rgba(153,226,0,.4) 0%,transparent 62%)', opacity: brilho, transform: `scale(${1 + abre * 0.25})`}} />
              <Pop at={105.6} dy={0} s0={0.8} style={{position: 'absolute', left: 340, top: 560, width: 400, height: 400}}>
                <div className="card" style={{position: 'relative', width: 400, height: 400, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + Math.sin(Math.PI * cl((t - 110.6) / 0.35)) * 0.06})`}}>
                  <svg width="170" height="190" viewBox="0 0 130 150" style={{overflow: 'visible'}}>
                    <g style={{transform: `translateY(${-14 * abre}px) rotate(${-22 * abre}deg)`, transformOrigin: '30px 45px'}}>
                      <path d="M30 70V45a35 35 0 0 1 70 0V70" fill="none" stroke="#b8ff1f" strokeWidth="12" strokeLinecap="round" />
                    </g>
                    <rect x="12" y="68" width="106" height="78" rx="18" fill="#99e200" />
                  </svg>
                </div>
              </Pop>
              <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%,rgba(184,255,31,.55),transparent 60%)', opacity: Math.sin(Math.PI * flash) * 0.8}} />
            </>
          );
        })()}
      </Cena>

      {/* G18 */}
      <Cena a={111.55} b={121.3} fi={0.25}>
        <div className="grid" />
        <div className="orb" style={{left: 40, top: 260, width: 1000, height: 1000, background: 'radial-gradient(circle,rgba(153,226,0,.35) 0%,transparent 62%)', transform: `scale(${1 + Math.sin(t * 0.9) * 0.04})`}} />
        <Deriva a={111.55} b={121.3} s1={1.03}>
          <div style={{position: 'absolute', left: 250, top: 400, zIndex: 2, clipPath: `inset(0 ${(1 - pr(t, 111.96, 0.55)) * 100}% 0 0)`}}>
            <span className="badge" style={{position: 'relative', display: 'inline-block'}}>Você desbloqueou</span>
          </div>
          <Pop at={112.3} dy={60} s0={0.86} style={{position: 'absolute', left: 130, top: 520, width: 820}}>
            <div className="card" style={{position: 'relative', padding: '60px 40px', textAlign: 'center', overflow: 'hidden'}}>
              <p className="hl" style={{fontSize: 300, transform: `scale(${1 + Math.sin(Math.PI * cl((t - 118.5) / 0.45)) * 0.05})`}}><Blur at={112.62} txt="R$10" lime stag={0.07} dur={0.9} /></p>
              <p className="hl" style={{fontSize: 70, marginTop: 10}}><Blur at={113.7} txt="de desconto" stag={0.025} /></p>
              <div style={{margin: '40px auto 0', width: 560, paddingTop: 30, position: 'relative'}}>
                <div style={{position: 'absolute', left: 0, top: 0, height: 0, borderTop: '4px dashed rgba(153,226,0,.5)', width: `${pr(t, 114.6, 0.6) * 100}%`}} />
                <span className="lbl" style={{opacity: pr(t, 115.1, 0.3)}}>CUPOM </span>
                <span className="hl" style={{fontSize: 66, fontStyle: 'normal', letterSpacing: '.08em'}}>
                  {'10REAIS'.split('').map((c, i) => (
                    <span key={i} style={{opacity: t >= 115.25 + i * 0.07 ? 1 : 0}}>{c}</span>
                  ))}
                </span>
              </div>
              {/* reflexo que passa no cartão */}
              <div style={{position: 'absolute', top: 0, bottom: 0, width: 220, left: lerp(-300, 1100, pr(t, 112.9, 1.1, EIO)), background: 'linear-gradient(100deg,transparent,rgba(184,255,31,.16),transparent)', transform: 'skewX(-18deg)'}} />
            </div>
          </Pop>
        </Deriva>
      </Cena>

      {/* G19 */}
      <Cena a={121.2} b={126.7}>
        <Base />
        <Deriva a={121.2} b={126.7} s1={1.03}>
          <Pop at={121.25} dy={30} s0={0.94} style={{position: 'absolute', left: 250, top: 520, width: 580}}>
            <div className="card" style={{position: 'relative', padding: 44, textAlign: 'center'}}>
              <p className="hl lime" style={{fontSize: 170, filter: 'drop-shadow(0 0 18px rgba(153,226,0,.35))'}}>R$10</p>
              <p className="hl" style={{fontSize: 52, fontStyle: 'normal', letterSpacing: '.08em', marginTop: 10}}>10REAIS</p>
            </div>
          </Pop>
          <Pop at={121.65} dy={-30} style={{position: 'absolute', left: 0, right: 0, top: 980 + (t > 121.65 ? seta : 0), textAlign: 'center'}}>
            <p className="hl lime" style={{fontSize: 200, lineHeight: 0.8}}>↓</p>
          </Pop>
        </Deriva>
      </Cena>

      {/* ===== Cena 6 · Encerramento (G20) ===== */}
      <Cena a={126.6} b={139.2} fo={0}>
        <Parede top={-160} a={126.6} vel={22} ids={[14, 0, 1, 8, 2, 13, 3, 10, 6, 15, 0, 1, 14, 8, 2, 13]} style={{opacity: 0.85}} />
        <div className="ab" style={{inset: 0, background: 'linear-gradient(180deg,rgba(1,2,4,.15) 0%,rgba(1,2,4,.6) 28%,#010204 46%)'}} />
        <div className="grid" style={{top: 700}} />
        <div className="orb" style={{left: 90, top: 760, width: 900, height: 900, transform: `scale(${1 + Math.sin(t * 0.9) * 0.05})`}} />
        <Pop at={126.7} dy={0} s0={0.9} style={{position: 'absolute', left: 330, top: 640, width: 420}}>
          <Img src={AS('logo.png')} style={{width: 420, transform: `scale(${1 + Math.sin(Math.PI * cl((t - 133.5) / 0.5)) * 0.05})`}} />
        </Pop>
        <Sai out={131.5} d={0.3}>
          <div className="lk" style={{top: 900, textAlign: 'center'}}>
            <p className="sm" style={{color: '#f2f7ee'}}><Blur at={126.66} txt="clique no botão e" stag={0.015} /></p>
            <p className="xl" style={{fontSize: 150, marginTop: 10}}><Blur at={128.1} txt="RESGATE" /></p>
            <p className="xl" style={{fontSize: 120}}><Blur at={128.45} txt="SEU CUPOM" lime /></p>
          </div>
        </Sai>
        <Sai out={133.3} d={0.3}>
          <div className="lk" style={{top: 900, textAlign: 'center'}}>
            <p className="sm" style={{color: '#f2f7ee'}}><Blur at={131.7} txt="estamos esperando" stag={0.015} /></p>
            <p className="xl" style={{fontSize: 190, marginTop: 10}}><Blur at={132.6} txt="VOCÊ!" lime stag={0.05} /></p>
          </div>
        </Sai>
        <div className="lk" style={{top: 900, textAlign: 'center'}}>
          <p className="sm" style={{color: '#f2f7ee'}}><Blur at={134.45} txt="o melhor do on-demand" stag={0.015} /></p>
          <p className="xl" style={{fontSize: 150, marginTop: 10}}><Blur at={136.35} txt="pode sair" /></p>
          <p className="xl" style={{fontSize: 190}}><Blur at={136.88} txt="grátis!" lime stag={0.05} /></p>
        </div>
        <Pop at={126.94} dy={60} s0={0.9} style={{position: 'absolute', left: 0, right: 0, top: 1360}}>
          {(() => {
            const aperta = 1 - Math.sin(Math.PI * cl((t - 128.14) / 0.25)) * 0.05;
            const glow = 0.5 + Math.sin(t * 3) * 0.15;
            return (
              <div className="btn" style={{position: 'relative', left: 0, right: 0, margin: '0 110px', fontSize: 46, transform: `scale(${aperta})`, boxShadow: `0 0 0 2px rgba(153,226,0,.5),0 0 70px -6px rgba(153,226,0,${glow + 0.1})`}}>
                Resgatar meu cupom
              </div>
            );
          })()}
        </Pop>
        <Pop at={127.3} dy={-30} style={{position: 'absolute', left: 0, right: 0, top: 1560 + seta * 0.8, textAlign: 'center'}}>
          <p className="hl lime" style={{fontSize: 120, lineHeight: 0.8}}>↓</p>
        </Pop>
      </Cena>

      <Legenda />
    </AbsoluteFill>
  );
};
