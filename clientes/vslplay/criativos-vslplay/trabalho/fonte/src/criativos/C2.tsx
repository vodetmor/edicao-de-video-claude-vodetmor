// Criativo 2 · "Não mostre sua oferta antes da hora" (vertical 1080x1920, 30 fps).
// Storyboard: /mnt/project-files/criativos-vslplay/storyboard/. Every event is keyed to a spoken word
// (src/data/words_c2.json, made by criativos/voz.py from the client's voiceover).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, TEXT} from '../theme';
import {useFonts} from '../Fonts';
import {useTextures} from '../Ad';
import {Player, PlayerState} from '../Player';
import {approach, arrive, clamp, Cursor, DirBlur, E, lerp, prog, RiseText, spring, tween, vel} from '../kit';
import {Btn, EndCard, Headline, Skel, shake, Sting, Tag, UrlBar, VW, wordClock, XMark} from './shared';
import data from '../data/words_c2.json';
import keys from '../data/keys_c2.json';

const W = wordClock(data);
export const C2_FRAMES = keys.end;

// ---- the timeline (frames), all from the voice: criativos/chaves.py -> src/data/keys_c2.json (the sound uses the same file)
export const K2 = keys;
const tc = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
const DUR = 18 * 60 + 30;
const PLY = {x: 40, y: 220, w: 1000, h: 562};
const playerAt = (f: number, sec: number, extra: Partial<PlayerState> = {}): PlayerState => ({
  ...PLY,
  radius: 22,
  primary: C.coral,
  videoT: (2 + f / 30) % 15.5,
  controls: {show: 1, paused: false, time: tc(sec), dur: '18:30', seek: sec / DUR, fake: Math.pow(sec / DUR, 0.6)},
  ...extra,
});

