// v3 (15/10/2026): + a proposta (P01-P17) depois da K21; K22 saiu, K23 fecha.
// Vídeo de venda MedicMais v2 (9:16): site + Google Meu Negócio (plaquinha NFC). 23 cenas presas às palavras
// da locução da Ana Dias (cues.json, gerado por cues.py). Marca citada = logo real na tela (motion-base/logos).
// Base: as 16 cenas aprovadas da v1 (v1-backup/), mais Instagram real, Google, Meu Negócio, plaquinha 3D, estrelas e o sistema.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import cues from './cues.json';
import {approach, arrive, clamp, E, entra, lerp, prog, pulse, spring, tween} from './kit';
import {IC} from './icons';
import {Plaquinha3D} from './Plaquinha3D';

const C = {red: '#EB2026', ink: '#121216', gray: '#E6E8EC', mid: '#A1A1A9', soft: '#F4F5F7', t2: '#55565e', wa: '#25D366', panel: '#1d1d23', star: '#FBBC04'};
const EV = cues.ev as Record<string, number>;
const INI = cues.ini as Record<string, number>;
const KEYS = Object.keys(INI);
const fim = (k: string) => {
  const i = KEYS.indexOf(k);
  return i < KEYS.length - 1 ? INI[KEYS[i + 1]] : cues.dur;
};

const FONTS = `
@font-face{font-family:P;font-weight:400;src:url(${staticFile('fontes/pxiEyp8kv8JHgFVrFJA.ttf')})}
@font-face{font-family:P;font-weight:500;src:url(${staticFile('fontes/pxiByp8kv8JHgFVrLGT9V1s.ttf')})}
@font-face{font-family:P;font-weight:600;src:url(${staticFile('fontes/pxiByp8kv8JHgFVrLEj6V1s.ttf')})}
@font-face{font-family:P;font-weight:700;src:url(${staticFile('fontes/pxiByp8kv8JHgFVrLCz7V1s.ttf')})}
@font-face{font-family:P;font-weight:800;src:url(${staticFile('fontes/pxiByp8kv8JHgFVrLDD4V1s.ttf')})}`;

// ---------------------------------------------------------------- peças
const abs = (s: React.CSSProperties): React.CSSProperties => ({position: 'absolute', ...s});

const Plus: React.FC<{size: number; style?: React.CSSProperties; label?: string; inv?: boolean}> = ({size, style, label = '+', inv}) => (
  <span
    style={{
      display: 'inline-grid', placeItems: 'center', width: size, height: size, borderRadius: size * 0.28, flex: 'none',
      background: inv ? '#fff' : C.red, color: inv ? C.red : '#fff', fontWeight: 700, fontSize: size * (label === '+' ? 0.68 : 0.55), lineHeight: 1, ...style,
    }}
  >
    {label}
  </span>
);

// título em caixa alta; `l2` é a linha vermelha
const H: React.FC<{top: number; size: number; l1: React.ReactNode; l2?: React.ReactNode; f: number; s1: number; s2?: number; color?: string; center?: boolean}> = ({
  top, size, l1, l2, f, s1, s2, color = C.ink, center,
}) => (
  <div style={abs({left: 84, right: 84, top, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04, fontSize: size, color, textAlign: center ? 'center' : 'left'})}>
    <div style={entra(f, s1, 50)}>{l1}</div>
    {l2 !== undefined && <div style={{color: C.red, ...entra(f, s2 ?? s1 + 4, 50)}}>{l2}</div>}
  </div>
);

const OFF = {hero: 0, odonto: 1168, facts: 1669, medicina: 1978, sday: 2502, depo: 3450, contato: 4263};
const PAGE_H = 5581;

// celular com o print REAL do site; `y` = rolagem da página em px CSS do celular (390 de largura)
const Phone: React.FC<{x: number; y: number; w: number; scroll: number; bar?: boolean; press?: number; img?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  x, y, w, scroll, bar = true, press = 0, img, children, style,
}) => {
  const inner = w - 36;
  const s = inner / 390;
  const h = Math.round((w * 844) / 390);
  return (
    <div style={abs({left: x, top: y, width: w, height: h, background: C.ink, borderRadius: 84 * (w / 680), padding: 18, boxShadow: '0 40px 80px rgba(18,18,22,.22)', ...style})}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 68 * (w / 680), overflow: 'hidden', background: '#fff'}}>
        {img ? (
          <Img src={staticFile(img)} style={abs({left: 0, top: -scroll * s, width: inner})} />
        ) : (
          <>
            <Img src={staticFile('site/celular-pagina.png')} style={abs({left: 0, top: -scroll * s, width: inner, height: PAGE_H * s})} />
            <Img src={staticFile('site/celular-top.png')} style={abs({left: 0, top: 0, width: '100%', zIndex: 2})} />
          </>
        )}
        {bar && !img && (
          <div style={abs({left: 0, bottom: 0, width: '100%', zIndex: 2})}>
            <Img src={staticFile('site/celular-bar.png')} style={{display: 'block', width: '100%'}} />
            {press > 0 && <div style={abs({left: 216 * s, top: 10 * s, width: 166 * s, height: 50 * s, borderRadius: 999, background: `rgba(18,18,22,${0.18 * press})`})} />}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

const Laptop: React.FC<{x: number; y: number; w: number; style?: React.CSSProperties}> = ({x, y, w, style}) => (
  <div style={abs({left: x, top: y, width: w, ...style})}>
    <div style={{background: C.ink, borderRadius: '36px 36px 0 0', padding: '18px 18px 22px'}}>
      <Img src={staticFile('site/desktop-dobra.png')} style={{display: 'block', width: '100%', height: (w - 36) * (900 / 1440), objectFit: 'cover', objectPosition: '0 0', borderRadius: 10}} />
    </div>
    <div style={{height: 30, background: '#2a2a31', borderRadius: '0 0 30px 30px', margin: '0 -50px', boxShadow: '0 30px 60px rgba(18,18,22,.25)'}} />
  </div>
);

const Card: React.FC<{x: number; y: number; w: number; h: number; src: string; video?: boolean; pos?: string; style?: React.CSSProperties; r?: number}> = ({
  x, y, w, h, src, video, pos = '50% 0', style, r = 48,
}) => (
  <div style={abs({left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden', background: '#ddd', boxShadow: '0 30px 60px rgba(18,18,22,.18)', ...style})}>
    {video ? (
      <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
    ) : (
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
    )}
  </div>
);

const LUPA = (
  <svg viewBox="0 0 24 24" width={46} height={46} fill="none" stroke="#4285F4" strokeWidth={2.6} strokeLinecap="round" style={{flex: 'none'}}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </svg>
);
const WA_PATH =
  'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.25.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.45-.15-1-.33-1.75-.65-3.1-1.3-5.1-4.4-5.25-4.6-.15-.2-1.25-1.65-1.25-3.15s.8-2.25 1.07-2.55c.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.5.25.6.85 2.07.92 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.05 1.13 1 2.09 1.32 2.39 1.47.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.08.12.08.72-.17 1.42z';

// logos reais (public/logos, de motion-base/logos) e ícones Phosphor
const LOGO = {
  google: ['logos/google.svg', 272 / 92], g: ['logos/google-g.svg', 1], maps: ['logos/google-maps.svg', 92.3 / 132.3], ig: ['logos/instagram-icone.svg', 1],
  igEscrita: ['logos/instagram-escrita.svg', 1024 / 291], wa: ['logos/whatsapp.svg', 1], gmn: ['logos/google-meu-negocio.png', 1],
} as const;
const Logo: React.FC<{k: keyof typeof LOGO; h: number; style?: React.CSSProperties}> = ({k, h, style}) => (
  <Img src={staticFile(LOGO[k][0])} style={{height: h, width: h * LOGO[k][1], flex: 'none', display: 'block', ...style}} />
);
const Ic: React.FC<{k: string; size: number; color?: string; style?: React.CSSProperties}> = ({k, size, color = C.ink, style}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{flex: 'none', display: 'block', ...style}}>
    <path d={IC[k]} fill={color} />
  </svg>
);
const STAR_D = 'M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z';
const Star: React.FC<{size: number; on: number; dark?: boolean; style?: React.CSSProperties}> = ({size, on, dark, style}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{flex: 'none', display: 'block', overflow: 'visible', ...style}}>
    <path d={STAR_D} fill="none" stroke={dark ? '#4a4b53' : '#C4C7CC'} strokeWidth={12} />
    <path d={STAR_D} fill={C.star} style={{transformOrigin: '128px 128px', transform: `scale(${on})`}} />
  </svg>
);

// barra de busca do Google: "G" real à esquerda, digitação (2 quadros por letra) e cursor vermelho
const Search: React.FC<{f: number; start: number; text: string; top: number; h?: number; fs?: number; style?: React.CSSProperties}> = ({f, start, text, top, h = 150, fs = 46, style}) => {
  const n = clamp(Math.floor((f - start) / 2), 0, text.length);
  const blink = n < text.length || Math.floor(f / 15) % 2 === 0;
  return (
    <div style={abs({left: 84, right: 84, top, height: h, background: '#fff', border: `3px solid ${C.gray}`, borderRadius: 999, display: 'flex', alignItems: 'center', gap: 30, padding: '0 54px', fontSize: fs, fontWeight: 500, boxShadow: '0 12px 30px rgba(18,18,22,.06)', ...style})}>
      <Logo k="g" h={fs * 1.15} />
      <span style={{whiteSpace: 'nowrap', flex: 1}}>
        {text.slice(0, n)}
        <i style={{display: 'inline-block', width: 5, height: fs * 1.25, background: C.red, marginLeft: 4, verticalAlign: 'middle', opacity: blink ? 1 : 0}} />
      </span>
      {LUPA}
    </div>
  );
};

const Tag: React.FC<{n: string; t: string; f: number}> = ({n, t, f}) => (
  <div style={abs({left: 84, top: 200, display: 'flex', alignItems: 'center', gap: 20, fontSize: 34, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.red, ...entra(f, 0, 30)})}>
    <Plus size={72} label={n} style={{letterSpacing: 0, transform: `scale(${0.6 + 0.4 * spring(f, 0, 0.4, 0.6)})`}} />
    {t}
  </div>
);

// fundo da cena + leve aproximação contínua (nada fica parado)
const Stage: React.FC<{bg: string; f: number; len: number; children: React.ReactNode; color?: string}> = ({bg, f, len, children, color = C.ink}) => (
  <AbsoluteFill style={{background: bg, color, fontFamily: 'P', overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${1 + 0.04 * prog(f, 0, len)})`, transformOrigin: '50% 45%'}}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- cenas
type SP = {f: number; len: number; e: (k: string) => number};

const K01: React.FC<SP> = ({f, len, e}) => (
  <Stage bg={C.soft} f={f} len={len}>
    <div style={abs({left: 84, top: 170, display: 'flex', alignItems: 'center', gap: 22, fontWeight: 600, fontSize: 38, color: C.red})}>
      <Plus size={62} />
      Para a MedicMais Sobradinho
    </div>
    <div style={abs({left: 84, right: 84, top: 270, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04, fontSize: 104})}>
      <div>O site de vocês</div>
      <div style={{color: C.red, transformOrigin: '0 50%', transform: `scale(${1 + 0.05 * pulse(f, e('pronto') - 2, 16)})`}}>já está pronto.</div>
    </div>
    <Phone x={200} y={tween(f, 10, 90, 640, 600, E.expr)} w={680} scroll={tween(f, 40, 70, 0, 150, E.expr)} />
  </Stage>
);

const K02: React.FC<SP> = ({f, len, e}) => {
  const q = e('quinhentos');
  const n = Math.round(550 * E.expr(prog(f, q - 4, 20)));
  const out = tween(f, q - 20, 10, 0, 1, E.exit);
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Card x={60} y={150} w={960} h={1020} src="clips/corredor.mp4" video style={entra(f, 0, 80, 0.14)} />
      <div style={abs({left: 84, right: 84, top: 1230, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04, fontSize: 84, opacity: 1 - out, transform: `translateY(${-60 * out}px)`})}>
        <div style={entra(f, 8, 40)}>O que muita clínica</div>
        <div style={{color: C.red, ...entra(f, 30, 40)}}>queria ter:</div>
      </div>
      {f >= q - 8 && (
        <>
          <div style={abs({left: 84, top: 1230, fontSize: 250, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', ...entra(f, q - 8, 60)})}>{n} m²</div>
          <div style={abs({left: 84, right: 84, top: 1500, fontSize: 40, lineHeight: 1.35, color: C.t2, ...entra(f, e('quadrados'), 30)})}>de estrutura, na Quadra 7/9 de Sobradinho</div>
        </>
      )}
    </Stage>
  );
};

const K03: React.FC<SP> = ({f, len, e}) => {
  const d = e('dentista');
  const a1 = arrive(f, 0, 0.17);
  const a2 = arrive(f, d - 8, 0.17);
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <div style={abs({left: 60, top: 420, transform: `translateX(${(1 - a1) * -560}px)`, opacity: clamp(a1 * 2)})}>
        <Card x={0} y={0} w={465} h={540} src="clips/medico.mp4" video />
        <div style={abs({left: 0, top: 580, width: 465, textAlign: 'center', fontSize: 44, fontWeight: 700})}>Médico</div>
      </div>
      <div style={abs({left: 555, top: 420, transform: `translateX(${(1 - a2) * 560}px)`, opacity: clamp(a2 * 2)})}>
        <Card x={0} y={0} w={465} h={540} src="clips/dentista.mp4" video pos="30% 0" />
        <div style={abs({left: 0, top: 580, width: 465, textAlign: 'center', fontSize: 44, fontWeight: 700})}>Dentista</div>
      </div>
      <Plus size={150} style={abs({left: 465, top: 615, boxShadow: `0 0 0 14px ${C.soft}`, transform: `scale(${spring(f, d + 2, 0.4, 0.6)})`})} />
      <H top={1160} size={120} f={f} s1={d} s2={d + 5} l1="no mesmo" l2="lugar" center />
    </Stage>
  );
};

const CHIPS = ['Médico', 'Dentista', 'Aferição de pressão', 'Glicemia', 'Saturação', 'Acupuntura'];
const K04: React.FC<SP> = ({f, len, e}) => {
  const t = e('trinta');
  const n = Math.round(30 * E.expr(prog(f, 3, t + 8 - 3)));
  return (
    <Stage bg={C.red} color="#fff" f={f} len={len}>
      <div style={abs({right: -60, bottom: -260, fontSize: 1300, fontWeight: 800, lineHeight: 1, color: 'rgba(255,255,255,.10)', transform: `rotate(${f * 0.12}deg)`})}>+</div>
      <div style={abs({left: 84, top: 300, fontSize: 34, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.9, ...entra(f, 0, 30)})}>#SaúdeDay</div>
      <div style={abs({left: 84, top: 380, fontSize: 380, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', ...entra(f, 0, 70)})}>{n}+</div>
      <div style={abs({left: 84, right: 84, top: 770, fontSize: 92, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04})}>
        {['edições de', 'atendimento', 'gratuito'].map((l, i) => (
          <div key={i} style={entra(f, t + 2 + i * 3, 40)}>{l}</div>
        ))}
      </div>
      <div style={abs({left: 84, right: 84, top: 1180, display: 'flex', flexWrap: 'wrap', gap: 20})}>
        {CHIPS.map((c, i) => (
          <span key={c} style={{background: '#fff', color: C.ink, padding: '18px 34px', fontSize: 34, fontWeight: 500, borderRadius: 999, whiteSpace: 'nowrap', ...entra(f, e('saudeday') - 12 + i * 3, 30, 0.2)}}>{c}</span>
        ))}
      </div>
    </Stage>
  );
};

// K05: o Instagram REAL da clínica (print do perfil); no "espalhado" os posts saem do feed e se espalham
const POSTS = ['ig-post-1.jpg', 'tour-4.jpg', 'ig-post-2.jpg', 'ana-10.jpg', 'ig-post-3.jpg', 'tour-25.7.jpg', 'maria-10.jpg', 'tour-32.jpg', 'familia-10.jpg'];
const ALVO: [number, number, number][] = [
  [30, 540, -9], [830, 560, 7], [10, 830, 5], [850, 850, -6], [30, 1120, -4], [840, 1140, 8], [60, 1410, 6], [810, 1430, -7], [440, 1440, 3],
];
const K05: React.FC<SP> = ({f, len, e}) => {
  const sp = e('espalhado');
  const pw = 520, px = 280, py = approach(f, 0, 1100, 520, 0.15);
  const s1 = (pw - 36) / 738;
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <H top={170} size={88} f={f} s1={0} s2={sp - 4} l1="Na internet, hoje," l2="tudo espalhado num feed." color="#fff" />
      <Phone x={px} y={py} w={pw} scroll={tween(f, 8, 40, 0, 40, E.expr)} img="img/ig-perfil.png" />
      {/* selo do Instagram (logo real) */}
      <div style={abs({left: 540, top: 1690, transform: `translateX(-50%) ${entra(f, 6, 40, 0.18).transform}`, opacity: entra(f, 6).opacity, display: 'flex', alignItems: 'center', gap: 22, background: '#fff', padding: '18px 40px 18px 22px', borderRadius: 999})}>
        <Logo k="ig" h={76} />
        <Logo k="igEscrita" h={58} />
      </div>
      {POSTS.map((im, i) => {
        // nasce na grade do print (3 colunas) e voa para fora
        const c = i % 3, r = Math.floor(i / 3);
        const x0 = px + 18 + (c * 247 + 4) * s1, y0 = py + 18 + (1001 + Math.min(r, 1) * 330) * s1;
        const a = spring(f, sp - 2 + i * 2, 0.22, 0.7);
        const [tx, ty, rot] = ALVO[i];
        const w = lerp(243 * s1, 220, clamp(a));
        return (
          f >= sp - 2 + i * 2 && (
            <div key={i} style={abs({left: lerp(x0, tx, a), top: lerp(y0, ty, a), width: w, height: w, transform: `rotate(${rot * a}deg)`, borderRadius: 26, overflow: 'hidden', boxShadow: '0 24px 50px rgba(0,0,0,.35)', border: '6px solid #fff', zIndex: 3})}>
              <Img src={staticFile(`img/${im}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          )
        );
      })}
    </Stage>
  );
};

