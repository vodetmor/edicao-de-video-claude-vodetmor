// Aula da Saudade V3: um álbum de verdade folheado em 3D sobre uma mesa de nogueira.
// Capa de tecido xadrez com etiqueta (clone da referência do Vítor), páginas que viram em curva, cada época com o seu papel
// (preta com cantoneiras, kraft com fita washi, marfim com polaroid), câmera que passeia e "entra" nos vídeos, letra fixa embaixo.
// Plano: pessoal-vitor/meu-terceirao/trabalho/scripts/montar_saudade3.py -> plano3.json
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {clamp, hash} from '../../kit';
import plano from './plano3.json';
import {carregaFontes, PalavraColagem} from './Saudade';
import {carregaImgs, recorte} from './Album3D';

const FPS = 30;
export const DUR_SAUDADE3 = Math.round(plano.duracao * FPS);
const W = plano.W;
const H = plano.H;
const TURN = plano.TURN;
const BT = 0.04; // altura do miolo (dos dois lados)
const CT = 0.05; // espessura da capa
const FOV = 32;
const ASP = 16 / 9;
const E = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const S = (x: number) => x * x * (3 - 2 * x);
const PX = 1000; // pixels de textura por unidade

type Item = {k: string; id: string; x: number; z: number; w: number; h: number; rot: number; ini?: number; vdur?: number};
type Spread = {a: number; b: number; era: string; L: Item[]; R: Item[]; titulo: string | null};
const SPREADS = plano.spreads as Spread[];

// ---------------------------------------------------------------- carregamento de imagens
const img: Record<string, HTMLImageElement> = {};
let pronto: Promise<void> | null = null;
const fonteDe = (it: Item) => (it.k === 'video' ? staticFile(`saudade/v3/posters/${it.id}.jpg`) : staticFile(`final/p/${it.id}.jpg`));
const carrega = () => {
  if (pronto) return pronto;
  const lista: [string, string][] = [];
  for (const s of SPREADS) for (const it of [...s.L, ...s.R]) lista.push([it.id, fonteDe(it)]);
  for (const n of ['kraft', 'preta', 'marfim']) lista.push([n, staticFile(`saudade/v3/${n}.jpg`)]);
  pronto = Promise.all([
    carregaImgs(),
    carregaPbr(),
    new Promise<void>((res) => { const t0 = Date.now(); const ve = () => (document.fonts.check('40px S_CormI') && document.fonts.check('40px S_Abril') && document.fonts.check('40px S_Corm')) || Date.now() - t0 > 8000 ? res() : setTimeout(ve, 50); ve(); }),
    ...lista.map(([n, src]) => new Promise<void>((res) => { const im = new Image(); im.onload = () => { img[n] = im; res(); }; im.onerror = () => res(); im.src = src; })),
  ]).then(() => undefined);
  return pronto;
};

// ---------------------------------------------------------------- páginas (canvas 2D -> textura)
const cobre = (ctx: CanvasRenderingContext2D, im: HTMLImageElement | undefined, x: number, y: number, w: number, h: number) => {
  if (!im) return;
  const k = Math.max(w / im.width, h / im.height);
  ctx.drawImage(im, x + (w - im.width * k) / 2, y + (h - im.height * k) / 2, im.width * k, im.height * k);
};

// quanto de preto e branco por época (a cor volta aos poucos)
const grausDe = (s: Spread, lado: string) => {
  if (s.era === 'final') return lado === 'L' ? 0.9 : 0;
  if (s.era === 'antes' || s.era === 'vazio') return 0.9;
  if (s.era === 'cor') return 0.6;
  if (s.era === 'cresceu') return clamp((150 - (s.a + s.b) / 2) / 90) * 0.55;
  return 0;
};
const papelDe = (s: Spread, lado: string) => {
  if (s.era === 'final') return lado === 'L' ? 'preta' : 'marfim';
  if (s.era === 'antes' || s.era === 'vazio') return 'preta';
  if (s.era === 'hoje') return 'marfim';
  return 'kraft';
};
const WASHI = ['#8f9c7e', '#c99590', '#cfa94e', '#4a5a74', '#b9805c', '#9a8bb0'];