// ---- 1 · hook: the button crashes onto the video ------------------------------------------------------
const Page1: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  // falling with gravity, already mid-air on frame 0 (it started 4 frames before the cut)
  const REST = 420;
  const g = 26;
  const yOf = (ff: number) => (ff < k.impact ? REST - g * Math.pow(k.impact - ff, 2) : REST);
  const y = yOf(f);
  const vy = Math.abs(vel(yOf, f));
  const land = f >= k.impact ? spring(f, k.impact, 0.55, 0.42) : 0;
  const sq = f >= k.impact ? 1 - land : 0; // 1 at contact -> 0
  const rot = f < k.impact ? -9 : lerp(-9, -4, land);
  const sh = shake(f, k.impact, 22, 13);
  const sec = 7 + f / 30;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg)`}}>
      <AbsoluteFill style={{background: C.white}} />
      <UrlBar />
      <Player st={playerAt(f, sec)} />
      <Skel y={860} n={4} />
      <Skel y={1110} n={3} />
      <DirBlur y={vy * 0.35} style={{position: 'absolute', inset: 0}}>
        <Btn x={180} y={y} w={720} h={160} rot={rot} sx={1 + 0.16 * sq} sy={1 - 0.22 * sq} />
      </DirBlur>
      {/* impact lines */}
      {f >= k.impact && f < k.impact + 9 && (
        <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          {[
            [168, 470, -1],
            [160, 540, -1],
            [912, 450, 1],
            [920, 525, 1],
          ].map(([x, yy, d], i) => {
            const p = E.enter(prog(f, k.impact, 7));
            return (
              <line key={i} x1={x + d * 10 * p} y1={yy} x2={x + d * (24 + 60 * p)} y2={yy - 12 + i * 4} stroke={C.coral} strokeWidth={9} strokeLinecap="round" opacity={1 - p * 0.9} />
            );
          })}
        </svg>
      )}
      <Tag f={f} at={k.tag1} x={64} y={680} text="00:07" bg={C.coral} size={34} />
      <Tag f={f} at={k.tag2} x={196} y={680} text="oferta só em 12:40" bg={C.white} color="#6B6B70" size={34} shadow />
    </div>
  );
};

const Scene1: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  if (f >= k.zoom) return <Scene1Zoom f={f} />;
  // the visitor swipes the page away
  const sw = E.exit(prog(f, k.swipe, 16));
  const swY = (ff: number) => -1700 * E.exit(prog(ff, k.swipe, 16));
  const swV = Math.abs(vel(swY, f));
  const touch = f >= k.swipe - 8 && f < k.swipe + 12;
  const tY = 1460 - 300 * E.exit(prog(f, k.swipe - 2, 12));
  const push = 1 + 0.0016 * Math.max(0, f - k.swipe - 8);
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', transform: `scale(${push})`, transformOrigin: '50% 75%'}}>
      <DirBlur y={swV * 0.3} style={{position: 'absolute', inset: 0, transform: `translateY(${swY(f)}px) rotate(${-6 * sw}deg)`, transformOrigin: '50% 100%'}}>
        <Page1 f={f} />
        {/* the white band behind the hook line belongs to the page */}
      </DirBlur>
      {touch && (
        <div
          style={{
            position: 'absolute',
            left: 540 - 66,
            top: tY - 66,
            width: 132,
            height: 132,
            borderRadius: 66,
            background: 'rgba(17,17,19,.16)',
            border: '5px solid rgba(17,17,19,.42)',
            transform: `scale(${spring(f, k.swipe - 8, 0.5, 0.7)})`,
          }}
        />
      )}
      {/* the hook line stays on screen while the page leaves (sound-off viewers read it) */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, height: 560, background: C.white, opacity: 1 - clamp((f - k.swipe - 2) / 6)}} />
      <XMark f={f} at={k.head1 - 2} x={56} y={1040} s={110} />
      <Headline f={f} lines={['BOTÃO ANTES', 'DO PITCH?']} start={k.head1} y={1170} size={158} />
      {f > k.swipe + 10 && (
        <div style={{position: 'absolute', left: 64, top: 1530, fontFamily: TEXT, fontWeight: 600, fontSize: 44, color: '#8A8A8E', opacity: arrive(f, k.swipe + 10, 0.2)}}>
          o visitante foi embora.
        </div>
      )}
    </AbsoluteFill>
  );
};

const Scene1Zoom: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  const z = approach(f, k.zoom, 0.55, 1, 0.24) * (1 + 0.0012 * (f - k.zoom));
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: -80, filter: 'blur(26px) brightness(.32)'}}>
        <Player st={{...playerAt(f, 9), x: -200, y: 300, w: 1480, h: 832, controls: undefined}} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '540px 900px'}}>
        <Btn x={70} y={790} w={940} h={230} shadow={1.6} />
      </div>
      <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {[-1, 1].map((d) => {
          const p = E.enter(prog(f, k.zoom + 2, 8));
          return <line key={d} x1={540 + d * 420} y1={1140 + 30 * p} x2={540 + d * (470 + 50 * p)} y2={1200 + 50 * p} stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={(1 - prog(f, k.zoom + 10, 8)) * (p > 0 ? 1 : 0)} />;
        })}
      </svg>
      <Headline f={f} lines={['ANTES DA', 'OFERTA?']} start={k.zoom + 3} y={360} size={176} color={C.white} />
    </AbsoluteFill>
  );
};

// ---- 2 · the button stands in front of the information --------------------------------------------
const OfferCard: React.FC<{x: number; y: number; blur: number; op?: number; f: number}> = ({x, y, blur, op = 1, f}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 800,
      height: 720,
      borderRadius: 34,
      background: C.white,
      boxShadow: '0 30px 70px rgba(0,0,0,.10)',
      filter: `blur(${blur}px)`,
      opacity: op,
      padding: 56,
      boxSizing: 'border-box',
    }}
  >
    <div style={{fontFamily: "'Archivo Variable'", fontWeight: 900, fontStretch: '70%', fontSize: 92, color: C.ink}}>OFERTA</div>
    <div style={{marginTop: 30, width: lerp(140, 440, E.prod(prog(f, K2.s2 + 10, 40))), height: 84, borderRadius: 16, background: '#D9D8D4'}} />
    <div style={{marginTop: 30, width: 600, height: 26, borderRadius: 12, background: '#E6E5E2'}} />
    <div style={{marginTop: 18, width: 520, height: 26, borderRadius: 12, background: '#E6E5E2'}} />
    <div style={{display: 'flex', gap: 18, marginTop: 40}}>
      {['Bônus 1', 'Bônus 2'].map((b, i) => (
        <span key={b} style={{background: C.sun, borderRadius: 99, padding: '12px 26px', fontFamily: TEXT, fontWeight: 700, fontSize: 30, transform: `scale(${spring(f, K2.s2 + 30 + i * 14, 0.5, 0.55)})`, display: 'inline-block'}}>
          {b}
        </span>
      ))}
    </div>
  </div>
);

const Scene2: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  // the card peeks out from behind; the button chases it and blocks it again ("toc")
  const peek = (at: number, dir: number) => dir * 300 * E.expr(prog(f, at, 8));
  const cardX = 140 + peek(k.info, 1) - peek(k.apresentada, 1) * 1.0 + peek(k.apresentada, -1) * 0;
  const btnX = 120 + 300 * spring(f, k.toc1 - 2, 0.5, 0.6) - 300 * spring(f, k.toc2 - 2, 0.5, 0.6);
  const cardX2 = 140 + 300 * E.expr(prog(f, k.info, 8)) - 300 * E.expr(prog(f, k.apresentada, 8));
  const enter = spring(f, k.s2, 0.38, 0.7);
  const pulse = f >= k.acao ? Math.sin(Math.PI * clamp((f - k.acao) / 8)) : 0;
  const sh1 = shake(f, k.toc1 + 4, 9, 8);
  const sh2 = shake(f, k.toc2 + 4, 9, 8);
  void cardX;
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', transform: `translate(${sh1.x + sh2.x}px, ${sh1.y + sh2.y}px) scale(${1 + 0.0006 * (f - k.s2)})`, transformOrigin: '50% 60%'}}>
      <OfferCard f={f} x={cardX2} y={720} blur={8} op={clamp((f - k.s2) / 6)} />
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - enter) * -900}px)`}}>
        <Btn x={btnX} y={980} w={840} h={200} sx={1 + 0.07 * pulse} sy={1 + 0.07 * pulse} shadow={1.3} />
      </div>
      <Headline f={f} lines={['AÇÃO NA FRENTE']} start={k.acao - 6} y={250} size={132} />
      <Headline f={f} lines={['DA INFORMAÇÃO.']} start={k.info - 4} y={250 + 122} size={132} color="#9A9A9E" />
    </AbsoluteFill>
  );
};