const K06: React.FC<SP> = ({f, len, e}) => {
  const items = [
    ['Implante dentário', e('implante')],
    ['Prótese fixa (protocolo)', e('protese')],
    ['Lentes de contato dental', e('lentes')],
  ] as const;
  const g = e('google0');
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <H top={200} size={92} f={f} s1={0} s2={e('pesquisa') - 3} l1="Tratamento caro" l2="se pesquisa antes." />
      <div style={abs({left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', ...entra(f, 2, 40)})}>
        <Logo k="google" h={120} style={{transform: `scale(${1 + 0.08 * pulse(f, g - 2, 16)})`}} />
      </div>
      <div style={entra(f, 4, 60)}>
        <Search f={f} start={10} text="implante dentário sobradinho" top={810} fs={40} />
      </div>
      <div style={abs({left: 84, right: 84, top: 1050, display: 'flex', flexDirection: 'column', gap: 26})}>
        {items.map(([t, s]) => (
          <span key={t} style={{alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 18, background: '#fff', border: `3px solid ${C.gray}`, padding: '24px 40px', fontSize: 42, fontWeight: 600, borderRadius: 999, whiteSpace: 'nowrap', ...entra(f, s - 4, 40, 0.18)}}>
            <Plus size={56} />
            {t}
          </span>
        ))}
      </div>
    </Stage>
  );
};

const RES = [
  ['Catálogo de médicos', 'lista de clínicas da região', 'catalogos'],
  ['Outra clínica', 'Sobradinho-DF', 'outras'],
  ['Plataforma de agendamento', 'especialistas em Sobradinho', 'outras'],
] as const;
const K07: React.FC<SP> = ({f, len, e}) => {
  const vazio = e('outras') - 6;
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <div style={abs({left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', ...entra(f, 0, 30)})}>
        <Logo k="google" h={80} />
      </div>
      <div style={entra(f, 0, 50)}>
        <Search f={f} start={e('buscando') - 2} text="medicmais sobradinho" top={280} />
      </div>
      <div style={abs({left: 84, right: 84, top: 500, display: 'flex', flexDirection: 'column', gap: 28})}>
        {RES.map(([a, b, k], i) => (
          <div key={a} style={{background: '#fff', border: `3px solid ${C.gray}`, borderRadius: 36, padding: '34px 44px', fontSize: 42, fontWeight: 600, color: C.t2, ...entra(f, e(k) - 4 + (i === 2 ? 8 : 0), 50, 0.18)}}>
            {a}
            <div style={{fontSize: 30, fontWeight: 400, color: C.mid, marginTop: 6}}>{b}</div>
          </div>
        ))}
        <div
          style={{
            border: `6px dashed ${C.red}`, borderRadius: 36, padding: '40px 44px', fontSize: 46, fontWeight: 700, color: C.red, display: 'flex', alignItems: 'center', gap: 24,
            ...entra(f, vazio, 50, 0.16), transform: `${entra(f, vazio, 50, 0.16).transform} translateX(${12 * Math.sin((f - vazio) * 0.9) * pulse(f, vazio + 8, 16)}px)`,
          }}
        >
          <Plus size={64} />
          MedicMais: sem site próprio
        </div>
      </div>
    </Stage>
  );
};

const K08: React.FC<SP> = ({f, len, e}) => {
  const k = 16;
  const b23 = E.expr(prog(f, e('em2023') + 6, 26));
  const b22 = E.expr(prog(f, e('treze') - 10, 22));
  const bar = (left: number, v: number, p: number, cor: string, lab: string, txt: string) => (
    <>
      <div style={abs({left, bottom: 470, width: 300, height: v * k * p, background: cor, borderRadius: '36px 36px 0 0'})} />
      <div style={abs({left, width: 300, bottom: 470 + v * k * p + 20, textAlign: 'center', fontSize: 90, fontWeight: 800, color: txt, opacity: clamp(p * 3), fontVariantNumeric: 'tabular-nums'})}>{Math.round(v * p)}%</div>
      <div style={abs({left, width: 300, bottom: 390, textAlign: 'center', fontSize: 40, fontWeight: 600, opacity: clamp(p * 3)})}>{lab}</div>
    </>
  );
  return (
    <Stage bg="#fff" f={f} len={len}>
      <H top={220} size={100} f={f} s1={e('terco') - 4} s2={e('agendava') - 4} l1="1 em cada 3" l2="já agenda online." />
      <div style={abs({left: 84, right: 84, top: 620, fontSize: 40, lineHeight: 1.35, color: C.t2, ...entra(f, 10, 30)})}>estabelecimentos de saúde no Brasil com agendamento pela internet</div>
      <div style={abs({left: 84, right: 84, bottom: 466, height: 4, background: C.ink, transformOrigin: '0 50%', transform: `scaleX(${E.expr(prog(f, 6, 24))})`})} />
      {bar(150, 13, b22, C.gray, '2022', C.mid)}
      {bar(600, 34, b23, C.red, '2023', C.red)}
      <div style={abs({left: 84, bottom: 300, fontSize: 24, color: C.mid, fontWeight: 500, letterSpacing: '.01em', ...entra(f, 24, 20)})}>Fonte: TIC Saúde 2023, Cetic.br/NIC.br</div>
    </Stage>
  );
};

// K09: "não é só um site": a MedicMais no centro, as marcas onde o paciente está em volta
const ORBITA = [
  ['g', -45, 'colocar'],
  ['ig', 45, 'medicmais'],
  ['maps', -135, 'certo'],
  ['wa', 135, 'internet2'],
] as const;
const K09: React.FC<SP> = ({f, len, e}) => {
  const co = e('colocar');
  const cx = 540, cy = 1130, R = 330;
  const centro = spring(f, co - 6, 0.3, 0.65);
  const evs: Record<string, number> = {colocar: co + 4, medicmais: co + 10, certo: e('certo') - 4, internet2: e('internet2') - 4};
  return (
    <Stage bg="#fff" f={f} len={len}>
      <div style={abs({left: 84, right: 84, top: 200, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04, fontSize: 110})}>
        <div style={entra(f, 0, 50)}>Não é só</div>
        <div style={{display: 'inline-block', position: 'relative', ...entra(f, e('so') - 4, 50)}}>
          um site.
          <div style={abs({left: -6, right: -6, top: '52%', height: 12, background: C.red, borderRadius: 6, transformOrigin: '0 50%', transform: `scaleX(${E.expr(prog(f, e('site0') + 2, 12))})`})} />
        </div>
      </div>
      <div style={abs({left: 84, right: 84, top: 470, fontSize: 52, fontWeight: 700, color: C.red, ...entra(f, co - 4, 30)})}>É o lugar certo na internet.</div>
      <svg style={abs({left: 0, top: 0})} width={1080} height={1920}>
        {ORBITA.map(([k, ang, ev]) => {
          const a = (ang * Math.PI) / 180;
          const p = E.expr(prog(f, evs[ev], 14));
          return <line key={k} x1={cx} y1={cy} x2={cx + Math.sin(a) * R * p} y2={cy - Math.cos(a) * R * p} stroke={C.red} strokeWidth={6} strokeLinecap="round" strokeDasharray="2 16" />;
        })}
      </svg>
      {ORBITA.map(([k, ang, ev]) => {
        const a = (ang * Math.PI) / 180;
        const s = spring(f, evs[ev] + 6, 0.35, 0.6);
        return (
          <div key={k} style={abs({left: cx + Math.sin(a) * R - 95, top: cy - Math.cos(a) * R - 95, width: 190, height: 190, borderRadius: 54, background: '#fff', border: `3px solid ${C.gray}`, display: 'grid', placeItems: 'center', boxShadow: '0 20px 40px rgba(18,18,22,.10)', transform: `scale(${s})`})}>
            <Logo k={k} h={k === 'maps' ? 112 : 104} />
          </div>
        );
      })}
      <div style={abs({left: cx - 130, top: cy - 130, transform: `scale(${centro * (1 + 0.06 * pulse(f, e('certo') - 2, 16))})`})}>
        <Plus size={260} style={{boxShadow: '0 30px 60px rgba(235,32,38,.25)'}} />
      </div>
      <div style={abs({left: 0, right: 0, top: cy + 360, textAlign: 'center', fontSize: 46, fontWeight: 800, ...entra(f, co + 2, 30)})}>MedicMais Sobradinho</div>
      {/* antes: o site sozinho (o que se imagina comprar), que vira a peça central */}
      {f < co + 8 && (
        <div style={{opacity: 1 - prog(f, co - 4, 10), transform: `scale(${1 - 0.6 * E.exit(prog(f, co - 8, 14))})`, transformOrigin: `${cx}px ${cy}px`}}>
          <div style={entra(f, 4, 80, 0.14)}>
            <Phone x={cx - 210} y={cy - 440} w={420} scroll={tween(f, 6, 80, 0, 400, E.cam)} />
          </div>
        </div>
      )}
    </Stage>
  );
};

// K10: as duas partes da oferta: site + Google Meu Negócio
const K10: React.FC<SP> = ({f, len, e}) => {
  const c1 = e('duas') - 2, c2 = e('gmn1') - 6;
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <H top={200} size={120} f={f} s1={0} s2={e('partes') - 4} l1="Duas" l2="partes." />
      <div style={abs({left: 84, top: 560, width: 430, height: 920, background: '#fff', borderRadius: 48, overflow: 'hidden', boxShadow: '0 30px 60px rgba(18,18,22,.10)', ...entra(f, c1, 80, 0.15)})}>
        <div style={abs({left: 40, top: 40, fontSize: 30, fontWeight: 700, letterSpacing: '.14em', color: C.red})}>PARTE 1</div>
        <div style={abs({left: 40, top: 90, fontSize: 60, fontWeight: 800})}>Site</div>
        <Phone x={65} y={210} w={300} scroll={tween(f, c1, 80, 0, 500, E.cam)} />
      </div>
      <div style={abs({left: 566, top: 560, width: 430, height: 920, background: '#fff', borderRadius: 48, overflow: 'hidden', boxShadow: '0 30px 60px rgba(18,18,22,.10)', ...entra(f, c2, 80, 0.15)})}>
        <div style={abs({left: 40, top: 40, fontSize: 30, fontWeight: 700, letterSpacing: '.14em', color: C.red})}>PARTE 2</div>
        <div style={abs({left: 40, top: 90, fontSize: 56, fontWeight: 800, lineHeight: 1.05})}>Google<br />Meu Negócio</div>
        <div style={abs({left: 65, top: 400, transform: `scale(${spring(f, c2 + 6, 0.3, 0.6)})`})}>
          <Logo k="gmn" h={300} />
        </div>
        <div style={abs({left: 40, right: 40, top: 760, display: 'flex', gap: 12, ...entra(f, c2 + 14, 30)})}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={58} on={spring(f, c2 + 16 + i * 3, 0.4, 0.6)} />
          ))}
        </div>
      </div>
      <div style={abs({left: 540 - 70, top: 950, transform: `scale(${spring(f, c2 - 2, 0.4, 0.55)})`, zIndex: 3})}>
        <Plus size={140} style={{boxShadow: `0 0 0 14px ${C.soft}`}} />
      </div>
      <div style={abs({left: 84, right: 84, top: 1560, fontSize: 42, fontWeight: 600, color: C.t2, textAlign: 'center', ...entra(f, c2 + 10, 30)})}>Posicionamento digital completo</div>
    </Stage>
  );
};

