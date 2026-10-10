import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import CUES from './cues.json';
import PORT from './portfolio.json';
import {Film, Shot, Cues} from './Film';
import {C, TEXT, DISPLAY, MONO} from './theme';
import {abs, approach, arrive, Btn, Burst, Chip, clamp, DirBlur, DotField, E, Estilo, Hand, hash, Icon, lerp, Logo, Nota, NUM, H, Onda, Phone, prog, spring, tween, vel} from './ui';
import {CheckPop, HL, Stamp, Typing} from './parts';

const B = CUES.B as unknown as Cues;
const ev = B.ev as Record<string, any>;
const I = B.ini;
const loc = (n: string, a: number) => a - I[n];
const COD = 'Criativo 02';

// ------------------------------------------------------------------ B01 · gancho + CAPA: o 49,90 3D (Blender) já no chão no quadro 0
// rodada 5 (Deidson): 1º quadro = capa da campanha. Começa no impacto do ',90' (quadro 50 do render) e toca o quique;
// no 'noventa' falado o preço dá um pulso.
const B01: Shot['render'] = (f) => {
  const q = 50 + Math.min(24, Math.max(0, f));
  const pu = f >= ev.preco2 ? 1 + 0.06 * Math.exp(-(f - ev.preco2) * 0.25) * Math.cos((f - ev.preco2) * 0.6) : 1;
  const m = 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent), linear-gradient(to bottom, transparent, #000 10%, #000 85%, transparent)';
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.07} />
      <div style={abs({left: 58, top: 270, fontFamily: DISPLAY, fontWeight: 800, fontStretch: '70%', fontSize: 46, color: C.preto})}>POR R$</div>
      <Img src={staticFile(`preco/precoB_${String(q).padStart(2, '0')}.webp`)} style={abs({left: 0, top: 190, width: 540, height: 540, transform: `scale(${pu})`, transformOrigin: '50% 70%', WebkitMaskImage: m, maskImage: m, WebkitMaskComposite: 'source-in', maskComposite: 'intersect'})} />
    </>
  );
};

// ------------------------------------------------------------------ B02 · vista explodida: as peças montam o criativo
const B02: Shot['render'] = (f) => {
  const comp = loc('B02', ev.completo);
  const m = E.cam(prog(f, comp - 6, 10)); // pieces snap into the phone
  const piece = (from: [number, number], to: [number, number], at: number) => {
    const p = spring(f, at, 0.32, 0.75);
    return {x: lerp(from[0], to[0], p), y: lerp(from[1], to[1], p), op: clamp(p * 2) * (1 - m)};
  };
  const p1 = piece([-200, 150], [56, 200], 2);
  const p2 = piece([700, 230], [380, 250], 6);
  const p3 = piece([700, 470], [370, 420], 10);
  const cx = 276, cy = 330;
  const pull = (p: {x: number; y: number}) => ({x: lerp(p.x, cx - 60, m), y: lerp(p.y, cy, m)});
  const glow = f >= comp ? Math.exp(-(f - comp) * 0.15) : 0;
  return (
    <>
      <DotField f={f} cor={C.branco} op={0.05} />
      <div style={abs({left: 150, top: 100, width: 240, height: 427, border: `2px dashed ${f >= comp ? C.ouro : '#3a3833'}`, borderRadius: 26, opacity: 1 - glow * 0.3})} />
      <Phone w={200} style={{left: 176, top: 146, transform: `rotate(${-6 + m * 6}deg) scale(${1 + glow * 0.04})`}}>
        <Estilo i={5} w={200} h={356} f={f} />
      </Phone>
      <div style={abs({left: pull(p1).x, top: pull(p1).y, opacity: p1.op, width: 120, padding: 10, borderRadius: 12, background: C.branco, color: C.preto, fontFamily: TEXT, fontWeight: 800, fontSize: 13, transform: 'rotate(-10deg)'})}>"Pare de perder vendas"</div>
      <div style={abs({left: pull(p2).x, top: pull(p2).y, opacity: p2.op, width: 120, height: 60, borderRadius: 12, background: C.grafite, overflow: 'hidden'})}>
        <Onda x={8} y={10} w={104} h={40} k="texto-2" n={26} f={f} live={1} />
      </div>
      <div style={abs({left: pull(p3).x, top: pull(p3).y, opacity: p3.op, width: 120, height: 44, borderRadius: 10, background: C.ouro, display: 'flex', gap: 4, padding: 8})}>
        {[2, 1, 3].map((g, k) => (
          <div key={k} style={{flex: g, background: C.preto, borderRadius: 4, opacity: 0.85}} />
        ))}
      </div>
      <svg width={540} height={960} style={abs({left: 0, top: 0, opacity: 1 - m})}>
        <path d="M176 230 L200 250 M380 280 L360 290 M370 442 L350 430" stroke="#8a877f" strokeWidth={2} strokeDasharray="4 4" />
      </svg>
      <HL f={f} top={555} size={78} lines={[{t: 'CRIATIVO', c: C.branco, at: loc('B02', ev.criativo) - 2}, {t: 'COMPLETO', c: C.ouro, at: comp - 2}]} />
      <Burst f={f} at={comp + 2} x={276} y={330} r={150} n={12} cor={C.ouro} />
    </>
  );
};