const cantoneira = (ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, t: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ece4d2';
  ctx.beginPath();
  ctx.moveTo(-t * 0.18, -t * 0.18);
  ctx.lineTo(t, -t * 0.18);
  ctx.lineTo(-t * 0.18, t);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const fita = (ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, cor: string, w = 190, h = 52) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalAlpha = 0.86;
  ctx.fillStyle = cor;
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  const zig = (yy: number, dir: number) => { for (let i = 0; i <= 6; i++) ctx.lineTo(-w / 2 + (dir > 0 ? 0 : w) + dir * 0 + (i % 2 ? 4 : -2) * dir, yy - h / 2 + (h * i) / 6); };
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  for (let i = 0; i <= 6; i++) ctx.lineTo(w / 2 + (i % 2 ? -5 : 2), -h / 2 + (h * i) / 6);
  ctx.lineTo(-w / 2, h / 2);
  for (let i = 6; i >= 0; i--) ctx.lineTo(-w / 2 + (i % 2 ? 5 : -2), -h / 2 + (h * i) / 6);
  void zig;
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#fff';
  for (let i = -w / 2; i < w / 2; i += 9) ctx.fillRect(i, -h / 2, 3, h);
  ctx.restore();
};

const desenhaItem = (ctx: CanvasRenderingContext2D, it: Item, x0: number, s: Spread, lado: string, si: number) => {
  const papel = papelDe(s, lado);
  const gr = grausDe(s, lado);
  const cx = (it.x - x0) * PX;
  const cy = (it.z + H / 2) * PX;
  const w = it.w * PX;
  const h = it.h * PX;
  const polaroid = papel === 'marfim';
  const b = polaroid ? 34 : 22; // borda branca
  const bb = polaroid ? 110 : b;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((it.rot * Math.PI) / 180);
  // papel da foto + sombra
  ctx.shadowColor = papel === 'preta' ? 'rgba(0,0,0,0.7)' : 'rgba(40,24,10,0.42)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = papel === 'preta' ? '#e9e1cf' : '#f6f1e6';
  ctx.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + b + bb);
  ctx.shadowColor = 'transparent';
  // a foto
  ctx.save();
  ctx.beginPath();
  ctx.rect(-w / 2, -h / 2, w, h);
  ctx.clip();
  ctx.filter = `grayscale(${gr}) sepia(${gr * 0.35}) contrast(${1 + gr * 0.06}) brightness(${1 - gr * 0.04})`;
  cobre(ctx, img[it.id], -w / 2, -h / 2, w, h);
  ctx.filter = 'none';
  // brilho fraco de papel fotográfico
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, 'rgba(255,250,235,0.10)');
  g.addColorStop(0.5, 'rgba(255,250,235,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.08)');
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
  // decoração por época
  const sd = si * 17 + Math.round(it.x * 100);
  if (papel === 'preta') {
    const t = Math.min(w, h) * 0.11 + 30;
    const X = w / 2 + b;
    const Y = h / 2 + b;
    cantoneira(ctx, -X, -Y, 0, t);
    cantoneira(ctx, X, -Y, Math.PI / 2, t);
    cantoneira(ctx, X, Y, Math.PI, t);
    cantoneira(ctx, -X, Y, -Math.PI / 2, t);
  } else if (papel === 'kraft') {
    const c1 = WASHI[Math.floor(hash(sd, 1) * WASHI.length)];
    const c2 = WASHI[Math.floor(hash(sd, 2) * WASHI.length)];
    fita(ctx, -w / 2 + 10, -h / 2 + 6, -0.72, c1);
    fita(ctx, w / 2 - 10, h / 2 - 6, -0.72, c2);
  } else {
    fita(ctx, (hash(sd, 3) - 0.5) * w * 0.3, -h / 2 - b + 2, (hash(sd, 4) - 0.5) * 0.18, '#d8c29a', 210, 58);
  }
  ctx.restore();
};