const FRENTES = [
  ['01', 'Ser encontrado'],
  ['02', 'Um toque até o WhatsApp'],
  ['03', 'Prova reunida'],
  ['04', 'Endereço de vocês'],
];
const K11: React.FC<SP> = ({f, len, e}) => {
  const q = e('quatro');
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <div style={abs({left: 84, top: 150, fontSize: 32, fontWeight: 700, letterSpacing: '.14em', color: C.red, ...entra(f, 0, 30)})}>PARTE 1</div>
      <H top={220} size={104} f={f} s1={0} s2={q - 4} l1="O site," l2="em 4 frentes." color="#fff" />
      <div style={abs({left: 84, right: 84, top: 640, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32})}>
        {FRENTES.map(([n, t], i) => (
          <div key={n} style={{background: C.panel, borderRadius: 44, padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: 30, ...entra(f, 4 + i * 3, 60, 0.17)}}>
            <Plus size={96} style={{transform: `scale(${0.5 + 0.5 * spring(f, q + 2 + i * 3, 0.4, 0.6)})`, transformOrigin: '0 50%'}} />
            <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '.14em', color: C.red}}>{n}</div>
            <div style={{fontSize: 46, fontWeight: 700, lineHeight: 1.15}}>{t}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
};

const K12: React.FC<SP> = ({f, len, e}) => {
  const pw = 600, s1 = (pw - 36) / 390;
  const rr = e('digita') - 4;
  const ring = arrive(f, rr, 0.18);
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Tag n="1" t="Ser encontrado" f={f} />
      <div style={entra(f, 4, 50)}>
        <Search f={f} start={e('tratamento') - 6} text="implante dentário" top={330} h={130} fs={42} />
      </div>
      <Phone x={240} y={approach(f, 6, 1200, 560, 0.14)} w={pw} scroll={tween(f, 10, 36, OFF.odonto - 400, OFF.odonto, E.cam)}>
        {f >= rr && (
          <div
            style={abs({
              left: 14 * s1 - 4, top: (1432 - 1237 + 69) * s1 - 8, width: 306 * s1 + 8, height: 262 * s1 + 8, border: `8px solid ${C.red}`, borderRadius: 40,
              opacity: clamp(ring * 2), transform: `scale(${1.12 - 0.12 * ring})`, zIndex: 3,
            })}
          />
        )}
      </Phone>
      <div style={abs({left: 540 - 3, top: 460, width: 6, height: Math.max(0, 210 * E.expr(prog(f, e('nome2') - 2, 18))), background: C.red, borderRadius: 3, opacity: 1 - prog(f, rr + 10, 10)})} />
    </Stage>
  );
};

const K13: React.FC<SP> = ({f, len, e}) => {
  const pw = 600, s1 = (pw - 36) / 390;
  const tq = e('toque'), ab = e('abre');
  const sc = tween(f, e('qualquer') - 6, 50, OFF.medicina, OFF.depo, E.cam);
  const tap = arrive(f, tq - 8, 0.2);
  const press = pulse(f, tq, 10);
  const wa = spring(f, ab - 4, 0.3, 0.7);
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Tag n="2" t="Um toque até o WhatsApp" f={f} />
      <H top={330} size={150} f={f} s1={tq - 2} l1="1 toque." />
      <Phone x={150} y={approach(f, 4, 1200, 560, 0.14)} w={pw} scroll={sc} press={press}>
        {f >= tq - 8 && (
          <div style={abs({left: 300 * s1 - 42, top: (844 - 20) * s1 - 42 + (1 - tap) * 120, width: 84, height: 84, borderRadius: '50%', background: 'rgba(18,18,22,.18)', border: '5px solid #fff', boxShadow: `0 0 0 3px ${C.ink}`, zIndex: 5, opacity: clamp(tap * 2) * (1 - prog(f, ab + 6, 8)), transform: `scale(${1 - 0.15 * press})`})}>
            <div style={abs({inset: -34 - 30 * prog(f, tq, 12), borderRadius: '50%', border: `6px solid ${C.red}`, opacity: 0.7 * (1 - prog(f, tq, 12)) * (f >= tq ? 1 : 0)})} />
          </div>
        )}
      </Phone>
      {/* o WhatsApp da clínica abre a partir do botão (logo real) */}
      {f >= ab - 4 && (
        <div style={abs({left: 790, width: 240, top: lerp(1700, 880, wa), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: `scale(${0.94 + 0.06 * wa})`, opacity: clamp(wa * 2), zIndex: 9})}>
          <Logo k="wa" h={190} style={{filter: 'drop-shadow(0 20px 30px rgba(18,18,22,.22))'}} />
          <div style={{background: C.ink, color: '#fff', borderRadius: 999, padding: '16px 24px', fontSize: 28, fontWeight: 600, textAlign: 'center', lineHeight: 1.2}}>WhatsApp<br />da clínica</div>
        </div>
      )}
    </Stage>
  );
};

const FATOS = [
  ['550 m² de estrutura', 'estrutura'],
  ['Médico e dentista no mesmo lugar', 'estrutura'],
  ['Mais de 30 edições do Saúde Day', 'saudeday2'],
] as const;
const K14: React.FC<SP> = ({f, len, e}) => {
  const p = e('prova'), dp = e('depoimentos');
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Tag n="3" t="Prova reunida" f={f} />
      <div style={entra(f, 4, 70, 0.14)}>
        <Card x={84} y={330} w={500} h={520} src="clips/ana.mp4" video style={{transform: `scale(${1 + 0.035 * pulse(f, dp - 2, 16) + 0 * p})`}} />
        <div style={abs({left: 84, top: 875, fontSize: 30, color: C.t2, fontWeight: 500})}>Dona Ana, paciente</div>
      </div>
      <div style={abs({left: 520, top: 600, width: 480, background: '#fff', borderRadius: 40, padding: 44, boxShadow: '0 30px 60px rgba(18,18,22,.14)', ...entra(f, dp + 4, 60, 0.16)})}>
        <div style={{fontSize: 110, lineHeight: 0.6, color: C.red, fontWeight: 800}}>“</div>
        <div style={{fontSize: 46, fontWeight: 600, lineHeight: 1.3, marginTop: 20}}>Nesta eu confio de olhos fechados.</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: C.t2, marginTop: 22}}>
          <Logo k="ig" h={44} />
          Comentário no Instagram da clínica
        </div>
      </div>
      <div style={abs({left: 84, right: 84, top: 1080, background: C.ink, color: '#fff', borderRadius: 40, padding: 44, display: 'flex', flexDirection: 'column', gap: 30, ...entra(f, e('estrutura') - 8, 60, 0.15)})}>
        {FATOS.map(([t, k], i) => (
          <div key={t} style={{display: 'flex', gap: 26, alignItems: 'center', ...entra(f, e(k) - 4 + (i === 1 ? 6 : 0), 20, 0.2)}}>
            <Plus size={64} />
            <span style={{fontSize: 40, fontWeight: 700}}>{t}</span>
          </div>
        ))}
      </div>
    </Stage>
  );
};

// K15: anúncio, Google e Instagram (logos reais) levam para a mesma porta
const FONTES = [
  ['anuncio', 215, 'M215 10 C215 180 540 140 540 300'],
  ['google', 540, 'M540 10 L540 300'],
  ['instagram', 860, 'M860 10 C860 180 540 140 540 300'],
] as const;
const Fonte: React.FC<{k: string}> = ({k}) =>
  k === 'anuncio' ? (
    <>
      <Ic k="mega" size={52} color={C.red} />
      Anúncio
    </>
  ) : k === 'google' ? (
    <Logo k="google" h={58} style={{margin: '4px 0'}} />
  ) : (
    <>
      <Logo k="ig" h={60} />
      <Logo k="igEscrita" h={50} />
    </>
  );
const K15: React.FC<SP> = ({f, len, e}) => (
  <Stage bg={C.soft} f={f} len={len}>
    <Tag n="4" t="Endereço de vocês" f={f} />
    {FONTES.map(([k, cx]) => (
      <span key={k} style={abs({left: cx, top: 330, transform: `translateX(-50%) ${entra(f, e(k) - 4, 40, 0.2).transform}`, opacity: entra(f, e(k) - 4).opacity, background: '#fff', border: `3px solid ${C.gray}`, height: 110, padding: '0 34px', display: 'flex', alignItems: 'center', gap: 16, fontSize: 40, fontWeight: 600, borderRadius: 999, whiteSpace: 'nowrap'})}>
        <Fonte k={k} />
      </span>
    ))}
    <svg style={abs({left: 0, top: 440})} width={1080} height={320}>
      {FONTES.map(([k, , d]) => {
        const p = E.expr(prog(f, Math.max(e(k), e('levam') - 14) + 2, 16));
        return <path key={k} d={d} stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
      })}
    </svg>
    <Phone x={250} y={approach(f, e('endereco') - 6, 1300, 770, 0.13)} w={580} scroll={tween(f, e('porta'), 40, 0, 60, E.expr)} />
    <div style={abs({left: 640, top: 1460, background: C.ink, color: '#fff', padding: '26px 44px', fontSize: 40, fontWeight: 600, borderRadius: 999, whiteSpace: 'nowrap', ...entra(f, e('vinte') - 4, 40, 0.2)})}>aberto 24 h</div>
  </Stage>
);

// K16: parte 2, o Google Meu Negócio: aparece no Google e no Maps
const K16: React.FC<SP> = ({f, len, e}) => {
  const g = e('gmn2');
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <div style={abs({left: 84, top: 170, fontSize: 32, fontWeight: 700, letterSpacing: '.14em', color: C.red, ...entra(f, 0, 30)})}>PARTE 2</div>
      <div style={abs({left: 84, top: 250, transform: `scale(${spring(f, 4, 0.25, 0.6) * (1 + 0.06 * pulse(f, g - 2, 16))})`, transformOrigin: '0 0'})}>
        <Logo k="gmn" h={300} />
      </div>
      <H top={600} size={112} f={f} s1={10} s2={g + 2} l1="Google" l2="Meu Negócio." color="#fff" />
      <div style={abs({left: 84, right: 84, top: 900, fontSize: 44, fontWeight: 500, lineHeight: 1.35, color: '#c9cad0', ...entra(f, e('perfil') - 4, 30)})}>O perfil que aparece quando alguém procura a clínica:</div>
      <div style={abs({left: 84, top: 1140, width: 430, height: 300, background: '#fff', borderRadius: 48, display: 'grid', placeItems: 'center', ...entra(f, e('google2') - 6, 60, 0.18)})}>
        <Logo k="google" h={100} />
      </div>
      <div style={abs({left: 566, top: 1140, width: 430, height: 300, background: '#fff', borderRadius: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, color: C.ink, fontSize: 64, fontWeight: 700, ...entra(f, e('maps') - 6, 60, 0.18)})}>
        <div style={{transform: `translateY(${(1 - spring(f, e('maps') - 2, 0.35, 0.5)) * -90}px)`}}>
          <Logo k="maps" h={150} />
        </div>
        Maps
      </div>
    </Stage>
  );
};