// ------------------------------------------------------------------ B03 · três faixas: copy / locução / edição, cada uma na sua palavra
const B03: Shot['render'] = (f) => {
  const l = loc('B03', ev.locucao) - 2;
  const e = loc('B03', ev.edicao) - 2;
  const b1 = arrive(f, 0, 0.28), b2 = arrive(f, l, 0.28), b3 = arrive(f, e, 0.28);
  const ph = 300 + Math.max(0, f - e) * 2.4;
  return (
    <>
      <div style={abs({left: 0, top: 0, width: 540, height: lerp(960, 320, f >= l ? b2 : 0), overflow: 'hidden', background: C.branco, transform: `translateY(${(1 - b1) * -320}px)`})}>
        <Chip x={30} y={40} txt="COPY" bg={C.preto} cor={C.ouro} />
        <Typing f={f} at={2} txt="PARE DE PERDER VENDAS" cps={1.4} caret={C.ouro} caretH={50} style={abs({left: 30, right: 30, top: 110, fontFamily: DISPLAY, fontWeight: 900, fontStretch: '66%', fontSize: 60, lineHeight: 0.95, color: C.preto})} />
        {[440, 380, 410, 250, 330].map((w, k) => (
          <div key={k} style={abs({left: 30, top: 300 + k * 30, width: w * arrive(f, 3 + k * 2, 0.2), height: 12, borderRadius: 6, background: '#E4E1D8'})} />
        ))}
      </div>
      {f >= l && (
        <div style={abs({left: 0, top: 320, width: 540, height: 320, background: C.preto, transform: `translateX(${(1 - b2) * 540}px)`})}>
          <Chip x={30} y={30} txt="LOCUÇÃO" />
          <Onda x={20} y={90} w={500} h={200} k="texto-2" f={f} live={1} ate={tween(f, l, 50, 0.2, 0.7, E.prod)} />
        </div>
      )}
      {f >= e && (
        <div style={abs({left: 0, top: 640, width: 540, height: 320, background: C.ouro, transform: `translateX(${(1 - b3) * -540}px)`})}>
          <Chip x={30} y={30} txt="EDIÇÃO" bg={C.preto} cor={C.ouro} />
          {[[0, 0, 150], [0, 156, 110], [0, 272, 210], [1, 0, 240], [1, 246, 230]].map(([r, a, b], k) => (
            <div key={k} style={abs({left: approach(f, e + 2 + k * 2, 560, 30 + a, 0.32), top: 110 + r * 70, width: b, height: 52, borderRadius: 8, background: C.preto, opacity: r === 0 ? 0.9 : 0.45})} />
          ))}
          <div style={abs({left: ph, top: 90, width: 3, height: 170, background: C.branco})} />
        </div>
      )}
    </>
  );
};

