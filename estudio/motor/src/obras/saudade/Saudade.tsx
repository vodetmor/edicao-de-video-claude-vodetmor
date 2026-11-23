// Aula da Saudade: álbum que abre, páginas de foto/vídeo, letra em colagem (bilhete de resgate) no tempo da voz, álbum que fecha.
// Plano gerado por pessoal-vitor/meu-terceirao/trabalho/scripts/montar_saudade.py (plano.json).
import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, E, hash, lerp} from '../../kit';
import plano from './plano.json';
import {Album3D, ALBUM, DIST_TOPO} from './Album3D';

const FPS = 30;
export const DUR_SAUDADE = Math.round(plano.duracao * FPS);
const PASS = 22; // quadros de passagem entre páginas

// ---------------------------------------------------------------- fontes
const FONTES: [string, string, string?][] = [
  ['S_Abril', 'AbrilFatface-Regular'], ['S_Alfa', 'AlfaSlabOne-Regular'], ['S_Bevan', 'Bevan-Regular'], ['S_Pacifico', 'Pacifico-Regular'],
  ['S_Shrikhand', 'Shrikhand-Regular'], ['S_Rye', 'Rye-Regular'], ['S_DM', 'DMSerifDisplay-Regular'], ['S_DMi', 'DMSerifDisplay-Italic'],
  ['S_Bungee', 'Bungee-Regular'], ['S_Lobster', 'Lobster-Regular'], ['S_Play', 'PlayfairDisplay-Italic', '400 900'],
  ['S_Caveat', 'Caveat', '400 700'], ['S_Inter', 'Inter', '100 900'],
];
const RANSOM = ['S_Abril', 'S_Alfa', 'S_Bevan', 'S_Pacifico', 'S_Shrikhand', 'S_Rye', 'S_DM', 'S_DMi', 'S_Bungee', 'S_Lobster', 'S_Play'];
let fontesPronto = false;
let fontesH: number | null = null;
const carregaFontes = () => {
  if (fontesPronto || fontesH !== null || typeof document === 'undefined') return;
  fontesH = delayRender('fontes da saudade');
  Promise.all(
    FONTES.map(([nome, arq, peso]) => {
      const ff = new FontFace(nome, `url(${staticFile(`saudade/fontes/${arq}.ttf`)})`, peso ? {weight: peso} : {});
      return ff.load().then((x) => document.fonts.add(x));
    }),
  ).then(() => { fontesPronto = true; continueRender(fontesH!); }).catch(() => { fontesPronto = true; continueRender(fontesH!); });
};

// ---------------------------------------------------------------- papéis (cores medidas nas referências do Vítor)
// papéis de verdade (fotos de papel amassado/envelhecido, Pexels/Pixabay livres) + a tinta da letra que combina com cada um
const PAPEL: [string, string][] = [
  ['t1', '#2a2a3a'], ['t2', '#3a1f2b'], ['t3', '#7b2a35'], ['t4', '#f3e9d2'], ['t5', '#f6e9c8'], ['t6', '#8c2f3a'], ['t7', '#23263a'], ['t8', '#2a1c14'],
];
const FUNDOS = [1, 2, 3, 4, 6, 7].map((n) => staticFile(`saudade/papel/fundo${n}.jpg`));

const rasgado = (w: number, h: number, size: number, sd: number) => {
  const j = size * 0.05;
  const p: string[] = [];
  const r = (k: number) => (hash(sd, 100 + k) - 0.5) * 2 * j;
  let k = 0;
  for (let i = 0; i <= 7; i++) p.push(`${(w * i) / 7 + (i > 0 && i < 7 ? r(k++) : 0) + j}px ${r(k++) + j}px`);
  for (let i = 1; i < 7; i++) p.push(`${w + r(k++) + j}px ${(h * i) / 7 + r(k++) + j}px`);
  for (let i = 7; i >= 0; i--) p.push(`${(w * i) / 7 + (i > 0 && i < 7 ? r(k++) : 0) + j}px ${h + r(k++) + j}px`);
  for (let i = 6; i >= 1; i--) p.push(`${r(k++) + j}px ${(h * i) / 7 + r(k++) + j}px`);
  return `polygon(${p.join(',')})`;
};