// K17: o perfil se completa palavra a palavra (dados reais do site) e fica ligado ao site
const LINHAS = [
  ['pin', 'Quadra 7/9, CL 13, Sobradinho-DF', 'end'],
  ['phone', '(61) 99825-5551', 'telefone'],
  ['star', 'Avaliações dos pacientes', 'avaliacoes'],
] as const;
const K17: React.FC<SP> = ({f, len, e}) => {
  const fo = e('fotos'), co = e('completo'), li = e('ligado');
  const site = spring(f, li - 2, 0.3, 0.6);
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <div style={abs({left: 84, right: 84, top: 140, height: 1440, background: '#fff', borderRadius: 52, overflow: 'hidden', boxShadow: '0 40px 80px rgba(18,18,22,.12)', ...entra(f, 0, 60, 0.16)})}>
        {/* fotos */}
        <div style={abs({left: 0, right: 0, top: 0, height: 380, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 6, background: C.gray})}>
          {['tour-4.jpg', 'tour-25.7.jpg'].map((im, i) => (
            <div key={im} style={{overflow: 'hidden', opacity: clamp(arrive(f, fo - 6 + i * 4, 0.2) * 2)}}>
              <Img src={staticFile(`img/${im}`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 - 0.1 * arrive(f, fo - 6 + i * 4, 0.12)})`}} />
            </div>
          ))}
          <div style={abs({left: 30, bottom: 26, display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '12px 22px', borderRadius: 999, fontSize: 28, fontWeight: 600, ...entra(f, fo, 20, 0.2)})}>
            <Ic k="images" size={36} color={C.red} />
            Fotos
          </div>
        </div>
        <div style={abs({left: 56, right: 56, top: 430})}>
          <div style={{fontSize: 64, fontWeight: 800, letterSpacing: '-0.02em'}}>MedicMais Sobradinho</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, fontSize: 32, color: C.t2}}>
            <Logo k="gmn" h={46} />
            Clínica médica e odontológica
          </div>
        </div>
        <div style={abs({left: 56, right: 56, top: 640, display: 'flex', flexDirection: 'column', gap: 0})}>
          {LINHAS.map(([ic, t, k]) => {
            const a = arrive(f, e(k) - 4, 0.2);
            return (
              <div key={k} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '32px 0', borderBottom: `3px solid ${C.gray}`}}>
                <div style={{width: 84, height: 84, borderRadius: 26, background: a > 0.02 ? 'rgba(235,32,38,.08)' : C.soft, display: 'grid', placeItems: 'center', flex: 'none'}}>
                  {a > 0.02 && <Ic k={ic} size={46} color={C.red} style={{transform: `scale(${spring(f, e(k) - 4, 0.4, 0.6)})`}} />}
                </div>
                {a > 0.02 ? (
                  <span style={{display: 'flex', alignItems: 'center', gap: 18, fontSize: 40, fontWeight: 600, opacity: clamp(a * 2), transform: `translateX(${(1 - a) * 30}px)`}}>
                    {t}
                  </span>
                ) : (
                  <span style={{width: 440, height: 30, borderRadius: 15, background: C.soft}} />
                )}
              </div>
            );
          })}
          <div style={{display: 'flex', gap: 10, padding: '30px 0 0', ...entra(f, e('avaliacoes'), 20, 0.2)}}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={64} on={spring(f, e('avaliacoes') + 4 + i * 3, 0.4, 0.6)} />
            ))}
          </div>
        </div>
        {/* botões do perfil: o "Site" liga no site */}
        <div style={abs({left: 56, right: 56, top: 1240, display: 'flex', gap: 20})}>
          {[
            ['phone', 'Ligar'],
            ['route', 'Rotas'],
            ['globe', 'Site'],
          ].map(([ic, t]) => {
            const on = t === 'Site' ? site : 0;
            return (
              <div key={t} style={{flex: 1, height: 110, borderRadius: 999, border: `3px solid ${on > 0.5 ? C.red : C.gray}`, background: on > 0.5 ? C.red : '#fff', color: on > 0.5 ? '#fff' : C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 38, fontWeight: 600, transform: `scale(${1 + 0.08 * pulse(f, li - 2, 14) * (t === 'Site' ? 1 : 0)})`}}>
                <Ic k={ic} size={42} color={on > 0.5 ? '#fff' : C.red} />
                {t}
              </div>
            );
          })}
        </div>
      </div>
      {/* selo: perfil completo */}
      <div style={abs({right: 60, top: 470, display: 'flex', alignItems: 'center', gap: 14, background: C.ink, color: '#fff', padding: '20px 32px', borderRadius: 999, fontSize: 34, fontWeight: 700, zIndex: 4, transform: `scale(${spring(f, co - 4, 0.35, 0.55)})`, transformOrigin: '100% 50%'})}>
        <Ic k="seal" size={44} color={C.red} />
        Completo
      </div>
      {/* ligado ao site: o celular com o site sobe do botão */}
      <div style={abs({left: 0, right: 0, top: 1610, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, fontSize: 40, fontWeight: 700, color: C.red, opacity: clamp(site * 2), transform: `translateY(${(1 - clamp(site)) * 40}px)`})}>
        <Ic k="link" size={50} color={C.red} />
        ligado ao site da clínica
      </div>
    </Stage>
  );
};

// K18: a plaquinha NFC em 3D (Plaquinha3D.tsx) + títulos por frase
const K18: React.FC<SP> = ({f, len, e}) => {
  const m = {plaquinha: e('plaquinha'), balcao: e('balcao'), aproxima: e('aproxima'), toca: e('toca'), tela: e('tela'), abre: e('abreR'), estrelas: e('avaliacao'), len};
  const titulos: [number, string, string][] = [
    [0, 'Para ter', 'avaliações:'],
    [m.plaquinha - 4, 'A plaquinha', 'do Google.'],
    [m.balcao - 4, 'Fica no', 'balcão.'],
    [m.aproxima - 6, 'Aproxima', 'o celular…'],
    [m.tela - 4, 'A avaliação', 'abre na hora.'],
  ];
  let ti = 0;
  titulos.forEach(([s], i) => {
    if (f >= s) ti = i;
  });
  const [ts, l1, l2] = titulos[ti];
  const prox = titulos[ti + 1]?.[0] ?? 1e9;
  const sai = prog(f, prox - 6, 6);
  const estrelasSai = E.exit(prog(f, m.plaquinha - 40, 14));
  return (
    <AbsoluteFill style={{background: C.soft, fontFamily: 'P', color: C.ink, overflow: 'hidden'}}>
      <Plaquinha3D f={f} m={m} />
      {/* antes da plaquinha: as 5 estrelas vazias esperando avaliação */}
      {estrelasSai < 1 && (
        <div style={abs({left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', gap: 22, opacity: 1 - estrelasSai, transform: `translateY(${-300 * estrelasSai}px) scale(${1 - 0.3 * estrelasSai})`})}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={entra(f, 2 + i * 3, 40, 0.2)}>
              <Star size={150} on={0} />
            </div>
          ))}
        </div>
      )}
      <div key={ti} style={abs({left: 84, right: 84, top: 170, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04, fontSize: 100, opacity: 1 - sai})}>
        <div style={entra(f, ts, 40)}>{l1}</div>
        <div style={{color: C.red, ...entra(f, ts + 4, 40)}}>{l2}</div>
      </div>
      {[
        ['Sem baixar app', e('sembaixar') - 4, 1640],
        ['Sem procurar a clínica', e('semprocurar') - 4, 1760],
      ].map(([t, s, y]) => (
        <div key={t as string} style={abs({left: 540, top: y as number, transform: `translateX(-50%) ${entra(f, s as number, 40, 0.2).transform}`, opacity: entra(f, s as number).opacity, display: 'flex', alignItems: 'center', gap: 18, background: '#fff', border: `3px solid ${C.gray}`, padding: '20px 40px 20px 22px', borderRadius: 999, fontSize: 40, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(18,18,22,.10)'})}>
          <span style={{width: 60, height: 60, borderRadius: '50%', background: C.red, display: 'grid', placeItems: 'center'}}>
            <Ic k="check" size={36} color="#fff" />
          </span>
          {t}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// K19: cada paciente satisfeito vira uma estrela (pacientes reais dos depoimentos) que o próximo paciente vê
const AV = ['ana-10.jpg', 'maria-10.jpg', 'familia-10.jpg'];
const K19: React.FC<SP> = ({f, len, e}) => {
  const es = e('estrela'), px = e('proximo');
  const sx = (i: number) => 540 - 2 * 180 + i * 180 - 75;
  const SY = 1010;
  const card = spring(f, px - 6, 0.25, 0.7);
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <H top={200} size={100} f={f} s1={0} s2={es - 4} l1="Cada paciente" l2="vira uma estrela." color="#fff" />
      {AV.map((im, i) => {
        const a = arrive(f, 4 + i * 5, 0.18);
        const m = E.prod(prog(f, es - 6 + i * 4, 12));
        const x0 = 160 + i * 280, y0 = 640;
        return (
          m < 1 && (
            <div key={im} style={abs({left: lerp(x0, sx(i) + 15, m), top: lerp(y0, SY + 15, m), width: lerp(220, 120, m), height: lerp(220, 120, m), borderRadius: '50%', overflow: 'hidden', border: '6px solid #fff', opacity: clamp(a * 2) * (1 - m), transform: `translateY(${(1 - a) * 60}px)`})}>
              <Img src={staticFile(`img/${im}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          )
        );
      })}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={abs({left: sx(i), top: SY, transform: `scale(${1 + 0.15 * pulse(f, es + 4 + i * 4, 12)})`})}>
          <Star size={150} on={spring(f, es + i * 4, 0.35, 0.55)} dark />
        </div>
      ))}
      {/* o próximo paciente: o perfil no Google com as estrelas */}
      <div style={abs({left: 84, right: 84, top: lerp(1920, 1330, card), background: '#fff', color: C.ink, borderRadius: 44, padding: '40px 44px', display: 'flex', flexDirection: 'column', gap: 18})}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Logo k="g" h={56} />
          <span style={{fontSize: 30, color: C.t2, fontWeight: 500}}>medicmais sobradinho</span>
        </div>
        <div style={{fontSize: 52, fontWeight: 800, letterSpacing: '-0.02em'}}>MedicMais Sobradinho</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={46} on={spring(f, px + 4 + i * 3, 0.4, 0.6)} />
          ))}
          <span style={{fontSize: 30, color: C.t2, marginLeft: 14}}>Clínica · Sobradinho-DF</span>
        </div>
      </div>
    </Stage>
  );
};

const SW = [
  ['#EB2026', 'Vermelho'],
  ['#121216', 'Grafite'],
  ['#F4F5F7', 'Névoa'],
];
const K20: React.FC<SP> = ({f, len, e}) => {
  const v = e('vermelho'), sn = e('sinal'), sv = e('servicos'), cel = e('celular');
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <H top={170} size={100} f={f} s1={0} s2={e('cara') - 2} l1="Com a cara" l2="da MedicMais." />
      <div style={entra(f, 6, 80, 0.13)}>
        <Laptop x={110} y={440} w={860} />
      </div>
      <div style={{...entra(f, 16, 120, 0.13)}}>
        <Phone x={740} y={640} w={250} scroll={tween(f, cel - 20, 40, 0, 300, E.cam)} style={{transform: `scale(${1 + 0.08 * spring(f, cel - 4, 0.3, 0.7)})`, transformOrigin: '50% 100%'}} />
      </div>
      <div style={abs({left: 84, right: 84, top: 1330, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'})}>
        {SW.map(([c, n], i) => (
          <div key={c} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, ...entra(f, v - 4 + i * 3, 40, 0.2)}}>
            <div style={{width: 150, height: 150, borderRadius: 44, background: c, border: `3px solid ${C.gray}`}} />
            <div style={{fontSize: 30, fontWeight: 600}}>{n}</div>
            <div style={{fontSize: 26, color: C.t2}}>{c}</div>
          </div>
        ))}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, ...entra(f, v + 6, 40, 0.2)}}>
          <div style={{width: 150, height: 150, display: 'grid', placeItems: 'center', fontSize: 100, fontWeight: 800}}>Aa</div>
          <div style={{fontSize: 30, fontWeight: 600}}>Poppins</div>
          <div style={{fontSize: 26, color: C.t2}}>800 / 400</div>
        </div>
      </div>
      <div style={abs({left: 84, top: 1620, display: 'flex', gap: 24, alignItems: 'center'})}>
        <Plus size={96} style={{transform: `scale(${spring(f, sn - 4, 0.4, 0.6)})`}} />
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: C.red, color: '#fff', padding: '24px 44px', fontSize: 38, fontWeight: 600, borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(235,32,38,.28)', ...entra(f, sv - 4, 40, 0.2)}}>
          <Logo k="wa" h={52} />
          Agendar pelo WhatsApp
        </span>
      </div>
    </Stage>
  );
};

// K21: o sistema inteiro, uma frase por peça, e o ciclo fecha na "prova"
const K21: React.FC<SP> = ({f, len, e}) => {
  const rows = [
    {ev: e('site4'), t: 'O site', s: 'recebe o paciente.'},
    {ev: e('google4'), t: 'O Google', s: 'mostra a clínica.'},
    {ev: e('plaquinha2'), t: 'A plaquinha', s: 'transforma cada atendimento em prova.'},
  ];
  const Y = [470, 870, 1270];
  const loop = E.expr(prog(f, e('prova2') - 8, 22));
  const icone = (i: number) =>
    i === 0 ? (
      <Phone x={60} y={18} w={150} scroll={tween(f, rows[0].ev, 60, 0, 400, E.cam)} />
    ) : i === 1 ? (
      <div style={abs({inset: 0, display: 'grid', placeItems: 'center'})}>
        <Logo k="gmn" h={170} />
      </div>
    ) : (
      <div style={abs({inset: 0, display: 'grid', placeItems: 'center'})}>
        <Img src={staticFile('tex/placa.png')} style={{width: 160, height: 200, borderRadius: 18, boxShadow: '0 16px 30px rgba(18,18,22,.18)', transform: `rotate(${-6 + 6 * spring(f, rows[2].ev, 0.3, 0.5)}deg)`}} />
      </div>
    );
  return (
    <Stage bg="#fff" f={f} len={len}>
      <div style={abs({left: 84, top: 170, display: 'flex', alignItems: 'center', gap: 20, fontSize: 34, fontWeight: 700, letterSpacing: '.12em', color: C.red, ...entra(f, 0, 30)})}>
        <Plus size={62} />
        POSICIONAMENTO DIGITAL
      </div>
      <H top={250} size={92} f={f} s1={2} l1="Tudo ligado." />
      {/* fio vermelho entre as peças */}
      <div style={abs({left: 84 + 135 - 4, top: Y[0] + 270, width: 8, height: (Y[2] - Y[0]) * E.expr(prog(f, rows[1].ev - 10, 30 + rows[2].ev - rows[1].ev)), background: C.red, borderRadius: 4, maxHeight: Y[2] - Y[0] - 270})} />
      {rows.map((r, i) => (
        <div key={i} style={abs({left: 84, right: 84, top: Y[i], height: 270, display: 'flex', alignItems: 'center', gap: 44, ...entra(f, r.ev - 6, 60, 0.17)})}>
          <div style={{position: 'relative', width: 270, height: 270, borderRadius: 64, background: C.soft, overflow: 'hidden', flex: 'none'}}>{icone(i)}</div>
          <div>
            <div style={{fontSize: 70, fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase'}}>{r.t}</div>
            <div style={{fontSize: 42, fontWeight: 500, color: C.t2, lineHeight: 1.25, marginTop: 6}}>{r.s}</div>
          </div>
        </div>
      ))}
      {/* o ciclo: prova traz o próximo paciente de volta ao começo */}
      <svg style={abs({left: 0, top: 0})} width={1080} height={1920}>
        <path d={`M 990 ${Y[2] + 135} C 1034 ${Y[2] + 135} 1034 ${Y[0] + 135} 990 ${Y[0] + 135}`} stroke={C.red} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - loop} />
      </svg>
      <div style={abs({left: 84, right: 84, top: 1640, display: 'flex', alignItems: 'center', gap: 18, fontSize: 40, fontWeight: 700, color: C.red, ...entra(f, e('prova2') - 4, 30)})}>
        <Ic k="star" size={46} color={C.star} />
        Cada avaliação traz o próximo paciente.
      </div>
    </Stage>
  );
};

const ITENS = [
  ['Horário de funcionamento', 'horario'],
  ['CNPJ', 'cnpj'],
  ['Responsáveis técnicos (CRM e CRO)', 'responsaveis'],
  ['Logo oficial', 'logo'],
] as const;
const K22: React.FC<SP> = ({f, len, e}) => (
  <Stage bg={C.soft} f={f} len={len}>
    <H top={220} size={110} f={f} s1={0} s2={e('detalhes') - 4} l1="Faltam só" l2="4 detalhes." />
    <div style={abs({left: 84, right: 84, top: 600, background: '#fff', borderRadius: 48, padding: '20px 56px 30px', boxShadow: '0 30px 60px rgba(18,18,22,.10)', ...entra(f, 6, 60, 0.15)})}>
      {ITENS.map(([t, k], i) => {
        const a = arrive(f, e(k) - 4, 0.2);
        return (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '38px 0', borderBottom: i < 3 ? `3px solid ${C.gray}` : 'none'}}>
            <span style={{width: 70, height: 70, borderRadius: 22, border: `5px dashed ${C.red}`, flex: 'none', transform: `scale(${0.6 + 0.4 * spring(f, e(k) - 4, 0.4, 0.6)})`, opacity: clamp(a * 2)}} />
            <span style={{fontSize: 46, fontWeight: 600, opacity: clamp(0.25 + a), transform: `translateX(${(1 - a) * 30}px)`}}>{t}</span>
          </div>
        );
      })}
    </div>
    <div style={abs({left: 84, right: 84, top: 1420, fontSize: 40, lineHeight: 1.35, color: C.t2, ...entra(f, e('logo') + 8, 30)})}>O resto já está pronto, testado no celular.</div>
  </Stage>
);

