// Vídeo de venda do site MedicMais (9:16). 16 cenas = os quadros-chave aprovados (storyboard/gera.py),
// cada uma presa às palavras da locução da Ana Dias (cues.json, gerado por cues.py).
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import cues from './cues.json';
import {approach, arrive, clamp, E, entra, lerp, prog, pulse, spring, tween} from './kit';

const C = {red: '#EB2026', ink: '#121216', gray: '#E6E8EC', mid: '#A1A1A9', soft: '#F4F5F7', t2: '#55565e', wa: '#25D366', panel: '#1d1d23'};
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
const Phone: React.FC<{x: number; y: number; w: number; scroll: number; bar?: boolean; press?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  x, y, w, scroll, bar = true, press = 0, children, style,
}) => {
  const inner = w - 36;
  const s = inner / 390;
  const h = Math.round((w * 844) / 390);
  return (
    <div style={abs({left: x, top: y, width: w, height: h, background: C.ink, borderRadius: 84 * (w / 680), padding: 18, boxShadow: '0 40px 80px rgba(18,18,22,.22)', ...style})}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 68 * (w / 680), overflow: 'hidden', background: '#fff'}}>
        <Img src={staticFile('site/celular-pagina.png')} style={abs({left: 0, top: -scroll * s, width: inner, height: PAGE_H * s})} />
        <Img src={staticFile('site/celular-top.png')} style={abs({left: 0, top: 0, width: '100%', zIndex: 2})} />
        {bar && (
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
  <svg viewBox="0 0 24 24" width={52} height={52} fill="none" stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" style={{flex: 'none'}}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </svg>
);
const WA_PATH =
  'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.25.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.45-.15-1-.33-1.75-.65-3.1-1.3-5.1-4.4-5.25-4.6-.15-.2-1.25-1.65-1.25-3.15s.8-2.25 1.07-2.55c.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.5.25.6.85 2.07.92 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.05 1.13 1 2.09 1.32 2.39 1.47.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.08.12.08.72-.17 1.42z';

// barra de busca no estilo do site, com digitação (2 quadros por letra) e cursor vermelho
const Search: React.FC<{f: number; start: number; text: string; top: number; h?: number; fs?: number; style?: React.CSSProperties}> = ({f, start, text, top, h = 150, fs = 46, style}) => {
  const n = clamp(Math.floor((f - start) / 2), 0, text.length);
  const blink = n < text.length || Math.floor(f / 15) % 2 === 0;
  return (
    <div style={abs({left: 84, right: 84, top, height: h, background: '#fff', border: `3px solid ${C.gray}`, borderRadius: 999, display: 'flex', alignItems: 'center', gap: 30, padding: '0 54px', fontSize: fs, fontWeight: 500, ...style})}>
      {LUPA}
      <span style={{whiteSpace: 'nowrap'}}>
        {text.slice(0, n)}
        <i style={{display: 'inline-block', width: 5, height: fs * 1.25, background: C.red, marginLeft: 4, verticalAlign: 'middle', opacity: blink ? 1 : 0}} />
      </span>
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

const TILES = ['tour-4.jpg', 'ana-10.jpg', 'tour-25.7.jpg', 'maria-10.jpg', 'tour-32.jpg', 'familia-10.jpg', 'tour-13.jpg', 'tour-35.jpg', 'ana-20.jpg'];
const ROT = [-6, 4, -3, 5, -2, 7, 3, -5, 6];
const DX = [0, 30, -20, -30, 10, 25, 20, -10, -25];
const K05: React.FC<SP> = ({f, len, e}) => {
  const sp = e('espalhado');
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <H top={200} size={92} f={f} s1={0} s2={sp - 4} l1="Na internet, hoje," l2="tudo espalhado num feed." color="#fff" />
      {TILES.map((im, i) => {
        const c = i % 3, r = Math.floor(i / 3);
        const a = arrive(f, 6 + i * 2, 0.16);
        const s = arrive(f, sp + (i % 4), 0.1);
        const drift = f > sp ? (f - sp) * 0.25 : 0;
        const x = 85 + c * 310 + s * DX[i] * 1.6 + (s * (c - 1) * 30) + drift * (c - 1);
        const y = 640 + r * 360 + s * DX[(i + 3) % 9] * 1.6 + drift * (r - 1) * 0.6;
        return (
          <div key={i} style={abs({left: x, top: y, transform: `translateY(${(1 - a) * -300}px) rotate(${s * ROT[i] * 1.3}deg)`, opacity: clamp(a * 2)})}>
            <Card x={0} y={0} w={290} h={300} src={`img/${im}`} r={30} />
          </div>
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
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <H top={260} size={100} f={f} s1={0} s2={e('pesquisa') - 3} l1="Tratamento caro" l2="se pesquisa antes." />
      <div style={entra(f, 2, 60)}>
        <Search f={f} start={10} text="implante dentário sobradinho" top={760} />
      </div>
      <div style={abs({left: 84, right: 84, top: 1000, display: 'flex', flexDirection: 'column', gap: 26})}>
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
      <div style={entra(f, 0, 50)}>
        <Search f={f} start={e('buscando') - 2} text="medicmais sobradinho" top={240} />
      </div>
      <div style={abs({left: 84, right: 84, top: 470, display: 'flex', flexDirection: 'column', gap: 28})}>
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
      <H top={220} size={100} f={f} s1={0} s2={e('agendava') - 4} l1="1 em cada 3" l2="já agenda online." />
      <div style={abs({left: 84, right: 84, top: 620, fontSize: 40, lineHeight: 1.35, color: C.t2, ...entra(f, 10, 30)})}>estabelecimentos de saúde no Brasil com agendamento pela internet</div>
      <div style={abs({left: 84, right: 84, bottom: 466, height: 4, background: C.ink, transformOrigin: '0 50%', transform: `scaleX(${E.expr(prog(f, 6, 24))})`})} />
      {bar(150, 13, b22, C.gray, '2022', C.mid)}
      {bar(600, 34, b23, C.red, '2023', C.red)}
      <div style={abs({left: 84, bottom: 300, fontSize: 24, color: C.mid, fontWeight: 500, letterSpacing: '.01em', ...entra(f, 24, 20)})}>Fonte: TIC Saúde 2023, Cetic.br/NIC.br</div>
    </Stage>
  );
};

const FRENTES = [
  ['01', 'Ser encontrado'],
  ['02', 'Um toque até o WhatsApp'],
  ['03', 'Prova reunida'],
  ['04', 'Endereço de vocês'],
];
const K09: React.FC<SP> = ({f, len, e}) => {
  const q = e('quatro');
  return (
    <Stage bg={C.ink} color="#fff" f={f} len={len}>
      <H top={220} size={104} f={f} s1={0} s2={q - 4} l1="O site resolve" l2="em 4 frentes." color="#fff" />
      <div style={abs({left: 84, right: 84, top: 640, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32})}>
        {FRENTES.map(([n, t], i) => (
          <div key={n} style={{background: C.panel, borderRadius: 44, padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: 30, ...entra(f, q - 2 + i * 3, 60, 0.17)}}>
            <Plus size={96} style={{transform: `scale(${0.5 + 0.5 * spring(f, q + 2 + i * 3, 0.4, 0.6)})`, transformOrigin: '0 50%'}} />
            <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '.14em', color: C.red}}>{n}</div>
            <div style={{fontSize: 46, fontWeight: 700, lineHeight: 1.15}}>{t}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
};

const K10: React.FC<SP> = ({f, len, e}) => {
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
      {/* a busca "cai" no card: linha vermelha da barra até o card */}
      <div style={abs({left: 540 - 3, top: 460, width: 6, height: Math.max(0, 210 * E.expr(prog(f, e('nome2') - 2, 18))), background: C.red, borderRadius: 3, opacity: 1 - prog(f, rr + 10, 10)})} />
    </Stage>
  );
};

const K11: React.FC<SP> = ({f, len, e}) => {
  const pw = 600, s1 = (pw - 36) / 390;
  const tq = e('toque'), ab = e('abre');
  // rola por vários pontos da página: a barra do WhatsApp fica sempre ali
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
      {/* o WhatsApp da clínica abre a partir do botão */}
      {f >= ab - 4 && (
        <div style={abs({left: 790, width: 240, top: lerp(1700, 900, wa), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: `scale(${0.94 + 0.06 * wa})`, opacity: clamp(wa * 2), zIndex: 9})}>
          <div style={{width: 160, height: 160, borderRadius: '50%', background: C.wa, display: 'grid', placeItems: 'center', boxShadow: '0 24px 50px rgba(18,18,22,.22)'}}>
            <svg viewBox="0 0 24 24" width={88} height={88} fill="#fff">
              <path d={WA_PATH} />
            </svg>
          </div>
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
const K12: React.FC<SP> = ({f, len, e}) => {
  const p = e('prova'), dp = e('depoimentos');
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <Tag n="3" t="Prova reunida" f={f} />
      <div style={entra(f, 4, 70, 0.14)}>
        <Card x={84} y={330} w={500} h={520} src="clips/ana.mp4" video style={{transform: `scale(${1 + 0.035 * pulse(f, dp - 2, 16)})`}} />
        <div style={abs({left: 84, top: 875, fontSize: 30, color: C.t2, fontWeight: 500})}>Dona Ana, paciente</div>
      </div>
      <div style={abs({left: 520, top: 600, width: 480, background: '#fff', borderRadius: 40, padding: 44, boxShadow: '0 30px 60px rgba(18,18,22,.14)', ...entra(f, dp + 4, 60, 0.16)})}>
        <div style={{fontSize: 110, lineHeight: 0.6, color: C.red, fontWeight: 800}}>“</div>
        <div style={{fontSize: 46, fontWeight: 600, lineHeight: 1.3, marginTop: 20}}>Nesta eu confio de olhos fechados.</div>
        <div style={{fontSize: 28, color: C.t2, marginTop: 22}}>Comentário no Instagram da clínica</div>
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

const FONTES = [
  ['Anúncio', 'anuncio', 215, 'M215 10 C215 180 540 140 540 300'],
  ['Google', 'google', 540, 'M540 10 L540 300'],
  ['Instagram', 'instagram', 860, 'M860 10 C860 180 540 140 540 300'],
] as const;
const K13: React.FC<SP> = ({f, len, e}) => (
  <Stage bg={C.soft} f={f} len={len}>
    <Tag n="4" t="Endereço de vocês" f={f} />
    {FONTES.map(([t, k, cx]) => (
      <span key={t} style={abs({left: cx, top: 330, transform: `translateX(-50%) ${entra(f, e(k) - 4, 40, 0.2).transform}`, opacity: entra(f, e(k) - 4).opacity, background: '#fff', border: `3px solid ${C.gray}`, padding: '26px 44px', fontSize: 42, fontWeight: 600, borderRadius: 999, whiteSpace: 'nowrap'})}>
        {t}
      </span>
    ))}
    <svg style={abs({left: 0, top: 440})} width={1080} height={320}>
      {FONTES.map(([t, k, , d]) => {
        const p = E.expr(prog(f, Math.max(e(k), e('levam') - 14) + 2, 16));
        return <path key={t} d={d} stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
      })}
    </svg>
    <Phone x={250} y={approach(f, e('endereco') - 6, 1300, 770, 0.13)} w={580} scroll={tween(f, e('porta'), 40, 0, 60, E.expr)} />
    <div style={abs({left: 640, top: 1460, background: C.ink, color: '#fff', padding: '26px 44px', fontSize: 40, fontWeight: 600, borderRadius: 999, whiteSpace: 'nowrap', ...entra(f, e('vinte') - 4, 40, 0.2)})}>aberto 24 h</div>
  </Stage>
);

const SW = [
  ['#EB2026', 'Vermelho'],
  ['#121216', 'Grafite'],
  ['#F4F5F7', 'Névoa'],
];
const K14: React.FC<SP> = ({f, len, e}) => {
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
        <span style={{display: 'inline-flex', alignItems: 'center', background: C.red, color: '#fff', padding: '28px 48px', fontSize: 38, fontWeight: 600, borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(235,32,38,.28)', ...entra(f, sv - 4, 40, 0.2)}}>Agendar pelo WhatsApp</span>
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
const K15: React.FC<SP> = ({f, len, e}) => (
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

const K16: React.FC<SP> = ({f, len, e}) => {
  const ar = e('noar');
  const b = arrive(f, ar - 12, 0.18);
  return (
    <Stage bg={C.soft} f={f} len={len}>
      <div style={abs({left: 84, top: 170, display: 'flex', alignItems: 'center', gap: 22, fontWeight: 600, fontSize: 38, color: C.red, ...entra(f, 0, 30)})}>
        <Plus size={62} />
        MedicMais Sobradinho
      </div>
      <H top={270} size={104} f={f} s1={0} s2={ar - 8} l1="Vamos colocar" l2="no ar?" />
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

const SCENES: Record<string, React.FC<SP>> = {K01, K02, K03, K04, K05, K06, K07, K08, K09, K10, K11, K12, K13, K14, K15, K16};

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
