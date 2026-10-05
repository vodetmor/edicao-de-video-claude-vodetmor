import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, DISPLAY, TEXT} from '../theme';
import {T} from '../timeline';
import {arrive, clamp, E, lerp, mixColor, nSamples, prog, Samples, spring} from '../kit';
import {ChapterWord, fakeOf, FeatureText, timeStr} from './Common';
import {RibbonField} from './Ribbon';
import RET from '../data/retention.json';

// Chapter 2 · RETENÇÃO (Cyan): Barra Fictícia (a position/time diagram that runs with the bar) and the
// Gráfico de Retenção (the real demo curve, drawn with a camera that follows its head, ref-x).

// plot area shared by the diagram and the retention chart (chart space = screen space at zoom 1)
const X0 = 720;
const X1 = 1780;
const Y0 = 300;
const Y1 = 800;
const X = (u: number) => X0 + (X1 - X0) * u;
const Y = (v: number) => Y1 - (Y1 - Y0) * v;
const FB = {y: 862, h: 16}; // the fictitious bar, framed large
const INK = C.ink;
const CYAN_DARK = '#1B9CC0'; // cyan text on paper needs more contrast than the flat field color
const AXIS = '#767676'; // the axis hairline as it lands on paper (Ink at 0.55): the rising bar mixes straight to it

// ---- retention data ----------------------------------------------------------------
const PTS = RET.curve as {t: number; p: number}[];
const TEND = 184;
// monotone cubic (Fritsch-Carlson) through the traced points: smooth, no overshoot at the knee
const MT = (() => {
  const n = PTS.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((PTS[i + 1].p - PTS[i].p) / (PTS[i + 1].t - PTS[i].t));
  const m: number[] = [d[0]];
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  return m;
})();
const pAt = (t: number) => {
  if (t <= 0) return PTS[0].p;
  if (t >= PTS[PTS.length - 1].t) return PTS[PTS.length - 1].p;
  let i = 1;
  while (PTS[i].t < t) i++;
  const a = PTS[i - 1];
  const b = PTS[i];
  const h = b.t - a.t;
  const u = (t - a.t) / h;
  const h00 = 2 * u * u * u - 3 * u * u + 1;
  const h10 = u * u * u - 2 * u * u + u;
  const h01 = -2 * u * u * u + 3 * u * u;
  const h11 = u * u * u - u * u;
  return h00 * a.p + h10 * h * MT[i - 1] + h01 * b.p + h11 * h * MT[i];
};
// dense sample times for drawing (6 per traced interval)
const DENSE: number[] = [];
for (let i = 0; i < PTS.length - 1; i++) for (let j = 0; j < 6; j++) DENSE.push(PTS[i].t + ((PTS[i + 1].t - PTS[i].t) * j) / 6);
DENSE.push(PTS[PTS.length - 1].t);
const KNEE_T = 5.69;
const KNEE_P = pAt(KNEE_T); // 58.44 -> "-42% nos primeiros 6 s"
const H = (tau: number) => ({x: X(tau / TEND), y: Y(pAt(tau) / 100)});

// ---- timing -----------------------------------------------------------------------------
const CS2 = 534; // the Cyan field collapses into the head of the fictitious bar
const SWEEP = {a: 550, b: 582}; // playhead sweep (clock time: linear)
const MORPH = {a: T.chart, d: 12}; // 588: the diagram retracts and the fictitious bar rises into the time axis
const CH = MORPH.a + 8; // 596: the chart's grid and labels arrive, the camera zooms in
const DRAW0 = CH + 4; // 600
const KNEE = T.chartKnee; // 630
const DRAW1 = KNEE + 10; // 640
const DRAW_END = DRAW1 + 22; // 662
const KPI0 = T.chartKpi; // 654
const HOLD = DRAW_END; // everything is on screen from here to the wipe (~50 frames)