const K23: React.FC<SP> = ({f, len, e}) => {
  const ar = e('noar'), mp = e('mapa');
  const b = arrive(f, ar - 12, 0.18);
  const pin = spring(f, mp - 6, 0.3, 0.45);
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <div style={abs({left: 84, top: 170, display: 'flex', alignItems: 'center', gap: 22, fontWeight: 600, fontSize: 38, color: C.red, ...entra(f, 0, 30)})}>
        <Plus size={62} />
        Vamos colocar a MedicMais
      </div>
      <div style={abs({left: 84, right: 84, top: 270, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04, fontSize: 104})}>
        <div style={entra(f, 2, 50)}>No ar</div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 24, color: C.red, ...entra(f, mp - 8, 50)}}>
          e no mapa.
          <div style={{transform: `translateY(${(1 - clamp(pin)) * -160}px) scale(${0.6 + 0.4 * pin})`, transformOrigin: '50% 100%', opacity: clamp(pin * 3), marginBottom: 10}}>
            <Logo k="maps" h={120} />
          </div>
        </div>
      </div>
      <Phone x={200} y={approach(f, 0, 900, 640, 0.14)} w={680} scroll={tween(f, 0, 50, 300, 0, E.expr)} />
      <div
        style={abs({
          left: 540, top: 1610, zIndex: 9, display: 'inline-flex', alignItems: 'center', gap: 18, background: C.red, color: '#fff', padding: '40px 70px', fontSize: 50, fontWeight: 600,
          borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(235,32,38,.28)', opacity: clamp(b * 2),
          transform: `translateX(-50%) translateY(${(1 - b) * 80}px) scale(${(0.94 + 0.06 * b) * (1 + 0.06 * pulse(f, ar + 2, 16))})`,
        })}
      >
        <Plus size={64} inv />
        Colocar no ar
      </div>
    </Stage>
  );
};


// ================================================================ v3: a proposta (P01-P17), emendada depois da K21.
// Mesmas peças da v2 (Phone, Logo, Ic, Star, Search, Tag, Stage, H, Plus); dados reais do PDF da proposta.
const Kick: React.FC<{f: number; t: string; top?: number; color?: string; s?: number; icon?: React.ReactNode}> = ({f, t, top = 170, color = C.red, s = 0, icon}) => (
  <div style={abs({left: 84, top, display: 'flex', alignItems: 'center', gap: 20, fontSize: 34, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color, ...entra(f, s, 30)})}>
    {icon ?? <Plus size={62} />}
    {t}
  </div>
);
const Pill: React.FC<{f: number; s: number; children: React.ReactNode; style?: React.CSSProperties; dark?: boolean; red?: boolean}> = ({f, s, children, style, dark, red}) => (
  <span
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 18, padding: '22px 38px 22px 26px', fontSize: 38, fontWeight: 600, borderRadius: 999, whiteSpace: 'nowrap',
      background: red ? C.red : dark ? C.panel : '#fff', color: red || dark ? '#fff' : C.ink, border: red || dark ? 'none' : `3px solid ${C.gray}`,
      boxShadow: dark ? 'none' : '0 16px 40px rgba(18,18,22,.08)', ...entra(f, s, 40, 0.2), ...style,
    }}
  >
    {children}
  </span>
);
const Bola: React.FC<{k: string; size?: number; bg?: string; color?: string}> = ({k, size = 64, bg = C.red, color = '#fff'}) => (
  <span style={{width: size, height: size, borderRadius: size * 0.3, background: bg, display: 'grid', placeItems: 'center', flex: 'none'}}>
    <Ic k={k} size={size * 0.58} color={color} />
  </span>
);
// estrela preenchida só em parte (o 4,7)
const StarPart: React.FC<{size: number; frac: number}> = ({size, frac}) => (
  <div style={{position: 'relative', width: size, height: size, flex: 'none'}}>
    <Star size={size} on={0} />
    <div style={abs({left: 0, top: 0, width: size * clamp(frac), height: size, overflow: 'hidden'})}>
      <Star size={size} on={1} />
    </div>
  </div>
);
const brl = (n: number) => n.toLocaleString('pt-BR');
const Risco: React.FC<{p: number; children: React.ReactNode; color?: string}> = ({p, children, color = C.red}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    {children}
    <span style={abs({left: -4, right: -4, top: '52%', height: 5, background: color, borderRadius: 3, transformOrigin: '0 50%', transform: `scaleX(${p})`})} />
  </span>
);

// P01: a nota que a clínica já tem no Google
const P01: React.FC<SP> = ({f, len, e}) => {
  const n = e('p_47');
  const v = 4.7 * E.expr(prog(f, 4, n + 14 - 4));
  const q = Math.round(99 * E.expr(prog(f, e('p_noventa') - 4, 20)));
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Kick f={f} t="Hoje, no Google" icon={<Logo k="g" h={62} />} />
      <div style={abs({left: 84, right: 84, top: 300, fontSize: 92, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.04, textTransform: 'uppercase', ...entra(f, 2, 50)})}>A MedicMais já tem</div>
      <div style={abs({left: 0, right: 0, top: 520, textAlign: 'center', fontSize: 420, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', ...entra(f, 2, 80, 0.16)})}>
        {v.toFixed(1).replace('.', ',')}
      </div>
      <div style={abs({left: 0, right: 0, top: 980, display: 'flex', justifyContent: 'center', gap: 20})}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={entra(f, 6 + i * 2, 30, 0.22)}>
            <StarPart size={140} frac={clamp((v - i) / 1)} />
          </div>
        ))}
      </div>
      <div style={abs({left: 0, right: 0, top: 1210, display: 'flex', justifyContent: 'center', ...entra(f, e('p_google') - 4, 40)})}>
        <Logo k="google" h={110} style={{transform: `scale(${1 + 0.06 * pulse(f, e('p_google') - 2, 16)})`}} />
      </div>
      <div style={abs({left: 0, right: 0, top: 1420, display: 'flex', justifyContent: 'center'})}>
        <Pill f={f} s={e('p_noventa') - 6} dark>
          <span style={{fontSize: 56, fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: 70}}>{q}</span>
          avaliações de pacientes
        </Pill>
      </div>
    </Stage>
  );
};

// P02: para funcionar, a casa precisa estar arrumada: a lupa passa pela presença digital
const PRES = [
  ['site', 84 + 0, 560],
  ['g', 566, 560],
  ['ig', 84, 1010],
  ['wa', 566, 1010],
] as const;
const P02: React.FC<SP> = ({f, len, e}) => {
  const ol = e('p_olhou');
  const path: [number, number][] = PRES.map(([, x, y]) => [x + 215, y + 200]);
  const t = clamp((f - (ol - 4)) / 52) * (path.length - 1);
  const i0 = Math.min(path.length - 2, Math.floor(t));
  const u = E.cam(t - i0);
  const lx = lerp(path[i0][0], path[i0 + 1][0], u), ly = lerp(path[i0][1], path[i0 + 1][1], u);
  const lupa = arrive(f, ol - 8, 0.2);
  return (
    <Stage bg="#fff" f={f} len={len}>
      <H top={170} size={96} f={f} s1={e('p_casa') - 8} s2={e('p_arrumada') - 4} l1="A casa precisa" l2="estar arrumada." />
      {PRES.map(([k, x, y], i) => (
        <div key={k} style={abs({left: x, top: y, width: 430, height: 400, borderRadius: 52, background: C.soft, overflow: 'hidden', display: 'grid', placeItems: 'center', ...entra(f, 2 + i * 3, 60, 0.16)})}>
          {k === 'site' ? <Phone x={115} y={40} w={200} scroll={tween(f, 0, len, 0, 600, E.cam)} /> : <Logo k={k as 'g'} h={k === 'g' ? 170 : 180} />}
        </div>
      ))}
      <div style={abs({left: 84, right: 84, top: 1480, fontSize: 44, fontWeight: 600, color: C.t2, ...entra(f, e('p_presenca') - 4, 30)})}>A gente olhou a presença digital da clínica.</div>
      {f >= ol - 8 && (
        <div style={abs({left: lx - 150, top: ly - 150, width: 300, height: 300, borderRadius: '50%', border: `16px solid ${C.ink}`, background: 'rgba(255,255,255,.18)', boxShadow: '0 30px 60px rgba(18,18,22,.25)', opacity: clamp(lupa * 2), transform: `scale(${0.7 + 0.3 * lupa})`, zIndex: 5})}>
          <div style={abs({left: 220, top: 230, width: 150, height: 34, borderRadius: 17, background: C.ink, transform: 'rotate(45deg)', transformOrigin: '0 50%'})} />
        </div>
      )}
    </Stage>
  );
};