// ---- 3a · the VSLPLAY setting: Botão com delay -----------------------------------------------------
const Scene3a: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  const up = spring(f, k.s3, 0.32, 0.72);
  const on = E.expr(prog(f, k.delay, 6));
  const dragP = E.cam(prog(f, k.drag + 3, k.dragEnd - k.drag - 6));
  const target = 12 * 60 + 40;
  const sec = Math.round((dragP * target) / 10) * 10 === target ? target : Math.floor(dragP * target);
  const BX = 120;
  const BW = 840;
  const BY = 1230;
  const kx = BX + BW * 0.685 * dragP;
  const TOG = {x: 60 + 960 - 60 - 56, y: 720 + 56 + 32};
  const cur = f >= k.delay - 22 && f < k.dragEnd + 16;
  let cx = kx;
  let cy = BY + 22;
  if (f < k.drag) {
    const a = E.expr(prog(f, k.delay - 22, 18));
    const b = E.expr(prog(f, k.delay + 1, k.drag - k.delay - 2));
    cx = lerp(lerp(1000, TOG.x, a), kx, b);
    cy = lerp(lerp(1700, TOG.y, a), BY + 22, b);
  }
  const press = (f >= k.drag && f < k.dragEnd) || (f >= k.delay && f < k.delay + 3) ? 1 : 0;
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', transform: `scale(${1 + 0.0006 * (f - k.s3)})`, transformOrigin: '50% 60%'}}>
      <Headline f={f} lines={['BOTÃO', 'COM DELAY']} start={k.s3 + 8} y={250} size={170} />
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 720,
          width: 960,
          height: 720,
          borderRadius: 40,
          background: C.white,
          boxShadow: '0 30px 70px rgba(0,0,0,.10)',
          transform: `translateY(${(1 - up) * 1100}px)`,
          fontFamily: TEXT,
          color: C.ink,
        }}
      >
        <div style={{position: 'absolute', left: 60, top: 60, fontWeight: 700, fontSize: 46}}>Botão com delay</div>
        <div style={{position: 'absolute', right: 60, top: 56, width: 112, height: 64, borderRadius: 32, background: on > 0.5 ? C.coral : '#D9D8D4'}}>
          <div style={{position: 'absolute', top: 6, left: 6 + 48 * on, width: 52, height: 52, borderRadius: 26, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)'}} />
        </div>
        <div style={{position: 'absolute', left: 60, top: 170, fontWeight: 500, fontSize: 30, color: '#6B6B70'}}>Aparecer em</div>
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 220,
            width: 300,
            height: 96,
            borderRadius: 20,
            border: `3px solid ${dragP > 0 && dragP < 1 ? C.coral : '#D9D8D4'}`,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 30,
            boxSizing: 'border-box',
            fontWeight: 700,
            fontSize: 50,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {tc(sec)}
        </div>
        <div style={{position: 'absolute', left: 60, top: 380, fontWeight: 500, fontSize: 30, color: '#6B6B70'}}>Linha do tempo da VSL</div>
        <div style={{position: 'absolute', left: 60, top: 568, display: 'flex', justifyContent: 'space-between', width: 840, fontWeight: 500, fontSize: 26, color: '#8A8A8E'}}>
          <span>00:00</span>
          <span>18:30</span>
        </div>
      </div>
      {/* timeline track (frame coordinates, so the cursor can grab it) */}
      <div style={{position: 'absolute', left: BX, top: BY + (1 - up) * 1100, width: BW, height: 16, borderRadius: 8, background: '#E6E5E2'}}>
        <div style={{position: 'absolute', left: 0, top: 0, height: 16, width: BW * 0.685 * dragP, borderRadius: 8, background: C.ink}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: kx - 30,
          top: BY + 8 - 30 + (1 - up) * 1100,
          width: 60,
          height: 60,
          borderRadius: 30,
          background: C.coral,
          border: '8px solid #fff',
          boxSizing: 'border-box',
          boxShadow: '0 6px 16px rgba(0,0,0,.25)',
          transform: `scale(${up * (1 + 0.12 * press)})`,
        }}
      />
      {cur && <Cursor x={cx + 6} y={cy} press={press} scale={1.9} />}
    </AbsoluteFill>
  );
};

