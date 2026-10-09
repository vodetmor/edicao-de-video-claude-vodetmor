import React from 'react';
import {Img, staticFile} from 'remotion';
import CUES from './cues.json';
import {Film, Shot, Cues} from './Film';
import {C, TEXT, MONO, DISPLAY} from './theme';
import {abs, approach, arrive, Brk, Btn, Burst, Chip, clamp, DirBlur, DotField, E, Estilo, Hand, hash, Icon, lerp, Logo, Nota, NUM, H, Odo, Onda, Phone, prog, spring, Tag, tween, vel} from './ui';
import {CheckPop, HL, linhaCupom, Stamp, Toggle, Typing} from './parts';

const A = CUES.A as unknown as Cues;
const ev = A.ev as Record<string, any>;
const I = A.ini;
const loc = (n: string, abs_: number) => abs_ - I[n];
const COD = 'Criativo 01';

// swinging pendulum angle (deg) around rest, released at `at`
const swing = (f: number, at: number, amp: number, rest: number, w = 0.32, z = 0.12) => {
  const t = Math.max(0, f - at);
  return rest + amp * Math.exp(-z * w * t) * Math.cos(w * t);
};

// ------------------------------------------------------------------ A01 · close extremo no hodômetro
const A01: Shot['render'] = (f, F) => {
  const z = tween(f, 0, 26, 1.1, 0.6, E.cam);
  return (
  <>
    <div style={abs({left: -40, top: 230, ...NUM, fontSize: 520, color: 'transparent', WebkitTextStroke: '1.5px #2a2a28', whiteSpace: 'nowrap', transform: `translateX(${-f * 0.6}px)`})}>39,90</div>
    <div style={abs({left: 34, top: 250, fontFamily: DISPLAY, fontWeight: 800, fontStretch: '70%', fontSize: 40, color: C.branco, opacity: arrive(f, 2, 0.3)})}>R$</div>
    <div style={abs({left: 0, top: 300, width: 540, display: 'flex', justifyContent: 'center', transform: `scale(${z})`, transformOrigin: '50% 40%'})}>
      <Odo f={F} txt="39,90" lands={ev.odo} size={330} color={C.ouro} ghost="#6d5c03" />
    </div>
    <div style={abs({left: 34, top: 600, width: 472 * arrive(f, ev.odo[1], 0.2), height: 3, background: C.ouro})} />
    <Nota x={34} y={614} txt={'PREÇO UNITÁRIO / CRIATIVO'} cor={C.branco} f={f} at={ev.odo[1]} />
    <Nota x={506} y={232} txt={'REF 001'} cor={C.branco} f={f} at={6} align="right" />
    <Burst f={F} at={ev.odo[1]} x={270} y={430} r={190} cor={C.ouro} />
  </>
  );
};

// ------------------------------------------------------------------ A02 · a câmera abre: é uma etiqueta balançando
const A02: Shot['render'] = (f, F) => {
  const drop = approach(f, 0, -420, 0, 0.22);
  const ang = swing(f, 0, 26, 18, 0.3, 0.14);
  const hx = 118, hy = 352 + drop;
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.13} />
      <svg width={540} height={960} style={abs({left: 0, top: 0})}>
        <path d={`M270 -10 L${hx} ${hy}`} stroke={C.preto} strokeWidth={3} fill="none" />
      </svg>
      <div style={abs({left: hx - 400 * 0.06 - 4, top: hy - 400 * 0.28 + 2, transform: `rotate(${ang}deg)`, transformOrigin: `${400 * 0.06 + 4}px ${400 * 0.28}px`})}>
        <Tag w={400} sub="CADA CRIATIVO">
          <div style={{display: 'flex', alignItems: 'baseline', color: C.preto}}>
            <span style={{...NUM, fontSize: 42, marginRight: 6}}>R$</span>
            <Odo f={F} txt="39,90" lands={ev.odo} size={100} color={C.preto} />
          </div>
        </Tag>
      </div>
      <Burst f={F} at={ev.odo[3]} x={400} y={470 + drop} r={90} cor={C.preto} />
      <Nota x={34} y={880} txt={'UN. — R$ 39,90'} cor={C.preto} f={f} at={10} />
    </>
  );
};