// P03: seis pontos que fazem perder pacientes
const P03: React.FC<SP> = ({f, len, e}) => {
  const s = e('p_seis');
  const n = clamp(Math.floor((f - (s - 10)) / 2) + 1, 1, 6);
  return (
    <Stage bg={C.red} color="#fff" f={f} len={len}>
      <div style={abs({right: -60, bottom: -260, fontSize: 1300, fontWeight: 800, lineHeight: 1, color: 'rgba(255,255,255,.10)', transform: `rotate(${f * 0.12}deg)`})}>+</div>
      <div style={abs({left: 84, top: 260, fontSize: 34, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.9, ...entra(f, 0, 30)})}>Diagnóstico</div>
      <div style={abs({left: 84, top: 330, fontSize: 600, fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', ...entra(f, s - 12, 80), transform: `${entra(f, s - 12, 80).transform} scale(${1 + 0.05 * pulse(f, s, 14)})`, transformOrigin: '0 100%'})}>{n}</div>
      <div style={abs({left: 84, right: 84, top: 940, fontSize: 92, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04})}>
        <div style={entra(f, s + 4, 40)}>pontos que fazem</div>
        <div style={entra(f, s + 8, 40)}>a MedicMais</div>
        <div style={{...entra(f, e('p_perder') - 4, 40), color: C.ink}}>perder pacientes.</div>
      </div>
    </Stage>
  );
};

// P04: os 6 pontos, um cartão de cada vez, cada um com o seu visual
const DIAG = [
  ['d1', 'Não existe um site oficial'],
  ['d2', 'Site antigo no ar, com dados velhos'],
  ['d3', 'Google Meu Negócio pela metade'],
  ['d4', 'Endereço diferente em cada lugar'],
  ['d5', 'Link de agendar da bio não abria'],
  ['d6', 'Vídeos bons, edição sem padrão'],
] as const;
const ENDS = [
  ['Site antigo', 'Quadra Central, Lote I', -4],
  ['Cadastro na Receita', 'Quadra Central, Lote I, Bloco A', 3],
  ['Onde a clínica está', 'Quadra 7/9, CL 13', -2],
] as const;
const DiagVis: React.FC<{i: number; f: number; e: (k: string) => number}> = ({i, f, e}) => {
  if (i === 0) {
    const sd = e('d1site');
    return (
      <>
        <Search f={f} start={e('d1') - 2} text="medicmais sobradinho site" top={430} h={130} fs={40} />
        <div style={abs({left: 84, right: 84, top: 620, display: 'flex', flexDirection: 'column', gap: 24})}>
          {['Catálogo de médicos', 'Outra clínica da região'].map((t, j) => (
            <div key={t} style={{background: '#fff', border: `3px solid ${C.gray}`, borderRadius: 36, padding: '30px 40px', fontSize: 40, fontWeight: 600, color: C.mid, ...entra(f, e('d1') + 10 + j * 4, 40, 0.2)}}>{t}</div>
          ))}
          <div style={{border: `6px dashed ${C.red}`, borderRadius: 36, padding: '40px', fontSize: 46, fontWeight: 700, color: C.red, display: 'flex', alignItems: 'center', gap: 24, ...entra(f, sd - 6, 50, 0.16), transform: `${entra(f, sd - 6, 50, 0.16).transform} translateX(${12 * Math.sin((f - sd) * 0.9) * pulse(f, sd + 4, 16)}px)`}}>
            <Ic k="x" size={70} color={C.red} />
            Site oficial da MedicMais
          </div>
        </div>
      </>
    );
  }
  if (i === 1) {
    const linhas = [
      ['Endereço', 'Quadra Central, Lote I', 'Quadra 7/9, CL 13', e('d2end')],
      ['Telefone', '(61) 3055-5222', '(61) 99825-5551', e('d2tel')],
    ] as const;
    return (
      <>
        <div style={abs({left: 84, top: 420, width: 912, height: 560, borderRadius: 44, overflow: 'hidden', boxShadow: '0 30px 60px rgba(18,18,22,.16)', ...entra(f, e('d2') - 4, 60, 0.16)})}>
          <Img src={staticFile('img/site-antigo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 8%', transform: `scale(${1.06 - 0.06 * prog(f, e('d2'), 200)})`}} />
          <div style={abs({left: 30, top: 30, display: 'flex', alignItems: 'center', gap: 14, background: C.ink, color: '#fff', padding: '16px 28px', borderRadius: 999, fontSize: 32, fontWeight: 600, ...entra(f, e('d2antigo') - 4, 20, 0.2)})}>
            <span style={{width: 18, height: 18, borderRadius: '50%', background: C.red, opacity: 0.5 + 0.5 * Math.abs(Math.sin(f * 0.15))}} />
            Site antigo, ainda no ar
          </div>
        </div>
        {linhas.map(([lab, velho, novo, ev], j) => {
          const r = E.expr(prog(f, ev + 2, 10));
          return (
            <div key={lab} style={abs({left: 84, right: 84, top: 1030 + j * 200, ...entra(f, ev - 6, 40, 0.2)})}>
              <div style={{fontSize: 28, fontWeight: 700, letterSpacing: '.12em', color: C.mid, textTransform: 'uppercase'}}>{lab}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 10, fontSize: 38, fontWeight: 700, whiteSpace: 'nowrap'}}>
                <span style={{color: C.red}}>
                  <Risco p={r}>{velho}</Risco>
                </span>
                <span style={{color: C.mid, opacity: clamp(r * 2)}}>→</span>
                <span style={{opacity: clamp(r * 2), transform: `translateX(${(1 - r) * 20}px)`}}>{novo}</span>
              </div>
            </div>
          );
        })}
      </>
    );
  }
  if (i === 2) {
    const m = E.expr(prog(f, e('d3metade') - 10, 18));
    return (
      <div style={abs({left: 84, right: 84, top: 430, background: '#fff', borderRadius: 52, padding: '50px 56px', boxShadow: '0 30px 60px rgba(18,18,22,.10)', ...entra(f, e('d3') - 4, 60, 0.16)})}>
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <Logo k="gmn" h={150} style={{transform: `scale(${0.6 + 0.4 * spring(f, e('d3gmn') - 4, 0.35, 0.6)})`}} />
          <div>
            <div style={{fontSize: 52, fontWeight: 800}}>MedicMais Sobradinho</div>
            <div style={{fontSize: 32, color: C.t2, marginTop: 6}}>Perfil no Google</div>
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 54, fontSize: 32, fontWeight: 700, color: C.t2}}>
          <span>Perfil preenchido</span>
          <span style={{color: C.red, fontVariantNumeric: 'tabular-nums'}}>{Math.round(50 * m)}%</span>
        </div>
        <div style={{height: 30, borderRadius: 15, background: C.soft, marginTop: 16, overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${50 * m}%`, background: C.red, borderRadius: 15}} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 26, marginTop: 50}}>
          {[0, 1, 2, 3].map((j) => {
            const ok = j < 2;
            const a = arrive(f, e('d3') + 6 + j * 4, 0.2);
            return (
              <div key={j} style={{display: 'flex', alignItems: 'center', gap: 26, opacity: clamp(a * 2)}}>
                <span style={{width: 64, height: 64, borderRadius: 20, border: ok ? 'none' : `5px dashed ${C.mid}`, background: ok ? 'rgba(235,32,38,.08)' : 'transparent', display: 'grid', placeItems: 'center'}}>
                  {ok && <Ic k="check" size={38} color={C.red} />}
                </span>
                <span style={{height: 28, borderRadius: 14, width: ok ? 520 : 380, background: ok ? C.gray : C.soft}} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (i === 3) {
    const d = e('d4dif');
    return (
      <div style={abs({left: 84, right: 84, top: 440, display: 'flex', flexDirection: 'column', gap: 34})}>
        {ENDS.map(([lab, end, rot], j) => {
          const ok = j === 2;
          const tw = spring(f, d - 4 + j * 3, 0.3, 0.45);
          return (
            <div key={lab} style={{background: '#fff', border: `3px solid ${ok ? C.ink : C.gray}`, borderRadius: 44, padding: '38px 44px', display: 'flex', alignItems: 'center', gap: 32, boxShadow: '0 20px 40px rgba(18,18,22,.08)', ...entra(f, e('d4') - 4 + j * 4, 50, 0.18), transform: `${entra(f, e('d4') - 4 + j * 4, 50, 0.18).transform} rotate(${rot * tw}deg) translateX(${(j - 1) * 30 * tw}px)`}}>
              <Ic k="pin" size={80} color={ok ? C.red : C.mid} />
              <div>
                <div style={{fontSize: 28, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.mid}}>{lab}</div>
                <div style={{fontSize: 40, fontWeight: 700, marginTop: 6, whiteSpace: 'nowrap'}}>{end}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  if (i === 4) {
    const nb = e('d5nao');
    return (
      <>
        <Phone x={104} y={approach(f, e('d5') - 6, 540, 400, 0.15)} w={420} scroll={0} img="img/ig-perfil.png" style={{opacity: clamp(arrive(f, e('d5') - 6, 0.2) * 2)}} />
        <div style={abs({left: 600, right: 84, top: 520, background: '#fff', border: `3px solid ${C.gray}`, borderRadius: 40, padding: '36px 34px', boxShadow: '0 20px 40px rgba(18,18,22,.10)', ...entra(f, e('d5link') - 6, 50, 0.18), transform: `${entra(f, e('d5link') - 6, 50, 0.18).transform} translateX(${12 * Math.sin((f - nb) * 0.9) * pulse(f, nb + 2, 16)}px)`})}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <Logo k="ig" h={56} />
            <span style={{fontSize: 30, fontWeight: 700, color: C.t2}}>Link da bio</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 26, fontSize: 40, fontWeight: 700}}>
            <Ic k="link" size={50} color={C.ink} />
            Agendar
          </div>
        </div>
        <div style={abs({left: 600, right: 84, top: 860, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, transform: `scale(${spring(f, nb - 4, 0.35, 0.5)})`})}>
          <Ic k="x" size={190} color={C.red} />
          <div style={{fontSize: 44, fontWeight: 800, color: C.red, textTransform: 'uppercase'}}>Não abria</div>
        </div>
      </>
    );
  }
  const TH = [
    ['ana-10.jpg', 84, 470, -7, 1.0],
    ['maria-10.jpg', 400, 560, 5, 0.86],
    ['familia-10.jpg', 690, 440, -3, 0.94],
  ] as const;
  const pd = e('d6padrao');
  return (
    <>
      {TH.map(([im, x, y, r, s], j) => {
        const tw = pulse(f, pd - 2 + j * 2, 18);
        return (
          <div key={im} style={abs({left: x, top: y, width: 300 * s, height: 530 * s, borderRadius: 30, overflow: 'hidden', border: '6px solid #fff', boxShadow: '0 24px 50px rgba(18,18,22,.18)', transform: `rotate(${r + 6 * tw * (j % 2 ? 1 : -1)}deg)`, ...entra(f, e('d6videos') - 6 + j * 3, 60, 0.18)})}>
            <Img src={staticFile(`img/${im}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div style={abs({left: 0, right: 0, bottom: [40, 160, 20][j], textAlign: 'center', padding: '0 14px', color: '#fff', fontWeight: [800, 400, 600][j], fontSize: [34, 22, 28][j], fontFamily: j === 1 ? 'serif' : 'P', textShadow: '0 2px 6px rgba(0,0,0,.6)', background: j === 2 ? 'rgba(0,0,0,.55)' : 'none'})}>
              {['Depoimento', 'paciente', 'Saúde Day'][j]}
            </div>
          </div>
        );
      })}
      <div style={abs({left: 84, right: 84, top: 1050, display: 'flex', gap: 22, flexWrap: 'wrap'})}>
        <Pill f={f} s={e('d6bons') - 4}>
          <Bola k="check" size={56} />
          Conteúdo bom
        </Pill>
        <Pill f={f} s={pd - 6} style={{border: `5px dashed ${C.red}`, color: C.red}}>
          <Bola k="x" size={56} />
          Cada vídeo de um jeito
        </Pill>
      </div>
    </>
  );
};
const P04: React.FC<SP> = ({f, len, e}) => {
  const st = DIAG.map(([k]) => e(k) - 6);
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Kick f={f} t="Diagnóstico" />
      <div style={abs({left: 84, right: 84, top: 270, display: 'flex', gap: 14})}>
        {DIAG.map(([k], i) => {
          const on = spring(f, st[i], 0.35, 0.6);
          return <div key={k} style={{flex: 1, height: 14, borderRadius: 7, background: C.gray, overflow: 'hidden'}}><div style={{height: '100%', width: `${100 * clamp(on)}%`, background: C.red}} /></div>;
        })}
      </div>
      {DIAG.map(([k, t], i) => {
        const s = st[i], end = i < 5 ? st[i + 1] : len + 20;
        if (f < s - 2 || f >= end) return null;
        const a = arrive(f, s, 0.16);
        const x = E.exit(prog(f, end - 9, 8));
        return (
          <AbsoluteFill key={k} style={{opacity: clamp(a * 1.6) * (1 - x), transform: `translateY(${-90 * x}px)`}}>
            <DiagVis i={i} f={f} e={e} />
            <div style={abs({left: 84, right: 84, top: 1450, display: 'flex', alignItems: 'flex-start', gap: 34, ...entra(f, s, 50, 0.18)})}>
              <Plus size={120} label={String(i + 1)} style={{transform: `scale(${0.6 + 0.4 * spring(f, s, 0.4, 0.6)})`}} />
              <div style={{fontSize: 70, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.04}}>{t}</div>
            </div>
          </AbsoluteFill>
        );
      })}
    </Stage>
  );
};

// P05: ponto de atenção: o CNPJ inapto (dados do PDF, página 5)
const RISCOS = [
  ['g', 'Verificação do Google', 'c_verif'],
  ['receipt', 'Nota fiscal', 'c_nota'],
  ['card', 'Maquininha', 'c_maquininha'],
] as const;
const P05: React.FC<SP> = ({f, len, e}) => {
  const ina = e('c_inapto');
  const st = spring(f, ina - 4, 0.3, 0.45);
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <Kick f={f} t="Ponto de atenção" icon={<Bola k="warning" size={62} />} />
      <div style={abs({left: 84, right: 84, top: 300, background: '#fff', color: C.ink, borderRadius: 48, padding: '44px 52px', ...entra(f, 3, 70, 0.15)})}>
        <div style={{fontSize: 28, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.mid}}>Cadastro na Receita Federal</div>
        {[
          ['Empresa', 'Clínica J Lima Ltda'],
          ['CNPJ', '29.598.840/0001-80'],
        ].map(([a, b]) => (
          <div key={a} style={{marginTop: 34}}>
            <div style={{fontSize: 28, color: C.t2, fontWeight: 500}}>{a}</div>
            <div style={{fontSize: 52, fontWeight: 800, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'}}>{b}</div>
          </div>
        ))}
        <div style={{marginTop: 34, display: 'flex', alignItems: 'center', gap: 36}}>
          <div>
            <div style={{fontSize: 28, color: C.t2, fontWeight: 500}}>Situação</div>
            <div style={{height: 64}} />
          </div>
          <div style={{border: `8px solid ${C.red}`, color: C.red, borderRadius: 22, padding: '6px 34px', fontSize: 76, fontWeight: 800, letterSpacing: '.06em', opacity: clamp(st * 3), transform: `rotate(${-8 * st}deg) scale(${lerp(1.8, 1, clamp(st))})`}}>INAPTA</div>
        </div>
        <div style={{marginTop: 22, fontSize: 32, color: C.t2, ...entra(f, e('c_declaracoes') - 4, 20, 0.2)}}>desde 27/05/2026, por declarações em atraso</div>
      </div>
      <div style={abs({left: 84, top: 1090, fontSize: 40, fontWeight: 700, color: '#c9cad0', ...entra(f, e('c_travar') - 6, 30)})}>Isso pode travar:</div>
      <div style={abs({left: 84, right: 84, top: 1170, display: 'flex', flexDirection: 'column', gap: 24})}>
        {RISCOS.map(([ic, t, k]) => (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 30, background: C.panel, borderRadius: 36, padding: '30px 40px', fontSize: 44, fontWeight: 700, ...entra(f, e(k) - 6, 50, 0.18)}}>
            {ic === 'g' ? <span style={{width: 72, height: 72, borderRadius: 22, background: '#fff', display: 'grid', placeItems: 'center'}}><Logo k="g" h={46} /></span> : <Bola k={ic} size={72} bg="#fff" color={C.ink} />}
            {t}
          </div>
        ))}
      </div>
    </Stage>
  );
};

// P06: a solução: passo a passo com o contador, o mesmo endereço em todo lugar
const UNI = [
  ['id', 'Receita'],
  ['g', 'Google'],
  ['globe', 'Site'],
] as const;
const P06: React.FC<SP> = ({f, len, e}) => {
  const me = e('c_mesmo');
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Kick f={f} t="O que a gente faz" />
      <H top={250} size={96} f={f} s1={2} s2={e('c_contador') - 4} l1="Passo a passo" l2="com o contador." />
      <div style={abs({left: 84, right: 84, top: 620, background: '#fff', borderRadius: 48, padding: '16px 48px', boxShadow: '0 30px 60px rgba(18,18,22,.10)', ...entra(f, 8, 60, 0.15)})}>
        {UNI.map(([ic, t], j) => {
          const r = E.expr(prog(f, me - 4 + j * 5, 12));
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '40px 0', borderBottom: j < 2 ? `3px solid ${C.gray}` : 'none'}}>
              {ic === 'g' ? <span style={{width: 84, height: 84, borderRadius: 26, background: C.soft, display: 'grid', placeItems: 'center', flex: 'none'}}><Logo k="g" h={50} /></span> : <Bola k={ic} size={84} bg={C.soft} color={C.ink} />}
              <div style={{flex: 1}}>
                <div style={{fontSize: 28, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.mid}}>{t}</div>
                <div style={{position: 'relative', height: 60, marginTop: 4}}>
                  <div style={abs({left: 0, top: 0, fontSize: 44, fontWeight: 700, color: C.mid, opacity: 1 - r, transform: `translateY(${-30 * r}px)`})}>{j === 2 ? 'endereço antigo' : 'Quadra Central, Lote I'}</div>
                  <div style={abs({left: 0, top: 0, fontSize: 44, fontWeight: 700, opacity: r, transform: `translateY(${30 * (1 - r)}px)`})}>Quadra 7/9, CL 13</div>
                </div>
              </div>
              <span style={{transform: `scale(${spring(f, me + 2 + j * 5, 0.4, 0.55)})`}}>
                <Bola k="check" size={70} />
              </span>
            </div>
          );
        })}
      </div>
      <div style={abs({left: 0, right: 0, top: 1460, display: 'flex', justifyContent: 'center'})}>
        <Pill f={f} s={e('c_endereco') - 2} red>
          <Ic k="pin" size={48} color="#fff" />
          O mesmo endereço em todo lugar
        </Pill>
      </div>
      <div style={abs({left: 84, right: 84, top: 1600, textAlign: 'center', fontSize: 32, color: C.t2, ...entra(f, e('c_atualizada') - 10, 20)})}>assim que a Receita for atualizada</div>
    </Stage>
  );
};