const tau = (f: number) => {
  if (f < DRAW0) return 0;
  if (f < KNEE) return KNEE_T * E.prod(prog(f, DRAW0, KNEE - DRAW0));
  if (f < DRAW1) return lerp(KNEE_T, 6.5, (f - KNEE) / (DRAW1 - KNEE));
  return lerp(6.5, TEND, E.cam(prog(f, DRAW1, DRAW_END - DRAW1)));
};

// The camera is a chart app's zoom, anchored on the y axis (it never crosses into the title column): first
// the 6-second cliff fills the plot so it reads as a real curve with a knee; then the view widens with the
// head until the whole 03:04 shows. kx/ky are pixels per second / per percent; zooms are geometric.
type Cam = {px: number; py: number; kx: number; ky: number};
const ID: Cam = {px: X0, py: Y0, kx: (X1 - X0) / TEND, ky: (Y1 - Y0) / 100};
const ZW = 1824 - X0; // plot width while zoomed
const ZM: Cam = {px: X0, py: 250, kx: ZW / 16.2, ky: 650 / 68};
const mixCam = (a: Cam, b: Cam, u: number): Cam => ({
  px: lerp(a.px, b.px, u),
  py: lerp(a.py, b.py, u),
  kx: a.kx * Math.pow(b.kx / a.kx, u),
  ky: a.ky * Math.pow(b.ky / a.ky, u),
});
const ZOOM_IN = 16;
const pushK = (f: number) => 1 + 0.0016 * clamp(f - (CH + ZOOM_IN), 0, DRAW1 - (CH + ZOOM_IN));
// a slow push on the whole stage while the diagram is read; another once the chart is complete
const stagePush = (f: number) => (1 + 0.0004 * clamp(f - 540, 0, CH - 540)) * (1 + 0.0005 * Math.max(0, f - HOLD));
const camAt = (f: number): Cam => {
  if (f < DRAW1) {
    const z = mixCam(ID, ZM, E.cam(prog(f, CH, ZOOM_IN)));
    const k = pushK(f);
    return {...z, kx: z.kx * k, ky: z.ky * k};
  }
  // the view's time span follows the head (head at 86% of the plot width) until it shows everything
  const tv = tau(f);
  const zm = {...ZM, kx: ZM.kx * pushK(f), ky: ZM.ky * pushK(f)};
  const spanZ = ZW / zm.kx;
  const w = clamp(tv / 0.86, spanZ, TEND);
  const u = Math.log(w / spanZ) / Math.log(TEND / spanZ);
  return mixCam(zm, ID, u);
};
const toS = (cam: Cam, x: number, y: number) => {
  const t = ((x - X0) / (X1 - X0)) * TEND;
  const v = ((Y1 - y) / (Y1 - Y0)) * 100;
  return {x: cam.px + t * cam.kx, y: cam.py + (100 - v) * cam.ky};
};
const camSpan = (cam: Cam) => 1060 / cam.kx;
// the fastest on-screen chart point during the shutter (plot corners, the knee, the head)
const CAM_SHUTTER = 0.5;
const camDisp = (f: number) => {
  const ca = camAt(f - CAM_SHUTTER / 2);
  const cb = camAt(f + CAM_SHUTTER / 2);
  const h = H(tau(f));
  const probes = [[X0, Y0], [X0, Y1], [X1, Y1], [X1, Y0], [X(KNEE_T / TEND), Y(KNEE_P / 100)], [h.x, h.y], [X(16 / TEND), Y1], [X(30 / TEND), Y(0.3)]];
  let d = 0;
  for (const [x, y] of probes) {
    const a = toS(ca, x, y);
    const b = toS(cb, x, y);
    if (b.x < -200 || b.x > 2120 || b.y < -200 || b.y > 1280) continue;
    d = Math.max(d, Math.hypot(b.x - a.x, b.y - a.y));
  }
  return d;
};