// ---- 3b · the needle runs to 12:40 and the button is born in the right place ---------------------------
const Page3: React.FC<{f: number; sec: number; btn: number; burst?: number}> = ({f, sec, btn, burst = -1}) => (
  <>
    <AbsoluteFill style={{background: C.white}} />
    <UrlBar />
    <Player st={playerAt(f, sec)} />
    {btn > 0 && <Btn x={60} y={830} w={960} h={170} sx={btn} sy={btn} shadow={0.6} />}
    {burst >= 0 && burst < 1 && (
      <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {[
          [50, 820, -1, -1],
          [1030, 820, 1, -1],
          [50, 1010, -1, 1],
          [1030, 1010, 1, 1],
        ].map(([x, y, dx, dy], i) => (
          <line key={i} x1={x + dx * 10 * burst} y1={y + dy * 10 * burst} x2={x + dx * (20 + 40 * burst)} y2={y + dy * (20 + 40 * burst)} stroke={C.coral} strokeWidth={9} strokeLinecap="round" opacity={1 - burst} />
        ))}
      </svg>
    )}
  </>
);

const Scene3b: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  const run = E.cam(prog(f, k.s3b, k.born - k.s3b - 1));
  const sec = lerp(7, 12 * 60 + 40, run);
  const btn = spring(f, k.born, 0.42, 0.45);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Page3 f={f} sec={sec} btn={btn} burst={f >= k.born ? prog(f, k.born, 9) : -1} />
      <Tag f={f} at={k.born - 1} x={64} y={680} text="12:40" bg={C.coral} size={34} />
      <Skel y={1560} n={3} />
      <Headline f={f} lines={['NO SEGUNDO', 'QUE VOCÊ', 'ESCOLHE.']} start={k.s3b + 4} y={1080} size={150} />
    </AbsoluteFill>
  );
};

// ---- 4 · it doesn't stop at the button: the camera pulls back, the page below is still empty ------------
const EmptyPage: React.FC<{f: number}> = ({f}) => (
  <>
    <Page3 f={f} sec={12 * 60 + 40 + (f - K2.s4) / 30} btn={1} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={{position: 'absolute', left: 48, top: 1080 + i * 290, width: 984, height: 250, border: '6px dashed #CFCDC8', borderRadius: 28, boxSizing: 'border-box'}} />
    ))}
  </>
);