// ------------------------------------------------------------------ A03 · pendurada num celular que toca um criativo
const A03: Shot['render'] = (f) => {
  const py = approach(f, 0, 520, 0, 0.2);
  const ang = swing(f, 2, 22, 62, 0.34, 0.16);
  return (
    <>
      <DotField f={f} cor={C.branco} op={0.06} />
      <Phone w={226} style={{left: 150, top: 170 + py, transform: `rotate(${-4 + (1 - arrive(f, 0, 0.2)) * 8}deg)`}}>
        <Estilo i={1} w={226} h={402} f={f + 20} />
      </Phone>
      <svg width={540} height={960} style={abs({left: 0, top: 0, zIndex: 3})}>
        <path d={`M362 ${186 + py} C 420 ${200 + py}, 430 ${250 + py}, ${405} ${292 + py}`} stroke={C.branco} strokeWidth={2.5} fill="none" />
      </svg>
      <div style={abs({left: 395, top: 285 + py, zIndex: 4, transform: `rotate(${ang}deg)`, transformOrigin: '9px 42px'})}>
        <Tag w={150}>
          <div style={{...NUM, fontSize: 37, color: C.preto}}>
            <span style={{fontSize: '0.42em'}}>R$ </span>39,90
          </div>
        </Tag>
      </div>
      <HL f={f} top={640} size={96} lines={[{t: 'POR', c: C.branco, at: 0}, {t: 'CRIATIVO', c: C.ouro, at: 6}]} />
    </>
  );
};

// ------------------------------------------------------------------ A04 · SIM em eco + carimbo
const A04: Shot['render'] = (f) => {
  const sim = loc('A04', ev.sim);
  const isso = loc('A04', ev.isso);
  const scroll = -f * 0.8;
  return (
    <>
      {[0, 1, 3, 4, -1, 5].map((k) => {
        const d = Math.abs(k - 2);
        const p = arrive(f, sim + d * 2.5, 0.22);
        return (
          <div key={k} style={abs({left: 0, right: 0, top: 170 + k * 140 + scroll + (1 - p) * (k < 2 ? 60 : -60), textAlign: 'center', ...H, fontSize: 250, color: 'transparent', WebkitTextStroke: `2.5px ${C.preto}`, opacity: 0.45 * p})}>
            SIM.
          </div>
        );
      })}
      <div style={abs({left: 0, right: 0, top: 450 + scroll})}>
        <HL f={f} top={0} size={250} lines={[{t: 'SIM.', c: C.preto, at: sim}]} stagger={2} />
      </div>
      <Stamp f={f} at={isso} rot={-7} style={{left: 215, top: 610}}>
        <div style={{background: C.preto, color: C.ouro, fontFamily: DISPLAY, fontWeight: 900, fontStretch: '70%', fontSize: 34, padding: '10px 18px', borderRadius: 8, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>É isso mesmo</div>
      </Stamp>
      <Burst f={f} at={isso + 3} x={350} y={640} r={110} cor={C.preto} />
    </>
  );
};

// ------------------------------------------------------------------ A05 · pacote: caixa 3D (Blender) fechando com fita
const A05: Shot['render'] = (f) => {
  const q = f < 14 ? Math.round((f * 8) / 14) : f < 18 ? 8 : Math.min(32, 20 + Math.round(f - 18)); // flaps close on 'pacote', tape runs after
  const pac = loc('A05', ev.pacote);
  const p10 = 27;
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.08} />
      <Img src={staticFile(`caixa/caixa_${String(q).padStart(2, '0')}.webp`)} style={abs({left: 10, top: 300, width: 520, height: 520})} />
      <HL f={f} top={110} size={88} lines={[{t: 'FECHANDO', c: C.preto, at: 0}, {t: 'O PACOTE', c: C.ouroEs, at: pac - 2}]} />
      <Stamp f={f} at={p10} rot={-8} style={{left: 360, top: 640}}>
        <div style={{background: C.preto, color: C.ouro, ...NUM, fontSize: 40, padding: '8px 14px 4px', borderRadius: 8}}>10×</div>
      </Stamp>
      <Nota x={34} y={880} txt={'PACOTE · 10 UN. · ATÉ 30 s'} cor={C.preto} f={f} at={8} />
    </>
  );
};