// uma letra de colagem. swap = quadros desde que apareceu: nos primeiros 14 ela troca de papel e de fonte (A, B, C...) e depois fixa
const Recorte: React.FC<{ch: string; seed: number; size: number; swap: number; sair?: number}> = ({ch, seed, size, swap, sair = 0}) => {
  if (swap < 0) return null;
  const v = swap < 14 ? Math.floor(swap / 3) : 99;
  const sd = seed * 7 + v * 13;
  const fam = RANSOM[Math.floor(hash(sd, 1) * RANSOM.length)];
  const [papel, tinta] = PAPEL[Math.floor(hash(sd, 2) * PAPEL.length)];
  const rot = (hash(sd, 3) - 0.5) * 14;
  const alta = hash(sd, 4) < 0.72;
  const w = size * (0.95 + hash(sd, 5) * 0.3);
  const h = size * (1.12 + hash(sd, 6) * 0.22);
  const pop = swap < 7 ? E.cam(clamp(swap / 7)) : 1;
  const j = size * 0.05;
  return (
    <div style={{display: 'inline-block', margin: `0 ${-size * 0.07}px`, transform: `translateY(${(1 - pop) * 26 + sair * 20}px) rotate(${rot}deg) scale(${0.65 + 0.35 * pop})`, opacity: pop * (1 - sair), filter: `drop-shadow(${size * 0.05}px ${size * 0.07}px ${size * 0.06}px rgba(30,18,8,0.42))`}}>
      <div style={{width: w + 2 * j, height: h + 2 * j, position: 'relative'}}>
        <div style={{position: 'absolute', inset: 0, clipPath: rasgado(w, h, size, sd), backgroundImage: `url(${staticFile(`saudade/papel/${papel}.jpg`)})`, backgroundSize: `${size * 5}px`, backgroundPosition: `${hash(sd, 8) * 100}% ${hash(sd, 9) * 100}%`}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tinta, fontFamily: fam, fontSize: size, lineHeight: 1}}>{alta ? ch.toUpperCase() : ch.toLowerCase()}</div>
      </div>
    </div>
  );
};

const PalavraColagem: React.FC<{texto: string; seed: number; size: number; f: number; inicio: number; sair?: number; passo?: number}> = ({texto, seed, size, f, inicio, sair = 0, passo = 1.5}) => (
  <div style={{whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1}}>
    {texto.split('').map((c, i) => (c === ' ' ? <span key={i} style={{display: 'inline-block', width: size * 0.8}} /> : <Recorte key={i} ch={c} seed={seed * 31 + i} size={size} swap={f - (inicio + i * passo)} sair={sair} />))}
  </div>
);

// ---------------------------------------------------------------- mídia
const FOTO = (id: string) => staticFile(`final/p/${id}.jpg`);
const VID = (id: string) => staticFile(`final/v/${id}.mp4`);

// foto -> preto e branco desbotado no começo; a cor volta entre 83 e 125 s
const graus = (t: number) => clamp((125 - t) / 42);