const desenhaPagina = (cv: HTMLCanvasElement, s: Spread, lado: 'L' | 'R', si: number) => {
  const ctx = cv.getContext('2d')!;
  const papel = papelDe(s, lado);
  ctx.fillStyle = papel === 'preta' ? '#1e1a18' : papel === 'kraft' ? '#a77b4f' : '#ece4d4';
  ctx.fillRect(0, 0, cv.width, cv.height);
  const tp = img[papel];
  if (tp) { if (papel === 'kraft') ctx.globalAlpha = 0.55; const k = 0.62; const tw = tp.width * k; const th = tp.height * k; for (let yy = 0; yy < cv.height; yy += th) for (let xx = 0; xx < cv.width; xx += tw) ctx.drawImage(tp, xx, yy, tw, th); ctx.globalAlpha = 1; }
  // sombra da dobra perto da lombada e borda gasta
  const naLombada = lado === 'R' ? 0 : cv.width;
  const g = ctx.createLinearGradient(naLombada, 0, lado === 'R' ? 220 : cv.width - 220, 0);
  g.addColorStop(0, papel === 'preta' ? 'rgba(0,0,0,0.55)' : 'rgba(60,35,15,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cv.width, cv.height);
  const x0 = lado === 'R' ? 0 : -W;
  const itens = lado === 'R' ? s.R : s.L;
  // título da época colado (recortes)
  if (lado === 'L' && s.titulo) {
    const so = itens.length === 0; // página só com o título (abertura do álbum): maior e no meio
    const tam = so ? 118 : s.titulo.length > 12 ? 74 : 96;
    const cs = s.titulo.split('');
    const adv = (c: string) => (c === ' ' ? tam * 0.55 : tam * 0.9);
    const tot = cs.reduce((a, c) => a + adv(c), 0);
    let x = cv.width / 2 - tot / 2;
    cs.forEach((c, i) => {
      if (c !== ' ') recorte(ctx, c, si * 53 + i, tam, 99, x + tam * 0.45, so ? cv.height * 0.47 : 210);
      x += adv(c);
    });
  }
  itens.forEach((it) => desenhaItem(ctx, it, x0, s, lado, si));
};

const cache = new Map<string, THREE.CanvasTexture>();
const texPagina = (si: number, lado: 'L' | 'R') => {
  const k = `${si}${lado}`;
  let t = cache.get(k);
  if (t) return t;
  const cv = document.createElement('canvas');
  cv.width = Math.round(W * PX);
  cv.height = Math.round(H * PX);
  desenhaPagina(cv, SPREADS[si], lado, si);
  t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(k, t);
  if (cache.size > 10) {
    const velho = cache.keys().next().value as string;
    cache.get(velho)?.dispose();
    cache.delete(velho);
  }
  return t;
};

// ---------------------------------------------------------------- capa (tecido xadrez + etiqueta com filete cobre)
const desenhaCapa = (cv: HTMLCanvasElement, f: number, fecho: boolean) => {
  const ctx = cv.getContext('2d')!;
  const w = cv.width;
  const h = cv.height;
  ctx.fillStyle = '#8a705d';
  ctx.fillRect(0, 0, w, h);
  // xadrez: listras na trama e na urdidura, com transparência (o cruzamento escurece, como tecido)
  const sett: [number, number, string, number][] = [
    [0, 70, '#3f2c21', 0.5], [96, 8, '#e2d3bb', 0.55], [128, 34, '#5b4234', 0.35], [186, 5, '#e2d3bb', 0.5], [214, 14, '#3f2c21', 0.45], [250, 46, '#a68c76', 0.35],
  ];
  const P = 300;
  for (const dir of [0, 1]) {
    for (let o = -P; o < Math.max(w, h) + P; o += P) {
      for (const [off, lw, cor, al] of sett) {
        ctx.globalAlpha = al;
        ctx.fillStyle = cor;
        if (dir === 0) ctx.fillRect(o + off, 0, lw, h);
        else ctx.fillRect(0, o + off, w, lw);
      }
    }
  }
  // sarja (diagonal fina do tecido)
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  for (let i = -h; i < w; i += 5) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // etiqueta
  const lw = w * 0.58;
  const lh = h * 0.52;
  const lx = (w - lw) / 2;
  const ly = h * 0.27;
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#583d31';
  ctx.fillRect(lx, ly, lw, lh);
  ctx.shadowColor = 'transparent';
  ctx.globalAlpha = 0.25;
  cobre(ctx, img.kraft, lx, ly, lw, lh);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(70,45,35,0.7)';
  ctx.fillRect(lx, ly, lw, lh);
  const cobreG = ctx.createLinearGradient(lx, ly, lx + lw, ly + lh);
  cobreG.addColorStop(0, '#e2b393');
  cobreG.addColorStop(0.45, '#b98266');
  cobreG.addColorStop(0.7, '#f0c9aa');
  cobreG.addColorStop(1, '#a87158');
  ctx.strokeStyle = cobreG;
  ctx.lineWidth = 3;
  ctx.strokeRect(lx + 26, ly + 26, lw - 52, lh - 52);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(lx + 38, ly + 38, lw - 76, lh - 76);
  ctx.fillStyle = cobreG;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cx = w / 2;
  ctx.font = '500 34px S_Corm';
  (ctx as any).letterSpacing = '9px';
  ctx.fillText('LA SALLE SOBRADINHO', cx, ly + lh * 0.2);
  (ctx as any).letterSpacing = '4px';
  ctx.font = 'italic 500 150px S_CormI';
  ctx.fillText('Aula da', cx, ly + lh * 0.42);
  ctx.font = '600 170px S_Corm';
  (ctx as any).letterSpacing = '10px';
  ctx.fillText('SAUDADE', cx, ly + lh * 0.62);
  ctx.font = '500 32px S_Corm';
  (ctx as any).letterSpacing = '9px';
  ctx.fillText('232 · 2026', cx, ly + lh * 0.82);
  (ctx as any).letterSpacing = '0px';
  // no fecho: "231 e 232" em recortes colados por cima, letra por letra
  if (fecho) {
    const txt = '232';
    const tam = 120;
    const ini = Math.round(plano.capa.fecha[1] * FPS) - 10;
    let x = cx - (txt.length * tam * 0.86) / 2;
    txt.split('').forEach((c, i) => {
      if (c !== ' ') recorte(ctx, c, 400 + i, tam, f - (ini + i * 4), x + tam * 0.43, ly + lh + 150);
      x += c === ' ' ? tam * 0.5 : tam * 0.9;
    });
  }
};

// ---------------------------------------------------------------- geometria de página (curva na lombada e ao virar)
const NS = 44;
const yR = (d: number) => BT - (BT - 0.012) * Math.exp(-d / 0.13);
const yL = yR;
const formaPagina = (u: number, pos: Float32Array) => {
  // u: 0 = deitada à direita, 1 = deitada à esquerda
  const th = Math.PI * u;
  const lag = 0.95 * Math.sin(th);
  let x = 0;
  let y = 0.012;
  const lift = 0.004 + 0.02 * Math.sin(th);
  for (let i = 0; i <= NS; i++) {
    const s = (W * i) / NS;
    if (i > 0) {
      const ph = th - lag * Math.pow(s / W, 1.3);
      const ds = W / NS;
      x += Math.cos(ph) * ds;
      y += Math.sin(ph) * ds;
    }
    const yy = y + Math.pow(1 - u, 3) * (yR(s) - 0.012) + Math.pow(u, 3) * (yL(s) - 0.012) + lift;
    for (let j = 0; j <= 1; j++) {
      const k = (i * 2 + j) * 3;
      pos[k] = x;
      pos[k + 1] = yy;
      pos[k + 2] = j ? H / 2 : -H / 2;
    }
  }
};
const geoPagina = (verso: boolean) => {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array((NS + 1) * 2 * 3);
  const uv = new Float32Array((NS + 1) * 2 * 2);
  const idx: number[] = [];
  for (let i = 0; i <= NS; i++) {
    for (let j = 0; j <= 1; j++) {
      const k = (i * 2 + j) * 2;
      uv[k] = verso ? 1 - i / NS : i / NS;
      uv[k + 1] = j ? 0 : 1;
    }
    if (i < NS) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
};

const Pagina: React.FC<{u: number; tex: THREE.Texture; verso?: boolean; side: THREE.Side; sombra?: boolean}> = ({u, tex, verso = false, side, sombra = false}) => {
  const g = useMemo(() => geoPagina(verso), [verso]);
  formaPagina(u, g.attributes.position.array as Float32Array);
  g.attributes.position.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return (
    <mesh geometry={g} castShadow={sombra} receiveShadow>
      <meshStandardMaterial map={tex} side={side} roughness={0.92} />
    </mesh>
  );
};

// ---------------------------------------------------------------- câmera
type Pose = {x: number; z: number; alt: number; tilt: number};
const ABRE = plano.capa.abre;
const FECHA = plano.capa.fecha;
const GERAL: Pose = {x: 0, z: 0.08, alt: 2.7, tilt: 13};
const CAPA: Pose = {x: W / 2 + 0.03, z: 0.02, alt: 2.7, tilt: 0};
const focoPose = (it: Item, zoom: number, video: boolean): Pose => {
  const alt = video ? Math.max(it.h, it.w / ASP) : Math.max(it.h, it.w / ASP) * zoom * 1.08;
  const a2 = Math.max(alt, 0.5);
  return {x: it.x, z: video ? it.z : it.z + 0.11 * a2, alt: a2, tilt: video ? 0 : 4};
};
type Seg = {a: number; p: Pose; dur: number};
const SEGS: Seg[] = (() => {
  const segs: Seg[] = [{a: 0, p: CAPA, dur: 0.01}, {a: ABRE[0] + 1.2, p: GERAL, dur: 4.6}];
  const focos = plano.focos as {a: number; b: number; s: number; i?: number; g?: {x: number; z: number; w: number; h: number}; zoom: number}[];
  focos.forEach((fo, k) => {
    const s = SPREADS[fo.s];
    const it: Item = fo.g ? {k: 'grupo', id: '', rot: 0, ...fo.g} : [...s.L, ...s.R][fo.i as number];
    const pf = focoPose(it, fo.zoom, it.k === 'video');
    if (fo.g && fo.b - fo.a > 2.2) {
      // V8: chega em 1,5 s e segue deslizando devagar pela metade da página (a câmera não tranca)
      segs.push({a: fo.a, p: {...pf, x: pf.x - 0.035 * fo.g.w, alt: pf.alt * 1.03}, dur: 1.5});
      segs.push({a: fo.a + 1.2, p: {...pf, x: pf.x + 0.035 * fo.g.w, alt: pf.alt * 0.95}, dur: fo.b - fo.a - 0.9});
    } else segs.push({a: fo.a, p: pf, dur: 1.3});
    const prox = focos[k + 1];
    if (!prox || prox.s !== fo.s || prox.a - fo.b > 0.5) segs.push({a: fo.b, p: GERAL, dur: 1.1});
  });
  segs.push({a: FECHA[0] - 0.6, p: GERAL, dur: 1.0});
  segs.push({a: FECHA[0] + 1.6, p: CAPA, dur: 5.2});
  return segs.sort((x, y) => x.a - y.a);
})();
const mixP = (a: Pose, b: Pose, k: number): Pose => ({x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, alt: a.alt + (b.alt - a.alt) * k, tilt: a.tilt + (b.tilt - a.tilt) * k});
const poseEm = (t: number): Pose => {
  let p = SEGS[0].p;
  for (const s of SEGS) {
    if (t < s.a) break;
    const k = E(clamp((t - s.a) / s.dur));
    p = mixP(p, s.p, k);
  }
  return p;
};

const CameraRig: React.FC<{t: number}> = ({t}) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  const p = poseEm(t);
  // respiração lenta: a câmera nunca para de todo
  const resp = 1 - 0.018 * Math.sin(t * 0.21);
  const altura = p.alt * resp;
  const d = altura / 2 / Math.tan((FOV * Math.PI) / 360);
  const top = BT;
  const tr = (p.tilt * Math.PI) / 180;
  camera.fov = FOV;
  camera.near = 0.05;
  camera.far = 80;
  camera.position.set(p.x + Math.sin(t * 0.13) * 0.01 * p.alt, top + d * Math.cos(tr), p.z + d * Math.sin(tr));
  camera.up.set(0, 0, -1);
  camera.lookAt(p.x, top, p.z);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return null;
};

// ---------------------------------------------------------------- cena
const PBR: Record<string, THREE.Texture> = {};
const carregaPbr = () => {
  const l = new THREE.TextureLoader();
  const ps: Promise<void>[] = [];
  for (const nome of ['american_walnut_veneer', 'rough_linen']) for (const k of ['diff', 'nor', 'rough']) ps.push(l.loadAsync(staticFile(`saudade/pbr/${nome}_${k}.jpg`)).then((tx) => { PBR[`${nome}_${k}`] = tx; }));
  return Promise.all(ps);
};
const pbr = (nome: string, rep: number) => {
  const ts = ['diff', 'nor', 'rough'].map((k) => {
    const tx = PBR[`${nome}_${k}`].clone();
    tx.needsUpdate = true;
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(rep, rep);
    tx.anisotropy = 8;
    if (k === 'diff') tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  });
  return {map: ts[0], normalMap: ts[1], roughnessMap: ts[2]};
};

const Cena: React.FC<{t: number; f: number}> = ({t, f}) => {
  const mesa = useMemo(() => pbr('american_walnut_veneer', 2.2), []);
  const linho = useMemo(() => pbr('rough_linen', 5), []);
  const fecho = t > FECHA[0] - 1;
  const capaCv = useMemo(() => { const c = document.createElement('canvas'); c.width = 1660; c.height = 2100; return c; }, []);
  const capaTex = useMemo(() => { const tx = new THREE.CanvasTexture(capaCv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx; }, [capaCv]);
  desenhaCapa(capaCv, f, fecho);
  capaTex.needsUpdate = true;

  // qual página dupla e se está virando
  let si = 0;
  for (let i = 0; i < SPREADS.length; i++) if (t >= SPREADS[i].a) si = i;
  const virando = si > 0 && t < SPREADS[si].a + TURN;
  const u = virando ? E(clamp((t - SPREADS[si].a) / TURN)) : 0;
  const esq = virando ? si - 1 : si; // página esquerda que está embaixo
  const texL = texPagina(esq, 'L');
  const texR = texPagina(si, 'R');
  const texVf = virando ? texPagina(si - 1, 'R') : null;
  const texVv = virando ? texPagina(si, 'L') : null;

  // capa: abre no começo, fecha no fim
  let ang = Math.PI;
  if (t < ABRE[1]) ang = Math.PI * E(clamp((t - ABRE[0]) / (ABRE[1] - ABRE[0])));
  else if (t > FECHA[0]) ang = Math.PI * (1 - E(clamp((t - FECHA[0]) / (FECHA[1] - FECHA[0]))));
  const aberta = ang > Math.PI - 0.002;
  // o miolo da esquerda 'assenta' logo que a capa deita (e some antes de ela levantar no fecho)
  const sobe = Math.max(0.02, Math.min(S(clamp((t - ABRE[1]) / 0.5)), 1 - S(clamp((t - (FECHA[0] - 0.5)) / 0.5))));
  const sc = S(clamp((ang / Math.PI - 0.3) / 0.7));
  const pivotY = BT * (1 - sc) + 0.0 * sc;
  const capaDentro = useMemo(() => { const tx = texL.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.x = -1; tx.offset.x = 1; tx.needsUpdate = true; return tx; }, [texL]);

  // luz: no "vazio" a sala escurece e sobra uma luz de abajur
  const alvo = useMemo(() => { const o = new THREE.Object3D(); o.position.set(0.5, 0, 0.3); return o; }, []);
  const sombraTex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d')!;
    const g = x.createRadialGradient(256, 256, 60, 256, 256, 256); g.addColorStop(0, 'rgba(0,0,0,0.85)'); g.addColorStop(0.55, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512); const tx = new THREE.CanvasTexture(c); return tx;
  }, []);
  const vazio = clamp((t - 185.5) / 1.5) * (1 - clamp((t - 200.5) / 1.5));
  const tom = '#5a4030';
  return (
    <>
      <CameraRig t={t} />
      <hemisphereLight args={['#ffe9cc', '#2a1a10', 0.62 - 0.4 * vazio]} />
      <primitive object={alvo} />
      <spotLight position={[-2.4, 5.6, -2.2]} target={alvo} angle={0.62} penumbra={1} decay={0} intensity={4.0 - 2.6 * vazio} color="#ffd6a0" castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.0012} shadow-normalBias={0.03} shadow-radius={9} shadow-blurSamples={20} shadow-camera-near={2} shadow-camera-far={14} />
      <directionalLight visible={false} position={[-3.2, 6.2, -2.0]} intensity={2.2 - 1.4 * vazio} color="#ffd9a8" castShadow shadow-mapSize={[4096, 4096]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-camera-near={1} shadow-camera-far={16} shadow-bias={-0.0003} shadow-normalBias={0.01} shadow-radius={6} />
      <pointLight position={[1.1, 1.6, -0.4]} intensity={6 * vazio} distance={4} decay={2} color="#ffbe78" />
      {/* mesa de nogueira */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -CT - 0.001, 0]} receiveShadow>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial {...mesa} roughness={0.75} color="#c9b29a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[aberta || ang > 1.2 ? 0.04 : W / 2 + 0.06, -CT + 0.0005, 0.06]}>
        <planeGeometry args={[aberta || ang > 1.2 ? 2 * W + 0.9 : W + 0.7, H + 0.7]} />
        <meshBasicMaterial map={sombraTex} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* capa de trás + miolo da direita */}
      <mesh position={[W / 2 + 0.01, -CT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.1, CT, H + 0.12]} />
        <meshStandardMaterial color={tom} {...linho} roughness={0.9} />
      </mesh>
      <mesh position={[W / 2 + 0.17, BT / 2 - 0.004, 0]} receiveShadow>
        <boxGeometry args={[W - 0.34, BT - 0.008, H - 0.004]} />
        <meshStandardMaterial color="#e6dbc5" roughness={0.95} />
      </mesh>
      <mesh position={[0, -CT / 2 + 0.005, 0]} receiveShadow>
        <boxGeometry args={[0.09, CT + 0.01, H + 0.12]} />
        <meshStandardMaterial color="#3e2a20" {...linho} roughness={0.9} />
      </mesh>
      {/* páginas */}
      <Pagina u={0} tex={texR} side={THREE.DoubleSide} />
      {aberta ? (
        <group scale={[1, sobe, 1]}>
          <mesh position={[-W / 2 - 0.17, BT / 2 - 0.004, 0]} receiveShadow>
            <boxGeometry args={[W - 0.34, BT - 0.008, H - 0.004]} />
            <meshStandardMaterial color="#e6dbc5" roughness={0.95} />
          </mesh>
          <Pagina u={1} tex={texL} verso side={THREE.DoubleSide} />
        </group>
      ) : null}
      {virando && texVf && texVv ? (
        <>
          <Pagina u={u} tex={texVf} side={THREE.FrontSide} sombra />
          <Pagina u={u} tex={texVv} verso side={THREE.BackSide} sombra />
        </>
      ) : null}
      {/* capa da frente: gira na lombada */}
      <group position={[0, pivotY, 0]} rotation={[0, 0, ang]}>
        <mesh position={[(W + 0.06) / 2, CT / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.06, CT, H + 0.12]} />
          <meshStandardMaterial color={tom} {...linho} roughness={0.9} />
        </mesh>
        <mesh position={[(W + 0.06) / 2, CT + 0.0012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[W + 0.06, H + 0.12]} />
          <meshStandardMaterial map={capaTex} normalMap={linho.normalMap} roughness={0.88} />
        </mesh>
        <mesh position={[W / 2, -0.0012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial map={capaDentro} side={THREE.DoubleSide} roughness={0.92} />
        </mesh>
      </group>
    </>
  );
};

// ---------------------------------------------------------------- 2D por cima: vídeo em tela cheia, letra, destaque
// a música pausa nos vídeos longos: tempo da música em função do tempo do vídeo
const HOLDS = plano.holds as {t: number; d: number}[];
const musicaEm = (tv: number) => tv - HOLDS.reduce((a, h) => a + Math.min(Math.max(tv - h.t, 0), h.d), 0);
const noHold = (tv: number) => HOLDS.some((h) => tv > h.t - 0.05 && tv < h.t + h.d + 0.05);

const Letra: React.FC<{t: number}> = ({t: tv}) => {
  if (noHold(tv)) return null;
  const t = musicaEm(tv);
  const l = (plano.letras as {a: number; b: number; t: string[]; ts: number[]}[]).find((x) => t >= x.a - 0.2 && t <= x.b + 0.5);
  if (!l) return null;
  const sai = clamp((t - l.b) / 0.5);
  // quebra em 2 linhas equilibradas, de preferência antes de palavra com maiúscula
  const txt = l.t;
  let corte = -1;
  const tot = txt.join(' ').length;
  if (tot > 34) {
    let melhor = 1e9;
    let acc = 0;
    for (let i = 0; i < txt.length - 1; i++) {
      acc += txt[i].length + 1;
      const custo = Math.abs(acc - tot / 2) - (/^[A-ZÀ-Ú]/.test(txt[i + 1]) ? 14 : 0);
      if (custo < melhor) { melhor = custo; corte = i; }
    }
  }
  const palavra = (w: string, k: number) => {
    // o verso todo aparece junto (layout estável); cada palavra acende quando é cantada
    const e = clamp((t - l.ts[k] + 0.05) / 0.3);
    return <span key={k} style={{display: 'inline-block', marginRight: '0.26em', opacity: 0.42 + 0.58 * e}}>{w}</span>;
  };
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 74, textAlign: 'center', fontFamily: 'S_CormI', fontWeight: 600, fontSize: 60, lineHeight: 1.12, color: '#f6ecda', textShadow: '0 2px 14px rgba(20,10,4,0.85), 0 0 3px rgba(20,10,4,0.6)', opacity: clamp((t - l.a + 0.2) / 0.4) * (1 - sai), transform: `translateY(${(1 - clamp((t - l.a + 0.2) / 0.4)) * 10}px)`}}>
      <div>{txt.map((w, k) => (corte < 0 || k <= corte ? palavra(w, k) : null))}</div>
      {corte >= 0 ? <div>{txt.map((w, k) => (k > corte ? palavra(w, k) : null))}</div> : null}
    </div>
  );
};