// ---- the field collapse ---------------------------------------------------------------------
const collapseRect = (ff: number) => {
  const a = arrive(ff, CS2, 0.2);
  return {x: lerp(0, X0, a), y: lerp(0, FB.y - FB.h / 2, a), w: lerp(1920, FB.h, a), h: lerp(1080, FB.h, a), a};
};
const Collapse: React.FC<{f: number}> = ({f}) => {
  if (f < CS2 || f > CS2 + 22) return null;
  const ra = collapseRect(f - 0.25);
  const rb = collapseRect(f + 0.25);
  const disp = Math.max(Math.abs(rb.x - ra.x), Math.abs(rb.y - ra.y), Math.abs(rb.x + rb.w - ra.x - ra.w), Math.abs(rb.y + rb.h - ra.y - ra.h));
  return (
    <Samples
      f={f}
      n={nSamples(disp, 4, 40)}
      shutter={0.5}
      render={(ff) => {
        const r = collapseRect(ff);
        return <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, background: C.cyan, borderRadius: lerp(0, 3, r.a)}} />;
      }}
    />
  );
};

// ---- chart layer (screen space; every point goes through the camera) -------------------------
const ChartLayer: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  const P = (x: number, y: number) => toS(cam, x, y);
  const els: React.ReactNode[] = [];

  // Diagram -> chart, a morph with no dissolve: the curves draw back into the origin, the fictitious bar rises
  // and thins into the time axis, the readouts step away
  const retract = E.exit(prog(f, MORPH.a, 10));
  const rise = E.expr(prog(f, MORPH.a + 2, 10));
  const readOut = 1 - prog(f, MORPH.a - 2, 6);
  const diagOn = f < MORPH.a + MORPH.d + 1;
  const chartIn = arrive(f, CH, 0.18);

  // axes (both scenes)
  const axY = E.prod(prog(f, CS2 + 4, 12));
  const axX = E.prod(prog(f, CS2 + 6, 14));
  const o = P(X0, Y1);
  const yTop = P(X0, lerp(Y1, Y0 - 10, axY));
  const xEnd = P(lerp(X0, X1, axX), Y1);
  els.push(<line key="ay" x1={o.x} y1={o.y} x2={yTop.x} y2={yTop.y} stroke={INK} strokeOpacity={0.55} strokeWidth={1.5} />);

  // gridlines + labels of the chart
  if (chartIn > 0.01) {
    [0.25, 0.5, 0.75, 1].forEach((v, i) => {
      const gi = arrive(f, CH + 2 + i * 2, 0.2);
      const a = P(X0, Y(v));
      const b = P(lerp(X0, X1, gi), Y(v));
      els.push(<line key={'g' + v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} strokeOpacity={0.1} strokeWidth={1} />);
    });
    [0, 0.25, 0.5, 0.75, 1].forEach((v, i) => {
      const a = P(X0, Y(v));
      els.push(
        <text key={'yl' + v} x={a.x - 16} y={a.y + 8} textAnchor="end" fontFamily={TEXT} fontWeight={500} fontSize={23} fill={INK} fillOpacity={0.45 * arrive(f, CH + 4 + i * 2, 0.2)} style={{fontVariantNumeric: 'tabular-nums'}}>
          {`${v * 100}%`}
        </text>,
      );
    });
    const fine = 1 - clamp((camSpan(cam) - 30) / 30); // seconds ticks while the time axis is zoomed
    [0, 5, 10, 15, 20, 25, 30, 60, 120, 180].forEach((s, i) => {
      const minute = s % 60 === 0;
      const op = s === 0 ? 1 : minute ? 1 - fine : fine;
      if (op <= 0.01) return;
      const a = P(X(s / TEND), Y1);
      if (a.x < -100 || a.x > 2020) return;
      els.push(
        <text key={'xl' + s} x={a.x} y={a.y + 38} textAnchor={s === 0 ? 'start' : 'middle'} fontFamily={TEXT} fontWeight={500} fontSize={23} fill={INK} fillOpacity={0.45 * op * arrive(f, CH + 6 + Math.min(i, 3) * 2, 0.2)} style={{fontVariantNumeric: 'tabular-nums'}}>
          {timeStr(s)}
        </text>,
      );
    });
  }

  // ---- DIAGRAM (Barra Fictícia) -----------------------------------------------------------
  const t = clamp((f - SWEEP.a) / (SWEEP.b - SWEEP.a)); // clock time: linear
  if (diagOn) {
    const g: React.ReactNode[] = [];
    const reach = 1 - retract; // how much of each curve is still drawn
    // dashed diagonal: real time
    const dg = E.prod(prog(f, CS2 + 10, 14)) * reach;
    const d0 = P(X0, Y1);
    const d1 = P(X(dg), Y(dg));
    if (dg > 0.002) g.push(<line key="diag" x1={d0.x} y1={d0.y} x2={d1.x} y2={d1.y} stroke={C.gray} strokeWidth={2.5} strokeDasharray="9 8" />);
    // fictitious curve up to the playhead
    const tc = t * reach;
    if (tc > 0.002) {
      const n = 64;
      let d = '';
      for (let i = 0; i <= n; i++) {
        const u = (tc * i) / n;
        const q = P(X(u), Y(fakeOf(u)));
        d += `${i === 0 ? 'M' : 'L'}${q.x.toFixed(1)},${q.y.toFixed(1)} `;
      }
      g.push(<path key="fk" d={d} fill="none" stroke={C.cyan} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />);
    }
    if (t > 0 && readOut > 0) {
      // reflection through the diagonal: curve point -> diagonal -> down to the bar
      const vis = (1 - prog(f, SWEEP.b, 8)) * readOut;
      const fk = fakeOf(t);
      const c = P(X(t), Y(fk));
      const m = P(X(fk), Y(fk));
      const bar = P(X(fk), FB.y - FB.h / 2 - 4);
      if (vis > 0) {
        g.push(
          <g key="refl" opacity={vis}>
            <line x1={c.x} y1={c.y} x2={m.x} y2={m.y} stroke={CYAN_DARK} strokeWidth={1.5} strokeDasharray="4 5" />
            <line x1={m.x} y1={m.y} x2={bar.x} y2={bar.y} stroke={CYAN_DARK} strokeWidth={1.5} strokeDasharray="4 5" />
            <circle cx={m.x} cy={m.y} r={5} fill={C.paper} stroke={C.gray} strokeWidth={2} />
          </g>,
        );
      }
      // playhead
      const ph0 = P(X(t), Y0 - 20);
      const ph1 = P(X(t), Y1);
      g.push(<line key="ph" x1={ph0.x} y1={ph0.y} x2={ph1.x} y2={ph1.y} stroke={INK} strokeOpacity={0.35 * vis} strokeWidth={1.5} />);
      const dp = P(X(t), Y(t));
      g.push(<circle key="dp" cx={dp.x} cy={dp.y} r={6} fill={C.gray} opacity={readOut} />);
      g.push(<circle key="cp" cx={c.x} cy={c.y} r={9} fill={C.cyan} stroke="#fff" strokeWidth={3} opacity={readOut} />);
    }
    // the fictitious bar (track + fill), rising into the time axis: up to the axis, down to a hairline, to ink
    const by = lerp(FB.y, Y1, rise);
    const bh = lerp(FB.h, 1.5, rise);
    const tr0 = P(X0, by);
    const tr1 = P(lerp(X0, X1, E.prod(prog(f, CS2 + 12, 14))), by);
    g.push(<line key="fbt" x1={tr0.x} y1={tr0.y} x2={tr1.x} y2={tr1.y} stroke={rise > 0 ? mixColor(C.line, AXIS, rise) : C.line} strokeWidth={bh} strokeLinecap="butt" />);
    const fillTo = f < SWEEP.a ? 0 : fakeOf(t);
    const fb1 = P(X0 + Math.max(FB.h, (X1 - X0) * fillTo), by);
    if (f >= CS2 + 16 && rise < 1) g.push(<line key="fbf" x1={tr0.x} y1={tr0.y} x2={fb1.x} y2={fb1.y} stroke={mixColor(C.cyan, AXIS, rise * rise)} strokeWidth={bh} strokeLinecap="butt" />);
    // real-time fill on the x axis, thinning into it
    const rf = P(X(t), Y1);
    if (t > 0 && rise < 1) g.push(<line key="rtf" x1={o.x} y1={o.y} x2={rf.x} y2={rf.y} stroke={C.gray} strokeWidth={lerp(6, 1.5, rise)} strokeOpacity={1 - rise} />);
    // ticks: equal time steps; far apart on the fictitious bar at first, bunched at the end. They fold away.
    const tickK = 1 - E.exit(prog(f, MORPH.a, 6));
    for (let i = 1; i < 12; i++) {
      const ti = i / 12;
      const on = clamp((t - ti) * 40);
      if (on <= 0 || tickK <= 0) continue;
      const pop = spring(f, SWEEP.a + ti * (SWEEP.b - SWEEP.a), 0.6, 0.5) * tickK;
      const a = P(X(ti), Y1 - 9 * pop);
      const b = P(X(ti), Y1 + 9 * pop);
      g.push(<line key={'rt' + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} strokeOpacity={0.55} strokeWidth={1.5} />);
      const fx = X(fakeOf(ti));
      const c1 = P(fx, by - (FB.h / 2 + 7) * pop);
      const c2 = P(fx, by + (FB.h / 2 + 7) * pop);
      g.push(<line key={'ft' + i} x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y} stroke={INK} strokeWidth={2} />);
    }
    // legend
    const lg = arrive(f, CS2 + 14, 0.2) * readOut;
    const L = P(X0 + 4, Y0 - 58);
    if (lg > 0.01)
      g.push(
        <g key="legend" opacity={lg} transform={`translate(${L.x} ${L.y + (1 - lg) * 10})`}>
          <line x1={0} y1={0} x2={34} y2={0} stroke={C.cyan} strokeWidth={5} strokeLinecap="round" />
          <text x={48} y={8} fontFamily={TEXT} fontWeight={600} fontSize={23} fill={INK}>
            barra fictícia
          </text>
          <line x1={250} y1={0} x2={284} y2={0} stroke={C.gray} strokeWidth={2.5} strokeDasharray="9 8" />
          <text x={298} y={8} fontFamily={TEXT} fontWeight={600} fontSize={23} fill={INK} fillOpacity={0.7}>
            tempo real
          </text>
        </g>,
      );
    els.push(<g key="diagram">{g}</g>);
  }

  // x axis over everything (the real-time line becomes the chart's time axis)
  els.push(<line key="ax" x1={o.x} y1={o.y} x2={xEnd.x} y2={xEnd.y} stroke={INK} strokeOpacity={0.55} strokeWidth={1.5} />);

  // ---- RETENTION CURVE ---------------------------------------------------------------------
  const tv = tau(f);
  if (f >= DRAW0 && tv > 0) {
    let d = '';
    let area = '';
    const pts: {x: number; y: number}[] = [];
    for (const tq of DENSE) {
      if (tq >= tv) break;
      pts.push(P(X(tq / TEND), Y(pAt(tq) / 100)));
    }
    const hd = P(H(tv).x, H(tv).y);
    pts.push(hd);
    pts.forEach((q, i) => {
      d += `${i === 0 ? 'M' : 'L'}${q.x.toFixed(1)},${q.y.toFixed(1)} `;
    });
    const base = P(0, Y1).y;
    area = `${d} L${hd.x.toFixed(1)},${base.toFixed(1)} L${pts[0].x.toFixed(1)},${base.toFixed(1)} Z`;
    els.push(<path key="area" d={area} fill={C.cyan} fillOpacity={0.16} />);
    els.push(<path key="curve" d={d} fill="none" stroke={C.cyan} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" />);
    if (f < DRAW_END + 4) els.push(<circle key="head" cx={hd.x} cy={hd.y} r={9} fill={C.cyan} stroke="#fff" strokeWidth={3} />);
  }
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      {/* opaque ground: every motion-blur sample is a complete opaque frame, so the average stays exact */}
      <rect width={1920} height={1080} fill={C.paper} />
      {els}
    </svg>
  );
};

