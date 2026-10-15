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
        <path d={`M 1000 ${Y[2] + 135} C 1060 ${Y[2] + 135} 1060 ${Y[0] + 135} 1000 ${Y[0] + 135}`} stroke={C.red} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - loop} />
      </svg>
      <div style={abs({left: 84, right: 84, top: 1640, display: 'flex', alignItems: 'center', gap: 18, fontSize: 40, fontWeight: 700, color: C.red, ...entra(f, e('prova2') + 4, 30)})}>
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

const SCENES: Record<string, React.FC<SP>> = {K01, K02, K03, K04, K05, K06, K07, K08, K09, K10, K11, K12, K13, K14, K15, K16, K17, K18, K19, K20, K21, K22, K23};

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