const Scene4: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  const p = E.cam(prog(f, k.s4, 18));
  const s = lerp(1, 0.6, p);
  const x = lerp(0, 216, p);
  const y = lerp(0, 600, p);
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: VW,
          height: 1920,
          transform: `scale(${s})`,
          transformOrigin: '0 0',
          borderRadius: 60 * p / s,
          overflow: 'hidden',
          boxShadow: `0 40px 90px rgba(0,0,0,${0.16 * p})`,
        }}
      >
        <EmptyPage f={f} />
      </div>
      <Headline f={f} lines={['NÃO PARA', 'NO BOTÃO.']} start={k.nao} y={250} size={170} />
    </AbsoluteFill>
  );
};

// ---- 5 · sections of the page follow the video's clock ------------------------------------------------
const MARKS = [
  {p: 0.225, t: '04:10', n: 'Depoimentos'},
  {p: 0.514, t: '09:30', n: 'Bônus'},
  {p: 0.685, t: '12:40', n: 'Oferta'},
];
const Section: React.FC<{i: number; y: number; snap: number; f: number}> = ({i, y, snap, f}) => {
  const on = f >= snap;
  const s = spring(f, snap, 0.45, 0.55);
  if (!on)
    return (
      <div style={{position: 'absolute', left: 48, top: y, width: 984, height: 180, border: '5px dashed #CFCDC8', borderRadius: 26, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TEXT, fontWeight: 600, fontSize: 30, color: '#A5A5A9'}}>
        {MARKS[i].n} entra em {MARKS[i].t}
      </div>
    );
  const bg = [C.paper, C.sun, C.white][i];
  return (
    <div
      style={{
        position: 'absolute',
        left: 48,
        top: y,
        width: 984,
        height: 180,
        borderRadius: 26,
        background: bg,
        transform: `translateY(${(1 - s) * -70}px) scale(${lerp(1.06, 1, s)})`,
        boxShadow: i === 2 ? '0 0 0 4px #EFEEEB inset' : undefined,
        padding: '26px 30px',
        boxSizing: 'border-box',
        fontFamily: TEXT,
      }}
    >
      <div style={{fontWeight: 700, fontSize: 32, color: C.ink}}>{MARKS[i].n}</div>
      {i < 2 ? (
        <div style={{display: 'flex', gap: 18, marginTop: 18}}>
          {Array.from({length: 3 - i}).map((_, j) => (
            <div key={j} style={{flex: 1, height: 84, borderRadius: 16, background: i === 0 ? C.white : 'rgba(255,255,255,.6)'}} />
          ))}
        </div>
      ) : (
        <div style={{marginTop: 16, height: 90, borderRadius: 18, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Archivo Variable'", fontWeight: 900, fontStretch: '80%', fontSize: 44}}>
          COMPRAR AGORA
        </div>
      )}
    </div>
  );
};

const Scene5: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  // the needle crosses each marker exactly on the frame its section snaps in
  const keys: [number, number][] = [
    [k.s5, 0.14],
    [k.snap1, MARKS[0].p],
    [k.snap2, MARKS[1].p],
    [k.snap3, MARKS[2].p],
    [k.s6, 0.74],
  ];
  let p = keys[keys.length - 1][1];
  for (let i = 1; i < keys.length; i++)
    if (f <= keys[i][0]) {
      p = lerp(keys[i - 1][1], keys[i][1], (f - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
      break;
    }
  const sec = p * DUR;
  const sheet = spring(f, k.s5, 0.34, 0.8);
  const TX = 60;
  const TW = 960;
  const TY = 860;
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <Headline f={f} lines={['SEÇÕES DA PÁGINA']} start={k.sinc - 3} y={150} size={104} color={C.white} exitAt={k.snap3 - 12} />
      <Headline f={f} lines={['NO TEMPO DO VÍDEO']} start={k.snap3 - 4} y={150} size={104} color={C.white} />
      <Player st={{...playerAt(f, sec), x: 60, y: 300, w: 960, h: 540}} />
      <div style={{position: 'absolute', left: TX, top: TY, width: TW, height: 10, borderRadius: 5, background: '#333'}} />
      <div style={{position: 'absolute', left: TX, top: TY, width: TW * p, height: 10, borderRadius: 5, background: C.white}} />
      {MARKS.map((m, i) => {
        const hit = f >= [k.snap1, k.snap2, k.snap3][i];
        const pop = hit ? spring(f, [k.snap1, k.snap2, k.snap3][i], 0.5, 0.5) : 0;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: TX + TW * m.p - 13, top: TY - 8, width: 26, height: 26, borderRadius: 4, transform: `rotate(45deg) scale(${1 + 0.5 * pop * (1 - prog(f, [k.snap1, k.snap2, k.snap3][i] + 4, 8))})`, background: hit ? C.coral : C.white}} />
            <div style={{position: 'absolute', left: TX + TW * m.p - 90, top: TY + 30, width: 180, textAlign: 'center', fontFamily: TEXT, fontWeight: 600, fontSize: 24, lineHeight: 1.25, color: hit ? C.white : '#8A8A8E'}}>
              {m.t}
              <br />
              {m.n}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: 0, top: 960 + (1 - sheet) * 960, width: VW, height: 960, background: C.white, borderRadius: '44px 44px 0 0'}}>
        {[0, 1, 2].map((i) => (
          <Section key={i} i={i} f={f} y={36 + i * 200} snap={[k.snap1, k.snap2, k.snap3][i]} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---- 6 · video + button + page, working together at the right time ------------------------------------
const FullPage: React.FC<{f: number}> = ({f}) => (
  <>
    <Page3 f={f} sec={12 * 60 + 40 + (f - K2.junta) / 30} btn={1} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={{position: 'absolute', left: 0, top: 1060 + i * 200}}>
        <Section i={i} f={99999} y={0} snap={0} />
      </div>
    ))}
  </>
);

const Scene6: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  if (f >= k.junta) {
    const s = spring(f, k.junta, 0.3, 0.78);
    const scroll = -140 * E.cam(prog(f, k.junta + 10, 60));
    return (
      <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${scroll}px) scale(${lerp(0.55, 1, s)})`, transformOrigin: '540px 900px', borderRadius: 50 * (1 - s), overflow: 'hidden'}}>
          <FullPage f={f} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1060, height: 860, background: 'linear-gradient(rgba(255,255,255,0), #fff 26%)', opacity: clamp((f - k.hora + 6) / 6)}} />
        <Headline f={f} lines={['NA HORA', 'CERTA.']} start={k.hora - 2} y={1170} size={200} />
      </AbsoluteFill>
    );
  }
  const blocks = [
    {at: k.video, c: C.ink, h: 200},
    {at: k.botao3, c: C.coral, h: 96},
    {at: k.pagina, c: '#CFCDC8', h: 250},
  ];
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <Headline f={f} lines={['VÍDEO']} start={k.video - 2} y={260} size={210} />
      <Headline f={f} lines={['+ BOTÃO']} start={k.botao3 - 2} y={450} size={210} colors={[C.ink]} />
      <Headline f={f} lines={['+ PÁGINA']} start={k.pagina - 2} y={640} size={210} />
      <div style={{position: 'absolute', left: 230, top: 1050, display: 'flex', gap: 30, alignItems: 'flex-end'}}>
        {blocks.map((b, i) => {
          const s = spring(f, b.at, 0.45, 0.55);
          return <div key={i} style={{width: 180, height: b.h, borderRadius: 26, background: b.c, transform: `translateY(${(1 - s) * 260}px)`, opacity: f >= b.at ? 1 : 0}} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- 7 · CTA --------------------------------------------------------------------------------------
const Scene7: React.FC<{f: number}> = ({f}) => {
  const k = K2;
  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <Sting f={f} start={k.s7 - 2} cy={640} />
      <EndCard
        f={f}
        start={k.s7 + 30}
        btnAt={k.teste}
        lines={[
          {t: 'VSL + PÁGINA + OFERTA', c: C.white},
          {t: 'NO MOMENTO CERTO.', c: '#8D8D92'},
        ]}
        y={1000}
      />
    </AbsoluteFill>
  );
};

export const C2: React.FC = () => {
  useFonts();
  useTextures();
  const f = useCurrentFrame();
  const k = K2;
  let scene: React.ReactNode;
  if (f < k.s2) scene = <Scene1 f={f} />;
  else if (f < k.s3) scene = <Scene2 f={f} />;
  else if (f < k.s3b) scene = <Scene3a f={f} />;
  else if (f < k.s4) scene = <Scene3b f={f} />;
  else if (f < k.s5) scene = <Scene4 f={f} />;
  else if (f < k.s6) scene = <Scene5 f={f} />;
  else if (f < k.s7) scene = <Scene6 f={f} />;
  else scene = <Scene7 f={f} />;
  return <AbsoluteFill style={{background: C.black, fontFamily: TEXT}}>{scene}</AbsoluteFill>;
};

void [RiseText, tween, approach];