// ------------------------------------------------------------------ A06 · leque de 10 celulares, cada um num estilo
const A06: Shot['render'] = (f) => {
  const ph = [];
  for (let k = 0; k < 10; k++) {
    const order = [4, 5, 3, 6, 2, 7, 1, 8, 0, 9].indexOf(k);
    const st = order * 1.4;
    const p = spring(f, st, 0.42, 0.68);
    const ang = (k - 4.5) * 9 * p;
    const x = 270 - 59 + (k - 4.5) * 42 * p;
    const y = lerp(980, 300 + Math.pow(Math.abs(k - 4.5), 1.6) * 8, p);
    ph.push(
      <Phone key={k} w={104} shadow={0.8} style={{left: x, top: y, transform: `rotate(${ang}deg)`, transformOrigin: '50% 120%', zIndex: 10 - Math.round(Math.abs(k - 4.5))}}>
        <Estilo i={k} w={104} h={185} f={f + k * 7} />
      </Phone>,
    );
  }
  return (
    <>
      <DotField f={f} cor={C.branco} op={0.05} />
      <HL f={f} top={120} size={92} lines={[{t: '10 CRIATIVOS', c: C.branco, at: 0, pc: (i: number) => (i < 2 ? C.ouro : undefined)}]} stagger={1} />
      <div style={abs({left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', pointerEvents: 'none'})} />
      {ph}
      <div style={abs({left: 0, right: 0, top: 660, textAlign: 'center', fontFamily: TEXT, fontWeight: 600, fontSize: 18, color: 'rgba(247,245,239,.75)', opacity: arrive(f, 10, 0.2)})}>cada um num estilo diferente</div>
    </>
  );
};

// ------------------------------------------------------------------ A07 · régua 0–30 s com timecode gigante
const A07: Shot['render'] = (f) => {
  const t0 = loc('A07', ev.trinta) - 4;
  const sec = clamp(Math.round(30 * E.prod(prog(f, t0, 20))), 0, 30);
  const head = 40 + 459 * (sec / 30);
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.1} />
      <div style={abs({left: 0, right: 0, top: 250, textAlign: 'center', ...NUM, fontSize: 170, color: C.preto})}>00:{String(sec).padStart(2, '0')}</div>
      {Array.from({length: 31}).map((_, k) => {
        const p = arrive(f, k * 0.35, 0.3);
        const hh = (k % 5 === 0 ? 34 : 16) * p;
        return (
          <React.Fragment key={k}>
            <div style={abs({left: 40 + k * 15.3, top: 560 - hh, width: 2, height: hh, background: C.preto})} />
            {k % 10 === 0 && <div style={abs({left: 32 + k * 15.3, top: 575, fontFamily: TEXT, fontWeight: 700, fontSize: 12, color: C.preto, opacity: p})}>{k}s</div>}
          </React.Fragment>
        );
      })}
      <div style={abs({left: 40, top: 556, width: 459 * arrive(f, 0, 0.2), height: 4, background: C.preto})} />
      <div style={abs({left: 40, top: 556, width: head - 40, height: 4, background: C.branco})} />
      <div style={abs({left: head - 1.5, top: 500, width: 3, height: 90, background: C.branco})} />
      <div style={abs({left: head - 9.5, top: 490, width: 19, height: 19, background: C.branco, transform: 'rotate(45deg)'})} />
      <HL f={f} top={660} size={58} lines={[{t: 'ATÉ 30 SEGUNDOS', c: C.preto, at: 3}]} stagger={0.9} />
      <Nota x={34} y={880} txt={'DURAÇÃO MÁX · 00:30'} cor={C.preto} f={f} at={12} />
    </>
  );
};

// ------------------------------------------------------------------ A08 · cupom fiscal imprimindo até o total
const A08: Shot['render'] = (f, F) => {
  const nl = clamp(Math.floor(f / 1.8) + 1, 0, 10);
  const paper = 60 + nl * 25 + (f > 20 ? 110 * arrive(f, 20, 0.2) : 0);
  const p399 = loc('A08', ev.p399);
  const tot = loc('A08', ev.total) - 4;
  // camera: from whole receipt to the total
  const z = tween(f, 26, 40, 1, 1.22, E.cam);
  const ty = 30 + tween(f, 26, 40, 0, -30, E.cam);
  const lands = [p399 + 8, p399 + 24, p399 + 38].map((x) => x + I.A08);
  return (
    <>
      <DotField f={f} cor={C.branco} op={0.05} />
      <div style={abs({inset: 0, transform: `translateY(${ty}px) scale(${z})`, transformOrigin: '270px 520px'})}>
        <div style={abs({left: 110, top: 118, width: 320, height: 16, borderRadius: 8, background: '#262624', boxShadow: 'inset 0 -3px 0 #111'})} />
        <div style={abs({left: 126, top: 126, width: 288, height: paper, overflow: 'hidden'})}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: 288,
              padding: '22px 22px 28px',
              background: '#FBFAF6',
              clipPath: 'polygon(0 0,100% 0,100% 100%,95% 98.6%,90% 100%,85% 98.6%,80% 100%,75% 98.6%,70% 100%,65% 98.6%,60% 100%,55% 98.6%,50% 100%,45% 98.6%,40% 100%,35% 98.6%,30% 100%,25% 98.6%,20% 100%,15% 98.6%,10% 100%,5% 98.6%,0 100%)',
            }}
          >
            <div style={{fontFamily: TEXT, fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', textAlign: 'center', color: '#111', marginBottom: 10}}>REI DA VSL</div>
            {Array.from({length: nl}).map((_, k) => linhaCupom(k))}
            {f > 20 && (
              <>
                <div style={{borderTop: '2px dashed #999', margin: '12px 0 8px'}} />
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                  <span style={{fontFamily: TEXT, fontWeight: 800, fontSize: 16, color: '#111'}}>TOTAL</span>
                  <span style={{display: 'flex', alignItems: 'baseline', color: '#111'}}>
                    <span style={{...NUM, fontSize: 30, marginRight: 4}}>R$</span>
                    <Odo f={F} txt="399" lands={lands} size={66} color="#111" />
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Burst f={F} at={lands[2]} x={380} y={540} r={80} cor={C.ouro} />
      <HL f={f} top={630} size={70} lines={[{t: 'NO TOTAL', c: C.ouro, at: tot}]} />
      <Nota x={34} y={880} txt={`CUPOM 0010 · ${String(nl).padStart(2, '0')}/10`} cor={C.branco} f={f} at={2} />
    </>
  );
};

// ------------------------------------------------------------------ A09 · close no cupom: cada linha confere, carimbo TUDO INCLUSO
const A09: Shot['render'] = (f) => {
  const inc = loc('A09', ev.incluso);
  return (
    <>
      <div style={abs({left: -40, top: 210, width: 620, height: 560, background: '#FBFAF6', transform: `rotate(-6deg) translateX(${-f * 0.5}px)`, boxShadow: '0 20px 40px rgba(0,0,0,.5)'})}>
        {[4, 5, 6, 7, 8, 9].map((k, j) => (
          <div key={k} style={{display: 'flex', alignItems: 'center', margin: '16px 70px'}}>
            <div style={{flex: 1}}>{linhaCupom(k, 34, f > j * 3 + 2 ? '#bbb' : '#333')}</div>
            <div style={{width: 40, marginLeft: 14, position: 'relative', height: 34}}>
              <CheckPop f={f} at={j * 3 + 2} s={32} style={{left: 0, top: 0}} />
            </div>
          </div>
        ))}
      </div>
      <Stamp f={f} at={inc} rot={-14} style={{left: 58, top: 390}}>
        <div style={{border: `9px solid ${C.ouro}`, color: C.ouroEs, fontFamily: DISPLAY, fontWeight: 900, fontStretch: '66%', fontSize: 76, padding: '4px 24px', borderRadius: 14, lineHeight: 1, textAlign: 'center', background: 'rgba(251,250,246,.75)', textTransform: 'uppercase'}}>
          Tudo
          <br />
          incluso
        </div>
      </Stamp>
      <Burst f={f} at={inc + 3} x={220} y={470} r={170} n={14} cor={C.ouro} />
    </>
  );
};

// ------------------------------------------------------------------ A10 · COPY: a frase sendo escrita
const A10: Shot['render'] = (f) => (
  <>
    <DotField f={f} cor={C.preto} op={0.07} />
    <Chip x={40} y={120} txt="COPY" f={f} at={0} />
    <div style={abs({left: 40, top: 250, transform: `rotate(${Math.sin(f * 0.8) * 6}deg)`})}>
      <Icon n="pen-nib" s={54} c={C.ouroEs} />
    </div>
    <HL f={f} top={340} size={80} align="left" left={40} stagger={0.35} lines={[{t: 'SEU CLIENTE', c: C.preto, at: 0}, {t: 'DECIDE EM', c: C.preto, at: 2}, {t: '3 SEG', c: C.ouroEs, at: 4}]} />
    {[440, 380, 410, 250].map((w, k) => (
      <div key={k} style={abs({left: 40, top: 620 + k * 30, width: w * arrive(f, 4 + k * 2, 0.2), height: 12, borderRadius: 6, background: '#E4E1D8'})} />
    ))}
  </>
);

// ------------------------------------------------------------------ A11 · LOCUÇÃO: microfone + a onda real da voz
const A11: Shot['render'] = (f) => {
  const s = spring(f, 0, 0.4, 0.55);
  return (
    <>
      <Chip x={40} y={120} txt="LOCUÇÃO" f={f} at={0} />
      {[0, 1, 2].map((k) => {
        const t = ((f + k * 9) % 27) / 27;
        return <div key={k} style={abs({left: 270 - 65 - t * 70, top: 265 - 65 - t * 70, width: 130 + t * 140, height: 130 + t * 140, borderRadius: '50%', border: `2px solid ${C.ouro}`, opacity: (1 - t) * 0.5})} />;
      })}
      <div style={abs({left: 205, top: 200, width: 130, height: 130, borderRadius: '50%', background: C.ouro, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`})}>
        <Icon n="microphone" s={70} c={C.preto} />
      </div>
      <Onda x={-10} y={400} w={560} h={300} k="texto-1" f={f} live={1} ate={tween(f, 0, 28, 0.15, 0.62, E.prod)} />
      <div style={abs({left: 0, right: 0, top: 715, textAlign: 'center', fontFamily: TEXT, fontWeight: 600, fontSize: 18, color: 'rgba(247,245,239,.75)'})}>a voz deste anúncio</div>
    </>
  );
};

// ------------------------------------------------------------------ A12 · EDIÇÃO: clipes estalando na timeline
const A12: Shot['render'] = (f) => {
  const rows: [number, number, string][][] = [
    [[0, 110, C.ouro], [114, 90, C.ouroCl], [208, 150, C.ouro], [362, 98, C.ouroEs]],
    [[0, 70, '#5b5a55'], [74, 140, '#5b5a55'], [218, 120, '#5b5a55'], [342, 118, '#5b5a55']],
  ];
  const ph = 300 + f * 2.2;
  return (
    <>
      <Chip x={40} y={120} txt="EDIÇÃO" f={f} at={0} />
      <Phone w={200} style={{left: 165, top: 170 + approach(f, 0, 40, 0, 0.25)}}>
        <Estilo i={6} w={200} h={356} f={f + 10} />
      </Phone>
      {rows.map((r, ri) =>
        r.map(([a, b, c], ci) => {
          const st = ri * 2 + ci * 2.2;
          const x = approach(f, st, 560, 40 + a, 0.32);
          const v = Math.abs(approach(f + 0.5, st, 560, 40 + a, 0.32) - approach(f - 0.5, st, 560, 40 + a, 0.32));
          return (
            <DirBlur key={`${ri}${ci}`} x={Math.min(18, v * 0.5)} style={abs({left: x, top: 610 + ri * 62, width: b - 4, height: 46})}>
              <div style={{width: '100%', height: '100%', borderRadius: 7, background: c}} />
            </DirBlur>
          );
        }),
      )}
      <Onda x={40} y={734} w={460} h={46} k="texto-1" cor="#8f8a7c" dim="#8f8a7c" />
      <div style={abs({left: ph, top: 590, width: 3, height: 220, background: C.branco})} />
      <div style={abs({left: ph - 8, top: 580, width: 19, height: 19, background: C.branco, transform: 'rotate(45deg)'})} />
    </>
  );
};

// ------------------------------------------------------------------ A13 · NOVO: 10 vídeos prontos -> organizados em 3 campanhas ativas
const A13: Shot['render'] = (f) => {
  const dez = loc('A13', ev.dez2);
  const pr = loc('A13', ev.prontos);
  const us = loc('A13', ev.usar) - 4;
  const cp = loc('A13', ev.campanhas);
  // grid (phase 1) and campaign slots (phase 3)
  const gw = 84, gh = 149;
  const grid = (k: number) => ({x: 270 - (5 * gw + 4 * 10) / 2 + (k % 5) * (gw + 10), y: 230 + Math.floor(k / 5) * (gh + 14)});
  const cols = [[0, 1, 2, 3], [4, 5, 6], [7, 8, 9]];
  const sw = 58, sh = 103;
  const colX = [44, 196, 348];
  const slot = (k: number) => {
    const c = cols.findIndex((cc) => cc.includes(k));
    const j = cols[c].indexOf(k);
    return {x: colX[c] + 8 + (j % 2) * (sw + 8), y: 270 + Math.floor(j / 2) * (sh + 8)};
  };
  const board = arrive(f, us - 6, 0.2);
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.12} />
      {/* ads manager board */}
      {board > 0.002 && <div style={abs({left: 30, top: 170 + (1 - board) * 800, width: 480, height: 420, borderRadius: 22, background: '#fff', boxShadow: '0 24px 50px rgba(0,0,0,.25)'})}>
        <div style={abs({left: 20, top: 18, fontFamily: TEXT, fontWeight: 800, fontSize: 15, color: C.preto})}>Gerenciador de anúncios</div>
        <div style={abs({right: 20, top: 18, fontFamily: TEXT, fontWeight: 600, fontSize: 11, color: C.cinza})}>3 campanhas · 10 anúncios</div>
        {[0, 1, 2].map((c) => (
          <div key={c} style={abs({left: colX[c] - 30, top: 52, width: 140, height: 350, borderRadius: 14, background: '#F4F2EC'})}>
            <div style={abs({left: 10, top: 12, fontFamily: TEXT, fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', color: C.preto})}>CAMPANHA {String.fromCharCode(65 + c)}</div>
            <div style={abs({right: 8, top: 9})}>
              <Toggle on={clamp(prog(f, cp + c * 3, 4))} w={30} />
            </div>
            <div style={abs({left: 10, bottom: 12, display: 'flex', alignItems: 'center', gap: 5, fontFamily: TEXT, fontWeight: 600, fontSize: 10, color: f >= cp + c * 3 + 3 ? '#14873E' : C.cinza})}>
              <div style={{width: 6, height: 6, borderRadius: 3, background: f >= cp + c * 3 + 3 ? '#1DB954' : '#CFCBC0'}} />
              {f >= cp + c * 3 + 3 ? 'Ativa' : 'Rascunho'}
            </div>
          </div>
        ))}
      </div>}
      {/* the 10 videos */}
      {Array.from({length: 10}).map((_, k) => {
        const inP = spring(f, dez - 6 + k * 1.3, 0.4, 0.7);
        const g = grid(k);
        const s = slot(k);
        const m = E.cam(prog(f, us + (k % 5) * 1.2, 14));
        const fx = lerp(g.x + (hash(k, 1) - 0.5) * 300, g.x, inP);
        const fy = lerp(-200 - hash(k, 2) * 200, g.y, inP);
        const x = lerp(fx, s.x + 30, m);
        const y = lerp(fy, s.y - 0, m);
        const w = lerp(gw, sw, m), h = lerp(gh, sh, m);
        const r = (1 - inP) * (hash(k, 3) - 0.5) * 40;
        return (
          <div key={k} style={abs({left: x, top: y, width: w, height: h, borderRadius: 10 * (w / gw), overflow: 'hidden', transform: `rotate(${r}deg)`, boxShadow: '0 8px 18px rgba(0,0,0,.28)', zIndex: 5})}>
            <div style={{width: gw, height: gh, transform: `scale(${w / gw})`, transformOrigin: '0 0', position: 'relative'}}>
              <Estilo i={k} w={gw} h={gh} f={f + k * 5} brk={false} />
            </div>
            <CheckPop f={f} at={pr + k * 1} s={20 * (w / gw) + 4} style={{right: 4, top: 4}} />
          </div>
        );
      })}
      <div style={abs({left: 0, right: 0, top: 140, textAlign: 'center', opacity: 1 - board})}>
        <span style={{...NUM, fontSize: 64, color: C.preto}}>10 </span>
        <span style={{fontFamily: TEXT, fontWeight: 700, fontSize: 22, color: C.preto}}>vídeos</span>
      </div>
      <HL f={f} top={612} size={56} lines={[{t: 'PRONTOS PRAS', c: C.preto, at: pr - 2}, {t: 'SUAS CAMPANHAS', c: C.preto, at: cp - 8}]} />
    </>
  );
};

// ------------------------------------------------------------------ A14 · teste A/B: a coroa pousa no vencedor
const A14: Shot['render'] = (f) => {
  const dif = loc('A14', ev.diferentes);
  const abd = loc('A14', ev.abordagens);
  const split = tween(f, dif - 4, 10, 540, 270, E.expr);
  const cA = (1.2 * E.prod(prog(f, dif + 4, 16))).toFixed(1).replace('.', ',');
  const cB = (3.8 * E.prod(prog(f, dif + 4, 22))).toFixed(1).replace('.', ',');
  const crownY = approach(f, abd - 4, -260, 260, 0.3);
  const crownR = 8 + (f > abd ? 10 * Math.exp(-(f - abd) * 0.25) * Math.sin((f - abd) * 0.9) : 0);
  const dim = f > abd ? 0.5 : 1;
  return (
    <>
      <div style={abs({left: 0, top: 0, width: split, height: 960, overflow: 'hidden', opacity: lerp(1, 0.55, clamp((f - abd) / 6)) * dim + (1 - dim) * 0})}>
        <div style={abs({left: 0, top: 0, width: 270, height: 960, transform: `translateX(${(split - 270) / 2}px)`})}>
          <Estilo i={9} w={270} h={960} f={f + 10} brk={false} />
        </div>
      </div>
      <div style={abs({left: split, top: 0, width: 540 - split + 1, height: 960, overflow: 'hidden'})}>
        <div style={abs({left: 270 - split, top: 0, width: 270, height: 960})}>
          <Estilo i={1} w={270} h={960} f={f} brk={false} />
        </div>
      </div>
      <div style={abs({left: split - 1.5, top: 0, width: 3, height: 960, background: C.branco})} />
      <div style={abs({left: 30, top: 140, ...NUM, fontSize: 90, color: C.branco})}>A</div>
      {split < 530 && <div style={abs({left: split + 30, top: 140, ...NUM, fontSize: 90, color: C.branco})}>B</div>}
      {f > dif + 2 && (
        <>
          <div style={abs({left: 30, top: 470, fontFamily: TEXT, fontWeight: 600, fontSize: 14, color: '#ccc', letterSpacing: '0.1em'})}>CLIQUES</div>
          <div style={abs({left: 30, top: 495, ...NUM, fontSize: 70, color: '#ccc', textShadow: '0 2px 10px rgba(0,0,0,.35)'})}>{cA}%</div>
          <div style={abs({left: 300, top: 470, fontFamily: TEXT, fontWeight: 600, fontSize: 14, color: '#fff', letterSpacing: '0.1em'})}>CLIQUES</div>
          <div style={abs({left: 300, top: 495, ...NUM, fontSize: 70, color: '#fff'})}>{cB}%</div>
        </>
      )}
      {f > abd - 6 && <Img src={staticFile('img/coroa_rei_da_VSL.png')} style={abs({left: 330, top: crownY, width: 150, transform: `rotate(${crownR}deg)`, filter: 'drop-shadow(0 10px 14px rgba(0,0,0,.35))'})} />}
      <Burst f={f} at={abd} x={405} y={320} r={100} cor={C.branco} />
      <div style={abs({left: 0, right: 0, top: 628, padding: '14px 0', background: C.preto, textAlign: 'center', transform: `translateY(${(1 - arrive(f, dif, 0.25)) * 220}px)`})}>
        <span style={{fontFamily: DISPLAY, fontWeight: 900, fontStretch: '66%', fontSize: 44, color: C.branco, textTransform: 'uppercase'}}>
          Teste <span style={{color: C.ouro}}>abordagens</span>
        </span>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ A15 · fim: logo real + botão apertado
const A15: Shot['render'] = (f) => {
  const sab = loc('A15', ev.saiba);
  const fale = loc('A15', ev.fale);
  const lg = spring(f, 0, 0.3, 0.8);
  const bt = spring(f, 6, 0.35, 0.6);
  const hx = approach(f, 8, 560, 350, 0.16);
  const hy = approach(f, 8, 900, 465, 0.16);
  const press = f >= sab && f < sab + 6 ? Math.sin(((f - sab) / 6) * Math.PI) : 0;
  const ripple = f >= sab ? prog(f, sab, 22) : 0;
  return (
    <>
      <DotField f={f} cor={C.branco} op={0.05} />
      <div style={abs({left: 70, top: 160, transform: `scale(${0.9 + 0.1 * lg})`, opacity: clamp(lg * 1.5), transformOrigin: '50% 50%'})}>
        <Logo f="LOGO_rei_da_VSL_horizontal.png" w={400} />
      </div>
      <div style={abs({left: 0, right: 0, top: 310, textAlign: 'center', fontFamily: TEXT, fontWeight: 600, fontSize: 26, color: C.branco, opacity: arrive(f, 4, 0.2)})}>
        10 criativos · <span style={{color: C.ouro}}>R$ 399</span>
      </div>
      {ripple > 0 && ripple < 1 && (
        <div style={abs({left: 270 - 200 - ripple * 120, top: 450 - 50 - ripple * 120, width: 400 + ripple * 240, height: 100 + ripple * 240, borderRadius: 999, border: `3px solid ${C.ouro}`, opacity: (1 - ripple) * 0.7})} />
      )}
      <Btn w={400} h={100} txt="Saiba mais" press={press} style={{left: 70, top: 400, transform: `scale(${bt * (1 - press * 0.05)})`}} />
      <Hand x={hx} y={hy} press={press} />
      <div style={abs({left: 0, top: 588, width: 540, height: 124, overflow: 'hidden', opacity: arrive(f, 10, 0.12)})}>
        {Array.from({length: 12}).map((_, k) => {
          const x = ((k * 72 - f * 1.4) % (12 * 72) + 12 * 72) % (12 * 72) - 72;
          return (
            <div key={k} style={abs({left: x, top: 8, width: 62, height: 110, borderRadius: 9, overflow: 'hidden', boxShadow: '0 6px 14px rgba(0,0,0,.4)'})}>
              <Estilo i={k % 10} w={62} h={110} f={f + k * 6} brk={false} />
            </div>
          );
        })}
      </div>
      <div style={abs({left: 0, right: 0, top: 530, textAlign: 'center', fontFamily: TEXT, fontWeight: 600, fontSize: 22, color: 'rgba(247,245,239,.8)', opacity: arrive(f, fale, 0.2), transform: `translateY(${(1 - arrive(f, fale, 0.2)) * 12}px)`})}>
        e fale com a gente
      </div>
    </>
  );
};

const SHOTS: Shot[] = [
  {n: 'A01', bg: C.preto, hud: C.branco, enter: 'cut', push: 0.0012, shake: [ev.odo[0], ev.odo[1]], render: A01},
  {n: 'A02', bg: C.ouro, hud: C.preto, enter: 'zoomOut', shake: [ev.odo[3]], render: A02},
  {n: 'A03', bg: C.preto, hud: C.branco, enter: 'whipU', render: A03},
  {n: 'A04', bg: C.ouro, hud: C.preto, enter: 'punch', shake: [ev.isso + 3], render: A04},
  {n: 'A05', bg: C.branco, hud: C.preto, enter: 'whipL', shake: [ev.fita + 2], render: A05},
  {n: 'A06', bg: C.preto, hud: C.branco, enter: 'whipU', render: A06},
  {n: 'A07', bg: C.ouro, hud: C.preto, enter: 'whipL', render: A07},
  {n: 'A08', bg: C.preto, hud: C.branco, enter: 'punch', push: 0.0003, shake: [I.A08 + loc('A08', ev.p399) + 52], render: A08},
  {n: 'A09', bg: C.preto, hud: C.branco, enter: 'punch', shake: [ev.incluso + 3], render: A09},
  {n: 'A10', bg: C.branco, hud: C.preto, enter: 'whipU', render: A10},
  {n: 'A11', bg: C.preto, hud: C.branco, enter: 'whipL', render: A11},
  {n: 'A12', bg: '#121211', hud: C.branco, enter: 'whipL', render: A12},
  {n: 'A13', bg: C.ouro, hud: C.preto, enter: 'whipU', push: 0.0003, render: A13},
  {n: 'A14', bg: C.preto, hud: C.branco, enter: 'punch', shake: [ev.abordagens], render: A14},
  {n: 'A15', bg: C.preto, hud: C.branco, enter: 'punch', push: 0.0004, render: A15},
];

export const CriativoA: React.FC = () => <Film cues={A} shots={SHOTS} cod={COD} />;
export const DUR_A = A.dur;