// P07: a proposta em 4 entregas (mesma grade das 4 frentes)
const ENTREGAS = [
  ['01', 'Site no ar', 'globe'],
  ['02', 'Presença', 'pin'],
  ['03', 'CRM de pacientes', 'users'],
  ['04', 'Organização', 'chart'],
] as const;
const P07: React.FC<SP> = ({f, len, e}) => {
  const q = e('e_quatro');
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <div style={abs({left: 84, top: 150, fontSize: 32, fontWeight: 700, letterSpacing: '.14em', color: C.red, ...entra(f, 0, 30)})}>A PROPOSTA</div>
      <H top={220} size={110} f={f} s1={0} s2={q - 4} l1="4 entregas." color="#fff" />
      <div style={abs({left: 84, right: 84, top: 520, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32})}>
        {ENTREGAS.map(([n, t, ic], i) => (
          <div key={n} style={{background: C.panel, borderRadius: 44, padding: '44px 40px', height: 460, display: 'flex', flexDirection: 'column', gap: 30, ...entra(f, 6 + i * 3, 60, 0.18)}}>
            <span style={{transform: `scale(${0.5 + 0.5 * spring(f, q - 4 + i * 3, 0.4, 0.6)})`, transformOrigin: '0 50%'}}>
              <Bola k={ic} size={96} />
            </span>
            <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '.14em', color: C.red}}>{n}</div>
            <div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.12}}>{t}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
};

// P08: entrega 1, o site no ar e mantido
const P08: React.FC<SP> = ({f, len, e}) => (
  <Stage bg={C.soft} f={f} len={len}>
    <Tag n="1" t="Site no ar" f={f} />
    <Phone x={260} y={approach(f, 2, 1300, 330, 0.15)} w={560} scroll={tween(f, 6, len, 0, 900, E.cam)} />
    <div style={abs({left: 0, right: 0, top: 1450, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22})}>
      <Pill f={f} s={e('e1mantido') - 4} red>
        <Ic k="calcheck" size={50} color="#fff" />
        Mantido todo mês
      </Pill>
      <Pill f={f} s={e('e1end') - 4}>
        <Bola k="globe" size={56} />
        No endereço da clínica
      </Pill>
    </div>
  </Stage>
);

// P09: entrega 2, a presença: Google, Instagram, Facebook e WhatsApp com os mesmos dados
const CANAIS = [
  ['g', 'e2google'],
  ['ig', 'e2insta'],
  ['fb', 'e2face'],
  ['wa', 'e2wa'],
] as const;
const DADOS = [
  ['pin', 'Quadra 7/9, CL 13', 'e2end'],
  ['phone', '(61) 99825-5551', 'e2tel'],
  ['clock', 'Mesmo horário', 'e2hor'],
] as const;
const P09: React.FC<SP> = ({f, len, e}) => {
  const cx = (i: number) => 84 + 100 + i * 237;
  const lig = E.expr(prog(f, e('e2mesmo') - 6, 20));
  return (
    <Stage bg="#fff" f={f} len={len}>
      <Tag n="2" t="Presença" f={f} />
      {CANAIS.map(([k, ev], i) => (
        <div key={k} style={abs({left: cx(i) - 100, top: 340, width: 200, height: 200, borderRadius: 56, background: C.soft, display: 'grid', placeItems: 'center', transform: `scale(${spring(f, 4 + i * 4, 0.35, 0.55) * (1 + 0.12 * pulse(f, e(ev) - 2, 14))})`})}>
          <div style={{transform: `scale(${spring(f, e(ev) - 6, 0.35, 0.5)})`}}>
            {k === 'fb' ? <Img src={staticFile('logos/facebook.svg')} style={{width: 120, height: 120, display: 'block'}} /> : <Logo k={k as 'g'} h={k === 'g' ? 100 : 120} />}
          </div>
        </div>
      ))}
      <svg style={abs({left: 0, top: 0})} width={1080} height={1920}>
        {CANAIS.map(([k], i) => (
          <path key={k} d={`M ${cx(i)} 550 C ${cx(i)} 610 540 600 540 660`} stroke={C.red} strokeWidth={6} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lig} />
        ))}
      </svg>
      <div style={abs({left: 84, right: 84, top: 670, background: C.soft, borderRadius: 48, padding: '10px 48px', ...entra(f, 16, 50, 0.16)})}>
        {DADOS.map(([ic, t, k], j) => {
          const a = arrive(f, e(k) - 4, 0.2);
          return (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 28, padding: '30px 0', borderBottom: j < 2 ? `3px solid ${C.gray}` : 'none'}}>
              <Bola k={ic} size={72} bg="#fff" color={C.red} />
              <span style={{fontSize: 44, fontWeight: 700, opacity: clamp(0.15 + a), transform: `translateX(${(1 - a) * 30}px)`}}>{t}</span>
            </div>
          );
        })}
      </div>
      <div style={abs({left: 84, right: 84, top: 1310, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start'})}>
        <Pill f={f} s={e('e2pub') - 4}>
          <Bola k="cal" size={56} />
          1 publicação por semana
        </Pill>
        <Pill f={f} s={e('e2resp') - 4}>
          <Bola k="chat" size={56} />
          Resposta a todas as avaliações
        </Pill>
        <div style={{display: 'flex', gap: 10, marginLeft: 26, ...entra(f, e('e2aval') - 6, 20)}}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={56} on={spring(f, e('e2aval') - 2 + i * 3, 0.4, 0.6)} />
          ))}
        </div>
      </div>
    </Stage>
  );
};

// P10: entrega 3, o CRM de pacientes: cada contato com a etiqueta certa, lembrete no WhatsApp
const ETQ = [
  ['Chamou', 'e3chamou', '#55565e'],
  ['Marcou', 'e3marcou', '#1E8E3E'],
  ['Faltou', 'e3faltou', '#EB2026'],
  ['Precisa voltar', 'e3voltar', '#121216'],
] as const;
const P10: React.FC<SP> = ({f, len, e}) => {
  const lb = e('e3lembrete');
  const msg = arrive(f, lb - 6, 0.18);
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Tag n="3" t="CRM de pacientes" f={f} />
      <div style={abs({left: 84, right: 84, top: 320, background: '#fff', borderRadius: 48, overflow: 'hidden', boxShadow: '0 30px 60px rgba(18,18,22,.10)', ...entra(f, 3, 60, 0.15)})}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '30px 44px', borderBottom: `3px solid ${C.gray}`}}>
          <span style={{transform: `scale(${1 + 0.12 * pulse(f, e('e3wa') - 2, 16)})`}}>
            <Logo k="wa" h={64} />
          </span>
          <span style={{fontSize: 40, fontWeight: 800}}>Pacientes</span>
          <span style={{marginLeft: 'auto', fontSize: 30, color: C.t2}}>organizados</span>
        </div>
        {ETQ.map(([t, k, cor], j) => {
          const a = spring(f, e(k) - 4, 0.35, 0.6);
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '28px 44px', borderBottom: j < 3 ? `3px solid ${C.gray}` : 'none', ...entra(f, 6 + j * 3, 30, 0.2)}}>
              <span style={{width: 84, height: 84, borderRadius: '50%', background: C.soft, display: 'grid', placeItems: 'center', flex: 'none'}}>
                <Ic k="user" size={44} color={C.mid} />
              </span>
              <div style={{flex: 1}}>
                <div style={{width: [260, 320, 220, 290][j] * E.expr(prog(f, e('e3lista') - 4 + j * 3, 14)), height: 26, borderRadius: 13, background: C.gray}} />
                <div style={{width: [180, 140, 200, 160][j] * E.expr(prog(f, e('e3lista') + j * 3, 14)), height: 20, borderRadius: 10, background: C.soft, marginTop: 14}} />
              </div>
              <span style={{background: cor, color: '#fff', padding: '14px 28px', borderRadius: 999, fontSize: 32, fontWeight: 700, whiteSpace: 'nowrap', opacity: clamp(a * 3), transform: `scale(${0.5 + 0.5 * a})`, transformOrigin: '100% 50%'}}>{t}</span>
            </div>
          );
        })}
      </div>
      {/* lembrete de consulta no WhatsApp */}
      <div style={abs({left: 300, right: 84, top: 1170, background: '#D9FDD3', borderRadius: '36px 36px 8px 36px', padding: '28px 36px', fontSize: 36, fontWeight: 500, lineHeight: 1.3, boxShadow: '0 16px 40px rgba(18,18,22,.10)', opacity: clamp(msg * 2), transform: `translateY(${(1 - msg) * 60}px) scale(${0.94 + 0.06 * msg})`, transformOrigin: '100% 100%'})}>
        <div style={{fontSize: 26, fontWeight: 700, color: '#1E8E3E', marginBottom: 6}}>Lembrete de consulta</div>
        Sua consulta na MedicMais é amanhã. Confirma?
      </div>
      <div style={abs({left: 84, right: 84, top: 1440, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22})}>
        {[
          ['down', 'Menos', 'faltas', 'e3menos'],
          ['up', 'Mais', 'retornos', 'e3mais'],
          ['check', 'Nenhum', 'orçamento esquecido', 'e3nenhum'],
        ].map(([ic, a, b, k]) => (
          <div key={k} style={{background: C.ink, color: '#fff', borderRadius: 36, padding: '30px 26px', display: 'flex', flexDirection: 'column', gap: 16, ...entra(f, e(k) - 6, 40, 0.2)}}>
            <Bola k={ic} size={64} />
            <div style={{fontSize: 40, fontWeight: 800, lineHeight: 1}}>{a}</div>
            <div style={{fontSize: 30, fontWeight: 500, color: '#c9cad0', lineHeight: 1.2}}>{b}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
};

// P11: entrega 4, a organização do atendimento e o painel do mês
const ORG = [
  ['chat', 'Roteiro de conversa', 'e4roteiro'],
  ['users', 'Treinamento da recepção', 'e4trein'],
] as const;
const P11: React.FC<SP> = ({f, len, e}) => {
  const pn = e('e4painel');
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <Tag n="4" t="Organização" f={f} />
      <div style={abs({left: 84, right: 84, top: 330, display: 'flex', flexDirection: 'column', gap: 22})}>
        {ORG.map(([ic, t, k], i) => (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 28, background: C.panel, borderRadius: 36, padding: '28px 36px', fontSize: 44, fontWeight: 700, ...entra(f, e(k) - 6 + 0 * i, 50, 0.18), outline: `4px solid rgba(235,32,38,${pulse(f, e(k) - 2, 20)})`}}>
            <Bola k={ic} size={72} />
            {t}
          </div>
        ))}
      </div>
      {/* o painel do mês */}
      <div style={abs({left: 84, right: 84, top: 680, height: 560, background: '#fff', color: C.ink, borderRadius: 44, padding: '36px 44px', ...entra(f, 4, 70, 0.15)})}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, fontSize: 38, fontWeight: 800}}>
          <Ic k="chart" size={50} color={C.red} />
          Painel do mês
        </div>
        <div style={abs({left: 44, right: 44, bottom: 40, height: 340, display: 'flex', alignItems: 'flex-end', gap: 26, borderBottom: `4px solid ${C.ink}`})}>
          {[0.42, 0.58, 0.5, 0.72, 0.66, 0.9].map((h, i) => (
            <div key={i} style={{flex: 1, height: `${100 * h * (0.12 + 0.88 * E.expr(prog(f, pn + 2 + i * 3, 16)))}%`, background: i === 5 ? C.red : C.gray, borderRadius: '18px 18px 0 0'}} />
          ))}
        </div>
      </div>
      <H top={1330} size={92} f={f} s1={e('e4numero') - 6} s2={e('e4achismo') - 6} l1="Decidir com número," l2="não com achismo." color="#fff" />
    </Stage>
  );
};