type Mv = {id: string; o: string; ini: number; rate: number};
const Imersao: React.FC<{t: number}> = ({t}) => (
  <>
    {(plano.imersoes as {a: number; b: number; vs: Mv[]}[]).map((m, i) => {
      if (t < m.a - 0.1 || t > m.b + 0.1) return null;
      const op = clamp((t - m.a) / 0.4) * (1 - clamp((t - (m.b - 0.4)) / 0.4));
      const so = m.vs.length === 1 && m.vs[0].o === 'h'; // horizontal sozinho: tela cheia; em pé: painéis lado a lado
      const lar = so ? 1920 : m.vs.length === 3 ? (1920 - 16) / 3 : 640;
      return (
        <Sequence key={i} from={Math.round(m.a * FPS)} durationInFrames={Math.round((m.b - m.a) * FPS) + 3} layout="none">
          <AbsoluteFill style={{opacity: op, background: so ? undefined : 'rgba(14,9,5,0.93)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8}}>
            {m.vs.map((v) => (
              <div key={v.id} style={{width: lar, height: 1080, overflow: 'hidden', flex: 'none'}}>
                <OffthreadVideo src={staticFile(`final/v/${v.id}.mp4`)} muted startFrom={Math.round(v.ini * FPS)} playbackRate={v.rate} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.12) saturate(0.92) contrast(1.03)'}} />
              </div>
            ))}
          </AbsoluteFill>
        </Sequence>
      );
    })}
  </>
);

export const Saudade3: React.FC = () => {
  carregaFontes();
  const f = useCurrentFrame();
  const t = f / FPS;
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender('saudade3: imagens'));
  useEffect(() => {
    carrega().then(() => { setOk(true); continueRender(h); });
  }, [h]);
  const preto = t < 0.8 ? 1 - clamp(t / 0.8) : clamp((t - (plano.duracao - 1.8)) / 1.6);
  const dest = (plano.destaques as {a: number; b: number; t: string}[])[0];
  return (
    <AbsoluteFill style={{background: '#1a120c'}}>
      {ok ? (
        <ThreeCanvas width={1920} height={1080} shadows="soft" dpr={2} flat gl={{antialias: true, preserveDrawingBuffer: true}} style={{position: 'absolute', inset: 0}}>
          <Cena t={t} f={f} />
        </ThreeCanvas>
      ) : null}
      <Imersao t={t} />
      {t >= dest.a - 0.1 && t <= dest.b + 0.1 ? (
        <div style={{position: 'absolute', left: 960, top: 470, transform: 'translate(-50%, -50%)', opacity: 1 - clamp((t - (dest.b - 1.4)) / 1.4)}}>
          <PalavraColagem texto={dest.t} seed={77} size={190} f={f} inicio={dest.a * FPS} passo={5} />
        </div>
      ) : null}
      {/* faixa escura embaixo só para a letra respirar */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(18,10,5,0.5) 100%)', pointerEvents: 'none'}} />
      <Letra t={t} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('saudade/grao.png')})`, backgroundSize: 512, backgroundPosition: `${hash(f, 1) * 512}px ${hash(f, 2) * 512}px`, mixBlendMode: 'overlay', opacity: 0.4, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(25,12,4,0.55) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#0b0806', opacity: preto, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