const Moldura: React.FC<{children: React.ReactNode; w: number; h: number; rot: number; fita?: number; polaroid?: boolean}> = ({children, w, h, rot, fita = 1, polaroid = true}) => (
  <div style={{width: w + 36, height: h + (polaroid ? 78 : 36), backgroundImage: `url(${staticFile('saudade/papel/moldura.jpg')})`, backgroundSize: 'cover', padding: 18, paddingBottom: polaroid ? 60 : 18, transform: `rotate(${rot}deg)`, boxShadow: '0 26px 50px rgba(40,25,10,0.42), 0 3px 6px rgba(40,25,10,0.3), inset 0 0 22px rgba(120,80,30,0.35)', position: 'relative', boxSizing: 'border-box'}}>
    <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', background: '#111'}}>{children}</div>
    <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('saudade/papel/vinco.jpg')})`, backgroundSize: '1700px 956px', backgroundPosition: `${hash(w, 3) * 100}% ${hash(h, 4) * 100}%`, mixBlendMode: 'soft-light', opacity: 0.75, pointerEvents: 'none'}} />
    <div style={{position: 'absolute', top: -20, left: 70, width: 150, height: 46, background: 'rgba(226,200,130,0.66)', backgroundImage: `url(${staticFile('saudade/grao.png')})`, backgroundBlendMode: 'multiply', transform: `rotate(${-7 * fita}deg)`, boxShadow: '0 1px 2px rgba(0,0,0,0.2)', clipPath: 'polygon(0 6%, 3% 0, 6% 8%, 100% 0, 97% 50%, 100% 94%, 4% 100%, 0 60%)'}} />
    <div style={{position: 'absolute', top: -18, right: 80, width: 130, height: 44, background: 'rgba(226,200,130,0.6)', backgroundImage: `url(${staticFile('saudade/grao.png')})`, backgroundBlendMode: 'multiply', transform: `rotate(${6 * fita}deg)`, boxShadow: '0 1px 2px rgba(0,0,0,0.2)', clipPath: 'polygon(0 0, 96% 6%, 100% 40%, 97% 100%, 5% 94%, 0 55%)'}} />
  </div>
);

const cabe = (iw: number, ih: number, mw: number, mh: number) => {
  const k = Math.min(mw / iw, mh / ih);
  return {w: Math.round(iw * k), h: Math.round(ih * k)};
};

const CX = [620, 1300]; // centro da foto: esquerda ou direita (a letra fica do outro lado)
const ladoDe = (idx: number) => idx % 2;

const Pagina: React.FC<{s: any; idx: number}> = ({s, idx}) => {
  const f = useCurrentFrame();
  const dur = Math.round((s.b - s.a) * FPS);
  const p = E.cam(clamp(f / PASS));
  const q = E.cam(clamp((f - dur) / PASS));
  const kb = f / (dur + PASS);
  const t = s.a + f / FPS;
  const gr = graus(t);
  const filtro = `grayscale(${gr}) sepia(${gr * 0.3}) contrast(${1 + gr * 0.05})`;
  const rot = (hash(idx, 1) - 0.5) * 3.6 + (1 - p) * 2.5 - q * 1.5;
  const x = CX[ladoDe(idx)] + (1 - p) * 150 - q * 110;
  const op = p * (1 - q);

  if (s.k === 'vazio') {
    const [iw, ih] = s.dim[0];
    const d = cabe(iw, ih, 700, 560);
    const some = clamp((t - 196.4) / 1.6);
    return (
      <AbsoluteFill style={{background: '#0d0b09', opacity: p * (1 - q)}}>
        <Img src={staticFile('saudade/papel/escuro.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 960 - (d.w + 36) / 2, top: 120, opacity: 1 - some, transform: `scale(${1 + kb * 0.03})`}}>
          <Moldura w={d.w} h={d.h} rot={-1} polaroid>
            <Img src={FOTO(s.ids[0])} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `grayscale(1) brightness(0.78) contrast(1.05)`}} />
          </Moldura>
        </div>
      </AbsoluteFill>
    );
  }

  let corpo: React.ReactNode;
  let bw = 0;
  let bh = 0;
  if (s.k === 'foto') {
    const [iw, ih] = s.dim[0];
    const d = cabe(iw, ih, 960, 790);
    bw = d.w; bh = d.h;
    corpo = (
      <Moldura w={d.w} h={d.h} rot={rot}>
        <Img src={FOTO(s.ids[0])} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro, transform: `scale(${1 + kb * 0.07})`}} />
      </Moldura>
    );
  } else if (s.k === 'dupla') {
    const a = cabe(s.dim[0][0], s.dim[0][1], 470, 740);
    const b = cabe(s.dim[1][0], s.dim[1][1], 470, 740);
    corpo = (
      <div style={{display: 'flex', gap: 26, alignItems: 'center'}}>
        <Moldura w={a.w} h={a.h} rot={rot - 1.5}>
          <Img src={FOTO(s.ids[0])} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro, transform: `scale(${1 + kb * 0.06})`}} />
        </Moldura>
        <div style={{marginTop: 70}}>
          <Moldura w={b.w} h={b.h} rot={rot + 2} fita={-1}>
            <Img src={FOTO(s.ids[1])} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro, transform: `scale(${1 + kb * 0.06})`}} />
          </Moldura>
        </div>
      </div>
    );
  } else {
    const d = cabe(s.w, s.h, 1000, 720);
    bw = d.w; bh = d.h;
    const L = (s.b - s.a) + (2 * PASS) / FPS;
    const taxa = clamp((s.vdur - s.ini - 0.25) / L, 0.3, 0.7);
    corpo = (
      <Moldura w={d.w} h={d.h} rot={rot * 0.6}>
        <OffthreadVideo src={VID(s.ids[0])} muted startFrom={Math.round(s.ini * FPS)} playbackRate={taxa} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro}} />
      </Moldura>
    );
  }
  return (
    <AbsoluteFill style={{opacity: op}}>
      <Img src={FUNDOS[idx % FUNDOS.length]} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scaleX(${idx % 2 ? -1 : 1}) scale(${1.03 + kb * 0.03})`}} />
      <div style={{position: 'absolute', left: x, top: 540, transform: 'translate(-50%, -50%)'}}>
        {corpo}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- letra
