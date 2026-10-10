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

// ------------------------------------------------------------------ A01 · gancho + CAPA: o preço 3D (Blender) já completo no quadro 0
// rodada 5 (Deidson): o 1º quadro é a capa da campanha, nada de tela vazia. Começa no quadro 64 do render (o ',90' acabou
// de pousar) e toca o assentamento; no 'noventa' o preço dá um pulso.
const A01: Shot['render'] = (f) => {
  const q = 64 + Math.min(24, Math.max(0, f));
  const pu = f >= ev.odo[1] ? 1 + 0.06 * Math.exp(-(f - ev.odo[1]) * 0.25) * Math.cos((f - ev.odo[1]) * 0.6) : 1;
  return (
    <>
      <DotField f={f} cor={C.branco} op={0.05} />
      <div style={abs({left: 40, top: 300, fontFamily: DISPLAY, fontWeight: 800, fontStretch: '70%', fontSize: 46, color: C.branco})}>R$</div>
      <Img src={staticFile(`preco/precoA_${String(q).padStart(2, '0')}.webp`)} style={abs({left: 0, top: 210, width: 540, height: 540, transform: `scale(${pu})`})} />
      <div style={abs({left: 70, top: 640, width: 400, height: 4, borderRadius: 2, background: C.ouro})} />
      <Burst f={f} at={ev.odo[1]} x={270} y={470} r={200} cor={C.ouro} />
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
  const scroll = -f * 0.4;
  return (
    <>
      <div style={abs({left: 0, right: 0, top: 450 + scroll})}>
        <HL f={f} top={0} size={250} lines={[{t: 'SIM.', c: C.preto, at: sim}]} stagger={2} />
      </div>
      <Stamp f={f} at={isso} rot={-7} style={{left: 215, top: 680}}>
        <div style={{background: C.preto, color: C.ouro, fontFamily: DISPLAY, fontWeight: 900, fontStretch: '70%', fontSize: 34, padding: '10px 18px', borderRadius: 8, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>É isso mesmo</div>
      </Stamp>
      <Burst f={f} at={isso + 3} x={350} y={640} r={110} cor={C.preto} />
    </>
  );
};

// ------------------------------------------------------------------ A05 · pacote: caixa 3D (Blender) fechando com fita
const A05: Shot['render'] = (f) => {
  // rodada 4: a caixa entra aberta na pausa antes de 'Fechando' (~1,3 s), as abas fecham com 'fechando o pacote'
  // (q 0-18), a fita corre (q 19-32) e a câmera orbita (q 33-80) até revelar '10 CRIATIVOS' em 'com dez criativos'
  const fe = loc('A05', ev.fechando);
  const pac = loc('A05', ev.pacote);
  const c0 = fe - 8, c1 = pac + 6; // flaps: 37 meio-passos (fecha_00..36, rodada 4c) espalhados por 26 quadros
  const q = f < c1 + 14 ? 18 + Math.max(0, f - c1) : Math.min(80, 32 + 2 * (f - c1 - 14));
  const src = f < c1 ? `fecha/fecha_${String(Math.round((36 * clamp((f - c0) / (c1 - c0))))).padStart(2, '0')}.webp` : `caixa/caixa_${String(q).padStart(2, '0')}.webp`;
  const fl = Math.sin(f * 0.07) * 6;
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.08} />
      <Img src={staticFile(src)} style={abs({left: 0, top: 270 + fl, width: 540, height: 540, WebkitMaskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent), linear-gradient(to bottom, transparent, #000 12%, #000 90%, transparent)', maskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent), linear-gradient(to bottom, transparent, #000 12%, #000 90%, transparent)', WebkitMaskComposite: 'source-in', maskComposite: 'intersect'})} />
      <HL f={f} top={110} size={88} lines={[{t: 'FECHANDO', c: C.preto, at: fe - 2}, {t: 'O PACOTE', c: C.ouroEs, at: pac - 2}]} />
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

// ------------------------------------------------------------------ A10 · tudo incluso: COPY, LOCUÇÃO, EDIÇÃO, cada uma na sua palavra
// rodada 4b: as 3 cenas rápidas (copy/locução/edição) viraram uma lista que se monta e fica legível
const A10: Shot['render'] = (f) => {
  const ats = [ev.copy, ev.locucao, ev.edicao].map((x) => loc('A10', x) - 3);
  const itens: [string, string][] = [['COPY', 'pen-nib'], ['LOCUÇÃO', 'microphone'], ['EDIÇÃO', 'film-strip']];
  return (
    <>
      <DotField f={f} cor={C.preto} op={0.07} />
      {itens.map(([t, ic], k) => {
        const p = spring(f, ats[k], 0.42, 0.7);
        if (f < ats[k]) return null;
        const y = 300 + k * 150;
        const ring = ((f - ats[k]) % 30) / 30;
        return (
          <React.Fragment key={k}>
            <div style={abs({left: 50, top: y, width: 112, height: 112, borderRadius: '24%', background: C.preto, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`})}>
              <div style={{transform: k === 0 ? `rotate(${Math.sin(f * 0.5) * 8}deg)` : k === 2 ? `translateX(${Math.sin(f * 0.4) * 3}px)` : 'none'}}>
                <Icon n={ic} s={58} c={C.ouro} />
              </div>
            </div>
            {k === 1 && <div style={abs({left: 50 + 56 - 56 - ring * 26, top: y + 56 - 56 - ring * 26, width: 112 + ring * 52, height: 112 + ring * 52, borderRadius: '28%', border: `2px solid ${C.ouro}`, opacity: (1 - ring) * 0.6})} />}
            <div style={abs({left: 190, top: y + 16, ...H, fontSize: 84, lineHeight: 1, color: k === 2 ? C.ouroEs : C.preto, opacity: clamp(p * 1.4), transform: `translateX(${(1 - p) * 40}px)`})}>{t}</div>
          </React.Fragment>
        );
      })}
      <HL f={f} top={215} size={40} align="left" left={50} lines={[{t: 'TUDO INCLUSO:', c: C.cinza, at: 0}]} />
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
      <div style={abs({left: 0, right: 0, top: 530, textAlign: 'center', fontFamily: TEXT, fontWeight: 600, fontSize: 22, color: 'rgba(247,245,239,.8)', opacity: arrive(f, fale, 0.2), transform: `translateY(${(1 - arrive(f, fale, 0.2)) * 12}px)`})}>
        e fale com a gente
      </div>
    </>
  );
};

const SHOTS: Shot[] = [
  {n: 'A01', bg: C.preto, hud: C.branco, enter: 'cut', push: 0.0008, shake: [ev.odo[1]], render: A01},
  {n: 'A03', bg: C.preto, hud: C.branco, enter: 'whipU', render: A03},
  {n: 'A04', bg: C.ouro, hud: C.preto, enter: 'punch', shake: [ev.isso + 3], render: A04},
  {n: 'A05', bg: C.branco, hud: C.preto, enter: 'whipL', shake: [ev.fita + 2], render: A05},
  {n: 'A07', bg: C.ouro, hud: C.preto, enter: 'whipL', render: A07},
  {n: 'A08', bg: C.preto, hud: C.branco, enter: 'punch', push: 0.0003, shake: [I.A08 + loc('A08', ev.p399) + 52], render: A08},
  {n: 'A09', bg: C.preto, hud: C.branco, enter: 'punch', shake: [ev.incluso + 3], render: A09},
  {n: 'A10', bg: C.branco, hud: C.preto, enter: 'whipU', render: A10},
  {n: 'A13', bg: C.ouro, hud: C.preto, enter: 'whipU', push: 0.0003, render: A13},
  {n: 'A14', bg: C.preto, hud: C.branco, enter: 'punch', shake: [ev.abordagens], render: A14},
  {n: 'A15', bg: C.preto, hud: C.branco, enter: 'punch', push: 0.0004, render: A15},
];

export const CriativoA: React.FC = () => <Film cues={A} shots={SHOTS} cod={COD} />;
export const DUR_A = A.dur;