// ------------------------------------------------------------------ B04 · o jeito antigo: contratar 3 pessoas
const B04: Shot['render'] = (f) => {
  const ct = loc('B04', ev.contratar) - 3;
  const ats = [ev.copywriter, ev.locutor, ev.editor].map((x) => loc('B04', x) - 6);
  const data: [string, string, string][] = [['Copywriter', 'pen-nib', 'orçamento em 3 dias'], ['Locutor', 'microphone', 'agenda só semana que vem'], ['Editor', 'film-strip', 'prazo: 7 dias']];
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.07} />
      <HL f={f} top={330} size={92} lines={[{t: 'VOCÊ NÃO', c: C.preto, at: 0}, {t: 'PRECISA', c: C.cinza, at: 4}]} exitAt={ct - 4} stagger={0.8} />
      <HL f={f} top={120} size={70} lines={[{t: 'CONTRATAR', c: C.preto, at: ct}, {t: '3 PESSOAS?', c: C.cinza, at: ct + 6}]} />
      {data.map(([nome, ic, info], k) => {
        const p = spring(f, ats[k], 0.5, 0.74);
        if (f < ats[k]) return null;
        return (
          <div key={k} style={abs({left: 44 + k * 10 + (1 - p) * 500, top: 290 + k * 135, width: 420, height: 120, borderRadius: 20, background: '#fff', boxShadow: '0 10px 28px rgba(0,0,0,.10)', transform: `rotate(${[-2, 1.5, -1][k]}deg)`})}>
            <div style={abs({left: 18, top: 22, width: 80, height: 80, borderRadius: '22%', background: '#ECE9E0', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
              <Icon n={ic} s={40} c="#8a877f" />
            </div>
            <div style={abs({left: 116, top: 28, fontFamily: TEXT, fontWeight: 800, fontSize: 22, color: C.preto})}>{nome}</div>
            <div style={abs({left: 116, top: 60, fontFamily: TEXT, fontWeight: 500, fontSize: 15, color: '#8a877f'})}>{info}</div>
            <div style={abs({right: 18, top: 40, padding: '10px 14px', borderRadius: 10, background: C.preto, color: '#fff', fontFamily: TEXT, fontWeight: 700, fontSize: 13})}>Contratar</div>
          </div>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ B05 · separadamente: caos de três conversas
const B05: Shot['render'] = (f) => {
  const msgs: [string, string, number, number, number][] = [
    ['Copywriter', 'qual o público mesmo?', 40, 150, -3], ['Editor', 'cadê o áudio?', 230, 250, 4], ['Locutor', 'mando amanhã', 60, 360, -2],
    ['Copywriter', 'orçamento: R$ ???', 210, 455, 3], ['Editor', 'falta o roteiro', 30, 560, -4], ['Locutor', 'regravar? +1 dia', 240, 650, 2],
  ];
  return (
    <>
      {msgs.map(([nome, txt, x, y, r], k) => {
        const at = k * 4;
        const p = spring(f, at, 0.5, 0.55);
        if (f < at) return null;
        const jit = Math.sin((f - at) * 2.7 + k) * 2 * Math.exp(-(f - at) * 0.2);
        return (
          <div key={k} style={abs({left: Math.min(x, 222) + jit, top: y - 50, width: 270, padding: '12px 14px', borderRadius: 16, background: '#1d1d1b', transform: `rotate(${r}deg) scale(${p})`, transformOrigin: x < 200 ? '0% 100%' : '100% 100%'})}>
            <div style={{fontFamily: TEXT, fontWeight: 700, fontSize: 11, color: C.ouro, letterSpacing: '0.06em'}}>{nome.toUpperCase()}</div>
            <div style={{fontFamily: TEXT, fontWeight: 600, fontSize: 18, color: '#eee', marginTop: 3}}>{txt}</div>
            <div style={abs({right: -8, top: -8, width: 24, height: 24, borderRadius: '50%', background: C.verm, color: '#fff', fontFamily: TEXT, fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${spring(f, at + 3, 0.6, 0.5)})`})}>
              {1 + ((x + y) % 3)}
            </div>
          </div>
        );
      })}
      <HL f={f} top={648} size={64} lines={[{t: 'SEPARADAMENTE', c: C.branco, at: 2}]} stagger={0.9} />
    </>
  );
};

// ------------------------------------------------------------------ B06 · a gente faz tudo: a coroa real em 3D (Blender) gira e pousa
// rodada 4: só a coroa e a frase (saiu a conversa); a coroa assenta no quadro 14 e balança devagar
const B06: Shot['render'] = (f) => {
  const tudo = loc('B06', ev.tudo) - 2;
  const q = Math.min(44, Math.max(0, f));
  const fl = Math.sin(f * 0.08) * 5;
  return (
    <>
      <DotField f={f} cor={C.branco} op={0.05} />
      <Img src={staticFile(`coroa/coroa_${String(q).padStart(2, '0')}.webp`)} style={abs({left: 30, top: 60 + fl, width: 480, height: 480})} />
      <HL f={f} top={520} size={96} lines={[{t: 'A GENTE', c: C.branco, at: 0}, {t: 'FAZ TUDO', c: C.ouro, at: tudo}]} />
    </>
  );
};

// ------------------------------------------------------------------ B07 · exportação 100%: entregue pronto
const B07: Shot['render'] = (f) => {
  const pr = loc('B07', ev.pronto) - 2;
  const pct = Math.round(100 * E.prod(prog(f, 0, pr - 2)));
  const card = spring(f, 0, 0.35, 0.75);
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.07} />
      <div style={abs({left: 60, top: 220 + (1 - card) * 80, width: 420, height: 300, borderRadius: 24, background: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,.12)', padding: 26, opacity: clamp(card * 2)})}>
        <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
          <div style={{width: 84, height: 120, borderRadius: 12, overflow: 'hidden', position: 'relative'}}>
            <Estilo i={6} w={84} h={120} f={f} />
          </div>
          <div>
            <div style={{fontFamily: TEXT, fontWeight: 800, fontSize: 20, color: C.preto}}>seu-criativo.mp4</div>
            <div style={{fontFamily: TEXT, fontWeight: 500, fontSize: 14, color: '#8a877f', marginTop: 4}}>1080×1920 · 30 s</div>
          </div>
        </div>
        <div style={{marginTop: 34, height: 16, borderRadius: 8, background: '#EEEBE3', overflow: 'hidden'}}>
          <div style={{width: `${pct}%`, height: '100%', background: C.ouro, borderRadius: 8}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: TEXT, fontWeight: 700, fontSize: 15, color: C.preto}}>
          <span>{pct < 100 ? 'Exportando' : 'Pronto'}</span>
          <span style={{fontVariantNumeric: 'tabular-nums'}}>{pct}%</span>
        </div>
      </div>
      <div style={abs({left: 380, top: 180, width: 110, height: 110, borderRadius: '50%', background: C.preto, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${spring(f, pr, 0.45, 0.5)})`})}>
        <Icon n="check" s={60} c={C.ouro} />
      </div>
      <Burst f={f} at={pr + 2} x={435} y={235} r={70} cor={C.ouroEs} />
      <HL f={f} top={560} size={86} lines={[{t: 'ENTREGUE', c: C.preto, at: 0}, {t: 'PRONTO', c: C.ouroEs, at: pr}]} />
    </>
  );
};

// ------------------------------------------------------------------ B08 · pra anunciar: vira anúncio no feed
const Post: React.FC<{f: number}> = ({f}) => (
  <div style={abs({inset: 0, background: '#fff'})}>
    <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '22px 10px 10px'}}>
      <div style={{width: 28, height: 28, borderRadius: '22%', background: C.preto, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile('img/coroa_rei_da_VSL.png')} style={{width: 22}} />
      </div>
      <div>
        <div style={{fontFamily: TEXT, fontWeight: 700, fontSize: 11}}>sua marca</div>
        <div style={{fontFamily: TEXT, fontWeight: 500, fontSize: 9, color: '#888'}}>Patrocinado</div>
      </div>
    </div>
    <div style={{position: 'relative', width: 240, height: 300, overflow: 'hidden'}}>
      <Estilo i={6} w={240} h={300} f={f} />
    </div>
    <div style={{margin: '8px 10px', height: 30, borderRadius: 6, background: C.ouro, fontFamily: TEXT, fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px'}}>
      Saiba mais <span>›</span>
    </div>
    <div style={{display: 'flex', gap: 10, padding: '0 10px', fontFamily: TEXT, fontWeight: 600, fontSize: 10, color: '#555'}}>
      <span>♥ {(1.2 + f * 0.02).toFixed(1).replace('.', ',')} mil</span>
      <span>{Math.round(84 + f * 0.7)} comentários</span>
    </div>
  </div>
);
const B08: Shot['render'] = (f) => {
  const an = loc('B08', ev.anunciar) - 2;
  const py = approach(f, 0, 500, 0, 0.22);
  const pill = spring(f, an + 6, 0.4, 0.6);
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.12} />
      <Phone w={240} style={{left: 143, top: 105 + py, transform: `rotate(${-3 + (1 - arrive(f, 0, 0.2)) * 10}deg)`}}>
        <Post f={f} />
      </Phone>
      <div style={abs({left: 300, top: 150, padding: '9px 13px', borderRadius: 99, background: C.preto, color: C.branco, fontFamily: TEXT, fontWeight: 700, fontSize: 13, display: 'flex', gap: 6, alignItems: 'center', transform: `scale(${pill})`, transformOrigin: '0% 50%'})}>
        <span style={{color: '#1DB954'}}>●</span> Anúncio no ar
      </div>
      <HL f={f} top={630} size={80} lines={[{t: 'PRA ANUNCIAR', c: C.preto, at: an}]} stagger={0.9} />
    </>
  );
};

// ------------------------------------------------------------------ B09 + B10 · este vídeo vira o 1º card de um carrossel do portfólio, sob o CTA
// portfolio.json: {src,label,from?} = real portfolio clip (muted) | {estilo,label} = a motion made by us on the spot
const CW = 200, CH = 356, CT = 108, GAP = 24;
type Item = {src?: string; estilo?: number; label: string; from?: number};
const Card: React.FC<{F: number; i: number; s: number}> = ({F, i, s}) => {
  const items = PORT as Item[];
  const it = items[(i - 1 + items.length * 10) % items.length];
  const dx = i - s;
  const ad = clamp(Math.abs(dx));
  const sc = lerp(1, 0.84, ad);
  const x = 270 + dx * (CW + GAP) * lerp(1, 0.92, ad);
  if (Math.abs(dx) > 2.2) return null;
  return (
    <div style={abs({left: x - CW / 2, top: CT, width: CW, height: CH, borderRadius: 20, overflow: 'hidden', transform: `scale(${sc})`, background: '#111', boxShadow: '0 18px 40px rgba(0,0,0,.5)'})}>
      {it.src ? (
        <Sequence from={I.B09} layout="none">
          <OffthreadVideo src={staticFile(it.src)} muted startFrom={Math.round((it.from ?? 0) * 30)} style={{width: CW, height: CH, objectFit: 'cover'}} />
        </Sequence>
      ) : (
        <Estilo i={it.estilo ?? 0} w={CW} h={CH} f={F} />
      )}
      <div style={abs({left: 10, top: 10, padding: '5px 8px', borderRadius: 7, background: 'rgba(11,11,11,.78)', color: C.branco, fontFamily: TEXT, fontWeight: 700, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase'})}>{it.label}</div>
      <div style={abs({inset: 0, background: C.preto, opacity: ad * 0.55})} />
    </div>
  );
};

const Final: React.FC<{F: number}> = ({F}) => {
  const f = F - I.B09;
  const vendo = ev.vendo - I.B09;
  const exm = ev.exemplo - I.B09;
  const cta = I.B10 - I.B09;
  const sab = ev.saiba - I.B09;
  // pull-back: the previous scene (B08) keeps playing and shrinks into card 0
  const pb = E.cam(prog(f, 0, 16));
  const scale = lerp(540 / CW, 1, pb);
  const cx = 270, cy = lerp(480, CT + CH / 2, pb);
  // carousel: holds each card ~1 s, then slides fast to the next; starts after "é um exemplo" has been read
  const S0 = exm + 24;
  const STEP = 34;
  const sv = (ff: number) => {
    const t = ff - S0;
    if (t <= 0) return 0;
    const k = Math.floor(t / STEP);
    return Math.min(4, k + E.expr(clamp(((t % STEP) / STEP - 0.7) / 0.3))); // last slide ends ~1 s before the end: final card holds sharp
  };
  const s = sv(f);
  const vs = Math.abs(vel(sv, f));
  const out1 = prog(f, cta - 5, 7);
  const lg = spring(f, cta, 0.32, 0.8);
  const bt = spring(f, cta + 6, 0.35, 0.6);
  const press = f >= sab && f < sab + 6 ? Math.sin(((f - sab) / 6) * Math.PI) : 0;
  const ripple = f >= sab ? prog(f, sab, 22) : 0;
  const BY = 628; // button top (bottom at 706 = 73.5 %)
  const self = (
    <div style={abs({left: cx - (CW * scale) / 2 - s * (CW + GAP), top: cy - (CH * scale) / 2, width: CW * scale, height: CH * scale, borderRadius: 20 * pb, overflow: 'hidden', border: `${3 * pb}px solid ${C.ouro}`, zIndex: 3})}>
      <div style={{width: 540, height: 960, transform: `scale(${(CW * scale) / 540})`, transformOrigin: '0 0', background: C.ouro, position: 'relative'}}>
        {B08(34 + f, I.B08 + 34 + f, 34)}
      </div>
      <div style={abs({inset: 0, background: C.preto, opacity: clamp(s) * 0.55})} />
    </div>
  );
  return (
    <>
      <DotField f={f} cor={C.branco} op={0.05} />
      <DirBlur x={Math.min(22, vs * (CW + GAP) * 0.35)} style={abs({inset: 0})}>
        {f >= exm && [1, 2, 3, 4, 5, 6].map((i) => <Card key={i} F={F} i={i} s={s} />)}
        {self}
      </DirBlur>
      {/* phase 1: "este vídeo / é um exemplo" + its own timeline */}
      <div style={abs({inset: 0, opacity: 1 - out1, transform: `translateY(${out1 * -20}px)`})}>
        <HL f={f} top={492} size={66} stagger={0.45} lines={[{t: 'ESTE VÍDEO', c: C.branco, at: vendo - 8}, {t: 'É UM EXEMPLO', c: C.ouro, at: exm - 3}]} />
      </div>
      {/* phase 2: CTA under the carousel */}
      {f >= cta - 2 && (
        <>
          <div style={abs({left: 130, top: 486, opacity: clamp(lg * 1.5), transform: `scale(${0.9 + 0.1 * lg})`})}>
            <Logo f="LOGO_rei_da_VSL_horizontal.png" w={280} />
          </div>
          <div style={abs({left: 0, right: 0, top: 552, textAlign: 'center', ...NUM, fontSize: 80, color: C.ouro, opacity: arrive(f, cta + 3, 0.25), transform: `translateY(${(1 - arrive(f, cta + 3, 0.25)) * 20}px)`})}>
            <span style={{fontSize: '0.4em', color: C.branco}}>R$ </span>49,90
          </div>
          {ripple > 0 && ripple < 1 && <div style={abs({left: 270 - 180 - ripple * 100, top: BY + 39 - 39 - ripple * 100, width: 360 + ripple * 200, height: 78 + ripple * 200, borderRadius: 999, border: `3px solid ${C.ouro}`, opacity: (1 - ripple) * 0.7})} />}
          <Btn w={360} h={78} txt="Saiba mais" size={38} press={press} style={{left: 90, top: BY, transform: `scale(${bt * (1 - press * 0.05)})`}} />
          <Hand x={approach(f, cta + 8, 560, 330, 0.16)} y={approach(f, cta + 8, 980, BY + 40, 0.16)} press={press} s={56} />
        </>
      )}
    </>
  );
};

const SHOTS: Shot[] = [
  {n: 'B01', bg: C.branco, hud: C.preto, enter: 'cut', push: 0.0011, shake: [ev.preco2], render: B01},
  {n: 'B02', bg: C.preto, hud: C.branco, enter: 'whipU', shake: [ev.completo + 2], render: B02},
  {n: 'B03', bg: '#000', hud: C.branco, enter: 'cut', push: 0, render: B03},
  {n: 'B04', bg: C.branco, hud: C.preto, enter: 'whipL', render: B04},
  {n: 'B05', bg: C.preto, hud: C.branco, enter: 'punch', render: B05},
  {n: 'B06', bg: C.preto, hud: C.branco, enter: 'zoomOut', render: B06},
  {n: 'B07', bg: C.branco, hud: C.preto, enter: 'whipU', shake: [ev.pronto], render: B07},
  {n: 'B08', bg: C.ouro, hud: C.preto, enter: 'whipL', render: B08},
  {n: 'B09', bg: C.preto, hud: C.branco, enter: 'cut', push: 0, render: (f, F) => <Final F={F} />},
  {n: 'B10', bg: C.preto, hud: C.branco, enter: 'cut', push: 0, render: (f, F) => <Final F={F} />},
];

export const CriativoB: React.FC = () => <Film cues={B} shots={SHOTS} cod={COD} />;
export const DUR_B = B.dur;