// P12: o vídeo: vocês gravam com o celular, a gente edita (cada palavra acende uma peça no vídeo editado)
const P12: React.FC<SP> = ({f, len, e}) => {
  const tr = e('v_transforma');
  const ed = arrive(f, tr - 6, 0.16);
  const on = (k: string) => spring(f, e(k) - 4, 0.35, 0.6);
  const quadro = (x: number, y: number, rot: number, children: React.ReactNode, st: React.CSSProperties) => (
    <div style={abs({left: x, top: y, width: 430, height: 800, borderRadius: 60, background: C.ink, padding: 14, boxShadow: '0 40px 80px rgba(0,0,0,.25)', opacity: st.opacity ?? 1, transform: `${st.transform ?? ''} rotate(${rot}deg)`})}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden'}}>{children}</div>
    </div>
  );
  return (
    <Stage bg={C.red} color="#fff" f={f} len={len}>
      <div style={abs({left: 84, top: 150, fontSize: 32, fontWeight: 700, letterSpacing: '.14em', opacity: 0.9, ...entra(f, 0, 30)})}>CONTEÚDO E VÍDEO</div>
      <div style={abs({left: 84, right: 84, top: 210, fontSize: 78, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04})}>
        <div style={entra(f, 3, 40)}>Vocês gravam.</div>
        <div style={{color: C.ink, ...entra(f, tr - 4, 40)}}>A gente edita.</div>
      </div>
      {/* bruto, gravado no celular */}
      {quadro(84, 470, -4, (
        <>
          <OffthreadVideo src={staticFile('clips/ana.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={abs({left: 24, top: 24, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,.5)', color: '#fff', padding: '8px 18px', borderRadius: 999, fontSize: 26, fontWeight: 700})}>
            <span style={{width: 16, height: 16, borderRadius: '50%', background: C.red, opacity: Math.floor(f / 12) % 2 ? 1 : 0.3}} />
            REC
          </div>
        </>
      ), entra(f, 4, 80, 0.15))}
      {/* editado: legenda, capa, logo, trilha, chamada */}
      {quadro(566, 470, 3, (
        <>
          <OffthreadVideo src={staticFile('clips/ana.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={abs({left: 0, right: 0, top: 0, height: 150, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - clamp(spring(f, tr + 2, 0.3, 0.7))) * -150}px)`})}>
            <Img src={staticFile('img/mm-logo-escrita.png')} style={{height: 64, transform: `scale(${0.6 + 0.4 * on('v_logo')})`}} />
          </div>
          <div style={abs({left: 0, right: 0, top: '51%', height: '30%', display: 'grid', placeItems: 'center', padding: '0 26px', background: '#fff', textAlign: 'center', fontSize: 42, fontWeight: 800, color: C.ink, lineHeight: 1.12, opacity: clamp(on('v_legenda') * 2), transform: `scaleY(${clamp(on('v_legenda'))})`})}>Nesta eu confio de olhos fechados.</div>
          <div style={abs({right: 22, top: 172, width: 70, height: 70, borderRadius: 22, background: C.red, display: 'grid', placeItems: 'center', transform: `scale(${on('v_trilha') * (1 + 0.1 * Math.sin(f * 0.5))})`})}>
            <Ic k="music" size={40} color="#fff" />
          </div>
          <div style={abs({left: 22, right: 22, bottom: 40, height: 96, borderRadius: 999, background: C.wa, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 27, whiteSpace: 'nowrap', fontWeight: 700, transform: `translateY(${(1 - clamp(on('v_chamada'))) * 160}px)`})}>
            <svg viewBox="0 0 24 24" width={44} height={44}><path d={WA_PATH} fill="#fff" /></svg>
            Agende pelo WhatsApp
          </div>
        </>
      ), {opacity: clamp(ed * 2), transform: `translateY(${(1 - ed) * 80}px) scale(${0.94 + 0.06 * ed})`})}
      <div style={abs({left: 84, right: 84, top: 1340, display: 'flex', flexWrap: 'wrap', gap: 18})}>
        {[
          ['v_roteiro', 'Roteiro toda semana', 'file'],
          ['v_legenda', 'Legenda grande', 'cc'],
          ['v_capa', 'Capa', 'imgsq'],
          ['v_logo', 'Logo', 'check'],
          ['v_trilha', 'Trilha', 'music'],
          ['v_chamada', 'Chamada pro WhatsApp', 'chat'],
        ].map(([k, t, ic]) => (
          <span key={k} style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: '#fff', color: C.ink, padding: '18px 30px 18px 20px', borderRadius: 999, fontSize: 34, fontWeight: 600, whiteSpace: 'nowrap', ...entra(f, e(k) - 6, 30, 0.22)}}>
            <Ic k={ic} size={40} color={C.red} />
            {t}
          </span>
        ))}
      </div>
    </Stage>
  );
};

// P13: o Saúde Day entra nisso: convite antes, vídeo resumo depois, agenda cheia no mês seguinte
const P13: React.FC<SP> = ({f, len, e}) => {
  const rs = e('s_resumo');
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <H top={170} size={96} f={f} s1={0} s2={e('s_agenda') - 4} l1="Saúde Day" l2="vira agenda cheia." />
      <div style={abs({left: 84, top: 520, width: 520, height: 650, borderRadius: 40, overflow: 'hidden', boxShadow: '0 30px 60px rgba(18,18,22,.18)', transform: `rotate(-3deg) ${entra(f, 2, 80, 0.15).transform}`, opacity: entra(f, 2).opacity})}>
        <Img src={staticFile('img/saude-day-flyer.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0'}} />
        <div style={abs({inset: 0, display: 'grid', placeItems: 'center', background: `rgba(18,18,22,${0.35 * clamp(spring(f, rs - 4, 0.3, 0.7))})`})}>
          <div style={{width: 150, height: 150, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', transform: `scale(${spring(f, rs - 2, 0.35, 0.55)})`}}>
            <Ic k="play" size={76} color={C.red} style={{marginLeft: 10}} />
          </div>
        </div>
      </div>
      <div style={abs({left: 650, right: 60, top: 560, display: 'flex', flexDirection: 'column', gap: 40})}>
        {[
          ['Antes', 'Convite', 's_convite', 'mega'],
          ['Depois', 'Vídeo resumo', 's_resumo', 'video'],
          ['Mês seguinte', 'Agenda cheia', 's_agenda', 'calcheck'],
        ].map(([a, b, k, ic], j) => (
          <div key={k} style={{...entra(f, e(k) - 6, 40, 0.2)}}>
            <Bola k={ic} size={80} bg={j === 2 ? C.red : C.ink} />
            <div style={{fontSize: 26, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.mid, marginTop: 14}}>{a}</div>
            <div style={{fontSize: 42, fontWeight: 800, lineHeight: 1.1}}>{b}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
};

// P14: 90 dias: arrumar a casa, ganhar ritmo, medir e ajustar
const MESES = [
  ['Mês 1', 'Arrumar a casa', 'n_m1', 'wrench'],
  ['Mês 2', 'Ganhar ritmo', 'n_m2', 'trend'],
  ['Mês 3', 'Medir e ajustar', 'n_m3', 'sliders'],
] as const;
const P14: React.FC<SP> = ({f, len, e}) => {
  const Y = [600, 960, 1320];
  const lin = (Y[2] - Y[0]) * E.expr(prog(f, e('n_m1'), e('n_m3') - e('n_m1') + 10));
  return (
    <Stage bg="#fff" f={f} len={len}>
      <Kick f={f} t="O caminho" />
      <div style={abs({left: 84, top: 250, display: 'flex', alignItems: 'baseline', gap: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', ...entra(f, 2, 50)})}>
        <span style={{fontSize: 220, lineHeight: 1, color: C.red, fontVariantNumeric: 'tabular-nums'}}>{Math.round(90 * E.expr(prog(f, e('n_noventa') - 6, 20)))}</span>
        <span style={{fontSize: 100}}>dias</span>
      </div>
      <div style={abs({left: 84 + 60 - 4, top: Y[0] + 60, width: 8, height: lin, background: C.red, borderRadius: 4})} />
      {MESES.map(([m, t, k, ic], j) => (
        <div key={k} style={abs({left: 84, right: 84, top: Y[j], display: 'flex', alignItems: 'center', gap: 40, ...entra(f, e(k) - 6, 50, 0.18)})}>
          <Plus size={120} label={String(j + 1)} style={{transform: `scale(${0.6 + 0.4 * spring(f, e(k) - 4, 0.4, 0.6)})`}} />
          <div style={{flex: 1, background: C.soft, borderRadius: 40, padding: '34px 40px', display: 'flex', alignItems: 'center', gap: 28}}>
            <Ic k={ic} size={70} color={C.red} />
            <div>
              <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.red}}>{m}</div>
              <div style={{fontSize: 54, fontWeight: 800, lineHeight: 1.1}}>{t}</div>
            </div>
          </div>
        </div>
      ))}
    </Stage>
  );
};

// P15: quanto custa: a implantação, paga uma vez (valores do PDF, página 13)
const IMPL = [
  ['Site', 997, 'r_site'],
  ['CRM', 697, 'r_crm'],
  ['Organização', 497, 'r_org'],
] as const;
const P15: React.FC<SP> = ({f, len, e}) => {
  const mil = e('r_mil');
  const v = Math.round(1790 * E.expr(prog(f, mil - 6, 24)));
  const risco = E.expr(prog(f, mil - 10, 10));
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Kick f={f} t="Investimento" />
      <H top={250} size={110} f={f} s1={0} s2={e('r_quanto') + 6} l1="Quanto" l2="custa?" />
      <div style={abs({left: 84, right: 84, top: 600, background: '#fff', borderRadius: 52, padding: '44px 52px', boxShadow: '0 30px 60px rgba(18,18,22,.10)', ...entra(f, e('r_impl') - 6, 60, 0.15)})}>
        <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.red}}>Implantação</div>
        <div style={{fontSize: 40, fontWeight: 700, marginTop: 6, ...entra(f, e('r_umavez') - 4, 20)}}>paga uma vez</div>
        <div style={{marginTop: 26}}>
          {IMPL.map(([t, p, k]) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '24px 0', borderBottom: `3px solid ${C.gray}`, fontSize: 42, fontWeight: 600, ...entra(f, e(k) - 4, 30, 0.2)}}>
              <Bola k="check" size={54} />
              {t}
              <span style={{marginLeft: 'auto', color: C.mid, fontWeight: 500, fontVariantNumeric: 'tabular-nums'}}>R$ {brl(p)}</span>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 34}}>
          <div style={{...entra(f, mil - 12, 20)}}>
            <div style={{fontSize: 30, color: C.t2, fontWeight: 500}}>Os três juntos</div>
            <div style={{fontSize: 40, color: C.mid, fontWeight: 600, marginTop: 6}}>
              <Risco p={risco} color={C.mid}>R$ 2.191</Risco>
            </div>
          </div>
          <div style={{fontSize: 120, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: C.red, fontVariantNumeric: 'tabular-nums', ...entra(f, mil - 8, 40, 0.2)}}>
            <span style={{fontSize: 54, marginRight: 10}}>R$</span>
            {brl(v)}
          </div>
        </div>
      </div>
      <div style={abs({left: 0, right: 0, top: 1520, display: 'flex', justifyContent: 'center'})}>
        <Pill f={f} s={e('r_tres') - 4} red>
          <Ic k="card" size={48} color="#fff" />
          em até 3x
        </Pill>
      </div>
    </Stage>
  );
};

// P16: os planos por mês: Presença e o recomendado, Presença + Vídeos
const P16: React.FC<SP> = ({f, len, e}) => {
  const rc = e('r_recom');
  const dim = E.expr(prog(f, rc - 4, 14));
  const v1 = Math.round(497 * E.expr(prog(f, e('r_497') - 4, 20)));
  const v2 = Math.round(859 * E.expr(prog(f, e('r_859') - 4, 20)));
  const plano = (top: number, nome: React.ReactNode, v: number, s: number, rec: boolean, extra?: React.ReactNode) => (
    <div style={abs({left: 84, right: 84, top: top + 8 * Math.sin((f + top) * 0.045), background: rec ? '#fff' : C.panel, color: rec ? C.ink : '#fff', borderRadius: 48, padding: '44px 52px', border: rec ? `6px solid ${C.red}` : 'none', ...entra(f, s, 60, 0.16), opacity: rec ? entra(f, s).opacity : clamp(entra(f, s).opacity as number) * (1 - 0.45 * dim)})}>
      <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.red}}>Plano mensal</div>
      <div style={{fontSize: 60, fontWeight: 800, marginTop: 8}}>{nome}</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 18, fontVariantNumeric: 'tabular-nums'}}>
        <span style={{fontSize: 44, fontWeight: 700}}>R$</span>
        <span style={{fontSize: 130, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: rec ? C.red : '#fff'}}>{v}</span>
        <span style={{fontSize: 40, fontWeight: 600, color: rec ? C.t2 : '#c9cad0'}}>/mês</span>
      </div>
      {extra}
    </div>
  );
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <div style={abs({left: 84, top: 150, fontSize: 32, fontWeight: 700, letterSpacing: '.14em', color: C.red, ...entra(f, 0, 30)})}>DEPOIS, POR MÊS</div>
      {plano(240, 'Presença', v1, 3, false)}
      {plano(760, (
        <span style={{display: 'flex', alignItems: 'center', gap: 18}}>
          Presença
          <Plus size={64} />
          Vídeos
        </span>
      ), v2, rc + 2, true, (
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 26, fontSize: 38, fontWeight: 600, ...entra(f, e('r_oito') - 6, 20, 0.2)}}>
          <Bola k="video" size={60} />
          até 8 vídeos editados por mês
        </div>
      ))}
      <div style={abs({right: 110, top: 730, background: C.red, color: '#fff', padding: '16px 32px', borderRadius: 999, fontSize: 32, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', zIndex: 3, transform: `scale(${spring(f, rc - 2, 0.35, 0.5)})`, transformOrigin: '100% 50%'})}>Recomendado</div>
      <div style={abs({left: 84, right: 84, top: 1420, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start'})}>
        <Pill f={f} s={e('r_contrato') - 4} dark>
          <Ic k="file" size={46} color={C.red} />
          Contrato mínimo de 6 meses
        </Pill>
        <Pill f={f} s={e('r_validos') - 4} dark>
          <Ic k="clock" size={46} color={C.red} />
          Valores válidos por 15 dias
        </Pill>
      </div>
    </Stage>
  );
};

// P17: o fecho (como a última página do PDF): Sobradinho já confia; falta o celular mostrar isso
const P17: React.FC<SP> = ({f, len, e}) => {
  const fa = e('f_falta');
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <div style={abs({left: 84, top: 220, transform: `scale(${spring(f, 2, 0.3, 0.6)})`, transformOrigin: '0 50%'})}>
        <Img src={staticFile('img/mm-logo-coracao-branco.png')} style={{height: 200}} />
      </div>
      <div style={abs({left: 84, right: 84, top: 520, fontSize: 100, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em', lineHeight: 1.04})}>
        <div style={entra(f, 4, 50)}>Sobradinho</div>
        <div style={entra(f, e('f_confia') - 6, 50)}>já confia na</div>
        <div style={entra(f, e('f_confia') - 2, 50)}>MedicMais.</div>
      </div>
      <div style={abs({left: 84, right: 84, top: 940, fontSize: 64, fontWeight: 800, color: C.red, lineHeight: 1.1, ...entra(f, fa - 4, 40)})}>Falta o celular mostrar isso.</div>
      <Phone x={280} y={approach(f, e('f_celular') - 8, 1950, 1180, 0.14)} w={520} scroll={tween(f, e('f_celular'), 60, 0, 200, E.cam)} />
    </Stage>
  );
};

const SCENES: Record<string, React.FC<SP>> = {P01, P02, P03, P04, P05, P06, P07, P08, P09, P10, P11, P12, P13, P14, P15, P16, P17, K01, K02, K03, K04, K05, K06, K07, K08, K09, K10, K11, K12, K13, K14, K15, K16, K17, K18, K19, K20, K21, K22, K23};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.soft}}>
      <style>{FONTS}</style>
      {KEYS.map((k) => {
        const S = SCENES[k];
        const from = INI[k];
        const len = fim(k) - from;
        return (
          <Sequence key={k} from={from} durationInFrames={len} name={k}>
            <S f={frame - from} len={len} e={(n) => EV[n] - from} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