// ---- HUD: value tag, knee stamp, KPIs, source ---------------------------------------------------
const Tag: React.FC<{f: number}> = ({f}) => {
  // the readout hands over to the knee stamp: it steps away as the stamp's circle draws
  if (f < DRAW0 + 2 || f > KNEE + 7) return null;
  const cam = camAt(f);
  const tv = tau(f);
  const h = H(tv);
  const s = toS(cam, h.x, h.y);
  const op = arrive(f, DRAW0 + 2, 0.25) * (1 - E.exit(prog(f, KNEE - 1, 5)));
  const txt = `${timeStr(Math.round(tv))} · ${Math.round(pAt(tv))}%`;
  return (
    <div
      style={{
        position: 'absolute',
        left: s.x + 22,
        top: s.y - 64,
        padding: '8px 14px',
        borderRadius: 8,
        background: INK,
        color: '#fff',
        fontFamily: TEXT,
        fontWeight: 600,
        fontSize: 24,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        opacity: op,
      }}
    >
      {txt}
    </div>
  );
};

// The knee stamp (ref-x): a dot marks the knee, a hairline leads out to one 236 px circle that draws, fills
// with Cyan and holds the number, and the caption finishes the sentence to its right. It stays through the
// hold, following the knee as the view widens, in the empty band between the KPI row and the curve's tail.
const STAMP_R = 118;
const STAMP_OFF = {x: 400, y: -76};
const KneeStamp: React.FC<{f: number}> = ({f}) => {
  if (f < KNEE) return null;
  const cam = camAt(f);
  const k = toS(cam, X(KNEE_T / TEND), Y(KNEE_P / 100));
  const c = {x: k.x + STAMP_OFF.x, y: k.y + STAMP_OFF.y};
  const dir = {x: STAMP_OFF.x / Math.hypot(STAMP_OFF.x, STAMP_OFF.y), y: STAMP_OFF.y / Math.hypot(STAMP_OFF.x, STAMP_OFF.y)};
  const l0 = {x: k.x + dir.x * 14, y: k.y + dir.y * 14};
  const l1 = {x: c.x - dir.x * (STAMP_R + 6), y: c.y - dir.y * (STAMP_R + 6)};
  const ln = E.prod(prog(f, KNEE, 6));
  const dotS = spring(f, KNEE, 0.6, 0.5);
  const ring = E.prod(prog(f, KNEE + 2, 10));
  const fill = E.expr(prog(f, KNEE + 10, 5));
  const num = spring(f, KNEE + 12, 0.42, 0.55);
  const cap = arrive(f, KNEE + 16, 0.2);
  const circ = 2 * Math.PI * STAMP_R;
  // the stroke starts where the leader meets the circle
  const startDeg = (Math.atan2(-dir.y, -dir.x) * 180) / Math.PI;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <circle cx={k.x} cy={k.y} r={7 * dotS} fill={INK} />
        {ln > 0 && <line x1={l0.x} y1={l0.y} x2={lerp(l0.x, l1.x, ln)} y2={lerp(l0.y, l1.y, ln)} stroke={INK} strokeWidth={1.8} />}
        {fill > 0 && <circle cx={c.x} cy={c.y} r={STAMP_R} fill={C.cyan} fillOpacity={fill} />}
        {ring > 0 && (
          <circle cx={c.x} cy={c.y} r={STAMP_R} fill="none" stroke={fill > 0 ? mixColor(INK, C.cyan, fill) : INK} strokeWidth={2.5} strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - ring)} transform={`rotate(${startDeg} ${c.x} ${c.y})`} />
        )}
      </svg>
      {num > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: c.x - STAMP_R,
            top: c.y - 44,
            width: 2 * STAMP_R,
            textAlign: 'center',
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontStretch: '64%',
            fontSize: 84,
            lineHeight: 1.04,
            letterSpacing: '-0.01em',
            color: INK,
            fontVariantNumeric: 'tabular-nums',
            transform: `scale(${num})`,
          }}
        >
          −42%
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: c.x + STAMP_R + 26,
          top: c.y - 20,
          fontFamily: TEXT,
          fontWeight: 600,
          fontSize: 30,
          lineHeight: '40px',
          color: INK,
          whiteSpace: 'nowrap',
          opacity: cap,
          transform: `translateX(${(1 - cap) * -14}px)`,
        }}
      >
        nos primeiros 6 s
      </div>
    </div>
  );
};