const slideEm = (t: number) => {
  const sl: any[] = plano.slides as any[];
  let k = -1;
  for (let i = 0; i < sl.length; i++) if (t >= sl[i].a) k = i;
  return k;
};
// centro da letra: do lado oposto à foto da página atual, deslizando junto com a passagem
const centroLetra = (t: number) => {
  const k = Math.max(0, slideEm(t));
  const sl: any[] = plano.slides as any[];
  const alvo = (i: number) => (sl[i]?.k === 'vazio' ? 960 : [1500, 440][ladoDe(i)]);
  const p = E.cam(clamp(((t - sl[k].a) * FPS) / PASS));
  return lerp(k > 0 ? alvo(k - 1) : alvo(k), alvo(k), p);
};
// a letra some um instante enquanto a página troca de lado (evita cruzar a foto)
const claroNaTroca = (t: number) => {
  const k = Math.max(0, slideEm(t));
  const sl: any[] = plano.slides as any[];
  const p = clamp(((t - sl[k].a) * FPS) / PASS);
  const trocou = k > 0 && [1500, 440][ladoDe(k)] !== [1500, 440][ladoDe(k - 1)] && sl[k].k !== 'vazio' && sl[k - 1].k !== 'vazio';
  return trocou ? 1 - 0.95 * Math.sin(Math.PI * p) : 1;
};

const Letra: React.FC<{c: any; i: number; t: number; f: number}> = ({c, i, t, f}) => {
  const fa = c.a * FPS;
  const fb = c.b * FPS;
  const ex = clamp((f - (fb - 18)) / 18);
  const cx = c.estilo === 'vazio' ? 960 : centroLetra(t);
  const troca = c.estilo === 'vazio' ? 1 : claroNaTroca(t);
  const palavras: string[] = c.t;
  const maxLen = Math.max(...palavras.map((w) => w.length));
  if (c.estilo === 'colagem') {
    const size = Math.max(68, Math.min(150, 740 / (maxLen * 1.02)));
    return (
      <div style={{position: 'absolute', left: cx, top: 540, transform: 'translate(-50%, -50%)', opacity: (1 - ex * 0.9) * troca, filter: `grayscale(${ex}) blur(${ex * 2}px)`, display: 'flex', flexDirection: 'column', gap: size * 0.18, alignItems: 'center'}}>
        {palavras.map((w, k) => (
          <PalavraColagem key={k} texto={w} seed={i * 11 + k} size={size} f={f} inicio={(c.ts[k] - 0.04) * FPS} sair={ex} />
        ))}
      </div>
    );
  }
  const base: React.CSSProperties =
    c.estilo === 'serif'
      ? {fontFamily: 'S_Play', fontStyle: 'italic', fontSize: 98, color: '#2a2017', lineHeight: 1.12}
      : c.estilo === 'limpa'
        ? {fontFamily: 'S_Inter', fontWeight: 600, fontSize: 88, color: '#1f2a44', letterSpacing: -2, lineHeight: 1.1}
        : {fontFamily: 'S_Play', fontStyle: 'italic', fontSize: 120, color: '#ece2cc', lineHeight: 1.1};
  const y = c.estilo === 'vazio' ? 935 : 540;
  return (
    <div style={{position: 'absolute', left: cx, top: y, width: c.estilo === 'vazio' ? 1500 : 720, transform: 'translate(-50%, -50%)', textAlign: 'center', ...base, mixBlendMode: c.estilo === 'vazio' ? 'normal' : 'multiply', opacity: (1 - ex * 0.85) * troca, filter: `blur(${ex * 3}px)`}}>
      {palavras.map((w, k) => {
        const e = E.cam(clamp((f - (c.ts[k] - 0.05) * FPS) / 10));
        return (
          <span key={k} style={{display: 'inline-block', marginRight: '0.28em', opacity: e, transform: `translateY(${(1 - e) * 16}px)`}}>{w}</span>
        );
      })}
    </div>
  );
};

const Era: React.FC<{texto: string; a: number}> = ({texto, a}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const e = clamp((t - a) / 1.4);
  const s = clamp((t - (a + 4.6)) / 1.2);
  if (t < a || t > a + 6) return null;
  return (
    <div style={{position: 'absolute', left: 80, bottom: 56, fontFamily: 'S_Caveat', fontSize: 66, color: '#5a4630', transform: 'rotate(-3deg)', clipPath: `inset(0 ${100 * (1 - e)}% 0 0)`, opacity: 1 - s, whiteSpace: 'nowrap'}}>{texto}</div>
  );
};