const KPIS = [
  {v: '14K', l: 'Visitas'},
  {v: '3,5K', l: 'Cliques'},
  {v: '8,6K', l: 'Visitas únicas'},
  {v: '24,54%', l: 'Play rate'},
];
const Kpis: React.FC<{f: number}> = ({f}) => {
  const s0 = KPI0;
  if (f < s0) return null;
  return (
    <div style={{position: 'absolute', left: X0, top: 150, display: 'flex', gap: 64}}>
      {KPIS.map((k, i) => {
        const a = arrive(f, s0 + i * 3, 0.2);
        return (
          <div key={i} style={{opacity: clamp(a * 1.6), transform: `translateY(${(1 - a) * 22}px)`}}>
            <div style={{fontFamily: TEXT, fontWeight: 700, fontSize: 46, letterSpacing: '-0.02em', color: INK, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1}}>{k.v}</div>
            <div style={{fontFamily: TEXT, fontWeight: 500, fontSize: 23, color: INK, opacity: 0.55, marginTop: 4}}>{k.l}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Chapter2: React.FC<{f: number}> = ({f}) => {
  // the word starts 4 frames before the card so the Cyan field is never empty; the ribbon of chapter 1 still
  // owns the background until the card
  if (f < T.cardB - 5 || f > T.cardC + 1) return null;
  const camMoving = (f >= CH && f < CH + ZOOM_IN + 2) || (f >= DRAW1 && f < DRAW_END + 2);
  const n = camMoving ? nSamples(camDisp(f), 4, 32) : 1;
  return (
    <AbsoluteFill>
      {f >= T.cardB && (f < CS2 + 2 ? <AbsoluteFill style={{background: C.cyan}} /> : <AbsoluteFill style={{background: C.paper}} />)}
      {f >= CS2 && (
        <AbsoluteFill style={{transform: `translate(960px, 540px) scale(${stagePush(f)}) translate(-960px, -540px)`, transformOrigin: '0 0'}}>
          <Samples f={f} n={n} shutter={CAM_SHUTTER} render={(ff) => <ChartLayer f={f} cam={camAt(ff)} />} />
          <FeatureText f={f} tag="Retenção" tagColor={C.cyan} items={[{at: 544, until: 584, lines: ['BARRA', 'FICTÍCIA'], support: 'O vídeo parece mais curto.'}]} />
          <FeatureText f={f} tag="Retenção" tagColor={C.cyan} items={[{at: CH, until: 716, lines: ['GRÁFICO DE', 'RETENÇÃO'], support: 'Veja onde o público perde o interesse.'}]} />
          <Tag f={f} />
          <KneeStamp f={f} />
          <Kpis f={f} />
          {f >= DRAW0 && (
            <div
              style={{
                position: 'absolute',
                right: 1920 - X1,
                top: 1000,
                fontFamily: TEXT,
                fontWeight: 500,
                fontSize: 23,
                color: INK,
                opacity: 0.45 * arrive(f, DRAW0, 0.2),
              }}
            >
              Dados de demonstração do painel VSLPLAY
            </div>
          )}
        </AbsoluteFill>
      )}
      <Collapse f={f} />
      <ChapterWord f={f} word="RETENÇÃO" start={T.cardB - 4} exitAt={T.barra} color={C.ink} dotAt={T.cardB + 14} />
      <RibbonField f={f} kind="purple" start={T.wipeC - 2} growAt={T.wipeC + 3} full={T.wipeC + 11} until={T.cardC + 1} />
    </AbsoluteFill>
  );
};