// ---------------------------------------------------------------- composição
// álbum 3D: abre de 2,8 a 8,0 s (câmera desce até ficar de cima, igual à página 2D); fecha de 257 a 263 s
const T_ABRE = 2.8;
const T_ABERTO = 8.0;
const T_3D_FIM = 9.3;
const T_3D_VOLTA = 255.0;
const T_FECHA = 257.0;
const T_FECHOU = 263.0;

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const pose = (k: number, a: number[], b: number[]) => ({px: mix(a[0], b[0], k), py: mix(a[1], b[1], k), pz: mix(a[2], b[2], k), lx: mix(a[3], b[3], k), ly: mix(a[4], b[4], k), lz: mix(a[5], b[5], k)});
const TOPO = [ALBUM.W / 2, ALBUM.BT + DIST_TOPO, 0, ALBUM.W / 2, ALBUM.BT, 0];
const FECHADO = (t: number) => [1.7, 3.9 - (t < 10 ? t * 0.05 : 0), 2.7 - (t < 10 ? t * 0.03 : 0), 1.65, 0.1, 0.1];

export const Saudade: React.FC = () => {
  carregaFontes();
  const f = useCurrentFrame();
  const t = f / FPS;
  const slides: any[] = plano.slides as any[];

  // abertura
  const angAbre = Math.PI * E.cam(clamp((t - T_ABRE) / (T_ABERTO - T_ABRE)));
  const camAbre = pose(E.cam(clamp((t - 4.0) / 4.8)), FECHADO(t), TOPO);
  const opAbre = t < T_3D_FIM ? 1 - clamp((t - 8.7) / 0.6) : 0;
  // fecho
  const angFecha = Math.PI * (1 - E.cam(clamp((t - T_FECHA) / (T_FECHOU - T_FECHA))));
  const camFecha = pose(E.cam(clamp((t - 257.4) / 6.4)), TOPO, [1.7, 4.0, 2.6, 1.65, 0.1, 0.1]);
  const opFecha = clamp((t - T_3D_VOLTA) / 0.8);
  const veuSaudade = clamp((t - 224.0) / 1.2) * (1 - clamp((t - 231.6) / 1.4));
  const preto = t < 0.8 ? 1 - clamp(t / 0.8) : clamp((t - 268.6) / 1.2);

  return (
    <AbsoluteFill style={{background: '#e5dac3'}}>
      <Audio src={staticFile('saudade/bem.mp3')} volume={(fr) => Math.min(1, fr / 45, (DUR_SAUDADE - fr) / 50)} />
      {/* papel de álbum */}
      <Img src={FUNDOS[0]} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      {slides.map((s, i) => (
        <Sequence key={i} from={Math.round(s.a * FPS)} durationInFrames={Math.round((s.b - s.a) * FPS) + PASS} layout="none">
          <Pagina s={s} idx={i} />
        </Sequence>
      ))}
      {(plano.eras as any[]).map((e, i) => <Era key={i} texto={e.t} a={e.a} />)}
      <Img src={FUNDOS[1]} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.93 * veuSaudade}} />
      {(plano.letras as any[]).map((c, i) =>
        t >= c.a - 0.1 && t <= c.b + 0.1 ? <Letra key={i} c={c} i={i} t={t} f={f} /> : null,
      )}
      {(plano.destaques as any[]).map((d, i) =>
        t >= d.a - 0.1 && t <= d.b + 0.1 ? (
          <div key={i} style={{position: 'absolute', left: 960, top: 540, transform: 'translate(-50%, -50%)', opacity: 1 - clamp((t - (d.b - 1.4)) / 1.4)}}>
            <PalavraColagem texto={d.t} seed={77} size={200} f={f} inicio={d.a * FPS} passo={5} />
          </div>
        ) : null,
      )}
      {/* álbum 3D: abertura e fecho */}
      {t < T_3D_FIM ? (
        <AbsoluteFill style={{opacity: opAbre}}>
          <Album3D f={f} ang={angAbre} cam={camAbre} linhas={[{t: 'aula da', size: 135, ini: 36, passo: 4}, {t: 'saudade', size: 190, ini: 78, passo: 4}]} />
        </AbsoluteFill>
      ) : null}
      {t >= T_3D_VOLTA ? (
        <AbsoluteFill style={{opacity: opFecha}}>
          <Album3D f={f} ang={angFecha} cam={camFecha} usaUltima linhas={[{t: '231 e 232', size: 175, ini: Math.round(262.4 * FPS), passo: 4}]} sub="La Salle Sobradinho · 2026" subA={Math.round(265.4 * FPS)} />
        </AbsoluteFill>
      ) : null}
      {/* grão de filme e vinheta sobre tudo */}
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('saudade/grao.png')})`, backgroundSize: 512, backgroundPosition: `${hash(f, 1) * 512}px ${hash(f, 2) * 512}px`, mixBlendMode: 'overlay', opacity: 0.55, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(70,38,12,0.5) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#0d0b09', opacity: preto, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
