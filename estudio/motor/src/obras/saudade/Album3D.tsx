// Álbum 3D de verdade (three.js): capa com espessura, lombada, miolo de páginas, sombras. Abre no começo e fecha no fim da "Aula da Saudade".
// Tudo vem por props (quadro, ângulo, câmera): nada de estado interno, para o render por quadro ser determinístico.
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {clamp, hash} from '../../kit';

const W = 3.2; // largura da página (16:9, igual à tela)
const H = 1.8;
const BT = 0.26; // espessura do miolo
const CT = 0.06; // espessura da capa

const PAPEIS: [string, string][] = [
  ['t1', '#2a2a3a'], ['t2', '#3a1f2b'], ['t3', '#7b2a35'], ['t4', '#f3e9d2'], ['t5', '#f6e9c8'], ['t6', '#8c2f3a'], ['t7', '#23263a'], ['t8', '#2a1c14'],
];
const RANSOM = ['S_Abril', 'S_Alfa', 'S_Bevan', 'S_Pacifico', 'S_Shrikhand', 'S_Rye', 'S_DM', 'S_DMi', 'S_Bungee', 'S_Lobster', 'S_Play'];

// ---------------------------------------------------------------- imagens (carrega uma vez)
const NOMES = ['capa', 'fundo4', 'escuro', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 'fundo1'];
const imgs: Record<string, HTMLImageElement> = {};
let imgsOk = false;
let imgsP: Promise<void> | null = null;
let ultima: HTMLImageElement | null = null;
const carregaImgs = (): Promise<void> => {
  if (imgsP) return imgsP;
  const lista: [string, string][] = [...NOMES.map((n) => [n, staticFile(`saudade/papel/${n}.jpg`)] as [string, string]), ['ultima', staticFile('saudade/ultima.jpg')]];
  imgsP = Promise.all(
    lista.map(
      ([n, src]) =>
        new Promise<void>((res) => {
          const im = new Image();
          im.onload = () => { imgs[n] = im; res(); };
          im.onerror = () => res();
          im.src = src;
        }),
    ),
  ).then(() => { ultima = imgs.ultima ?? null; imgsOk = true; });
  return imgsP;
};

const E = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// ---------------------------------------------------------------- texturas desenhadas em canvas 2D
const cobre = (ctx: CanvasRenderingContext2D, im: HTMLImageElement | undefined, w: number, h: number) => {
  if (!im) return;
  const k = Math.max(w / im.width, h / im.height);
  ctx.drawImage(im, (w - im.width * k) / 2, (h - im.height * k) / 2, im.width * k, im.height * k);
};

type Linha = {t: string; size: number; ini: number; passo: number};

const recorte = (ctx: CanvasRenderingContext2D, ch: string, seed: number, size: number, swap: number, cx: number, cy: number) => {
  if (swap < 0) return;
  const v = swap < 14 ? Math.floor(swap / 3) : 99;
  const sd = seed * 7 + v * 13;
  const fam = RANSOM[Math.floor(hash(sd, 1) * RANSOM.length)];
  const [papel, tinta] = PAPEIS[Math.floor(hash(sd, 2) * PAPEIS.length)];
  const rot = ((hash(sd, 3) - 0.5) * 14 * Math.PI) / 180;
  const alta = hash(sd, 4) < 0.72;
  const w = size * (0.95 + hash(sd, 5) * 0.3);
  const h = size * (1.12 + hash(sd, 6) * 0.22);
  const pop = swap < 7 ? E(clamp(swap / 7)) : 1;
  const j = size * 0.05;
  const r = (k: number) => (hash(sd, 100 + k) - 0.5) * 2 * j;
  let k = 0;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 7; i++) pts.push([(w * i) / 7 + (i > 0 && i < 7 ? r(k++) : 0), r(k++)]);
  for (let i = 1; i < 7; i++) pts.push([w + r(k++), (h * i) / 7 + r(k++)]);
  for (let i = 7; i >= 0; i--) pts.push([(w * i) / 7 + (i > 0 && i < 7 ? r(k++) : 0), h + r(k++)]);
  for (let i = 6; i >= 1; i--) pts.push([r(k++), (h * i) / 7 + r(k++)]);
  ctx.save();
  ctx.globalAlpha = pop;
  ctx.translate(cx, cy + (1 - pop) * 26);
  ctx.rotate(rot);
  ctx.scale(0.65 + 0.35 * pop, 0.65 + 0.35 * pop);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(30,18,8,0.45)';
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetX = size * 0.05;
  ctx.shadowOffsetY = size * 0.07;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = '#d9c9a6';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.clip();
  const im = imgs[papel];
  if (im) {
    const s = (size * 5) / im.width;
    ctx.drawImage(im, -hash(sd, 8) * (im.width * s - w), -hash(sd, 9) * (im.height * s - h), im.width * s, im.height * s);
  }
  ctx.fillStyle = tinta;
  ctx.font = `${size}px ${fam}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(alta ? ch.toUpperCase() : ch.toLowerCase(), w / 2, h / 2 + size * 0.04);
  ctx.restore();
};

const desenhaCapa = (cv: HTMLCanvasElement, f: number, linhas: Linha[], sub: string | undefined, subA: number) => {
  const ctx = cv.getContext('2d')!;
  const w = cv.width;
  const h = cv.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#2a1b12';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.filter = 'brightness(1.9) sepia(0.45) contrast(1.05)';
  cobre(ctx, imgs.capa, w, h);
  ctx.restore();
  // costura tracejada
  ctx.strokeStyle = 'rgba(243,225,185,0.5)';
  ctx.lineWidth = 5;
  ctx.setLineDash([26, 16]);
  ctx.strokeRect(58, 58, w - 116, h - 116);
  ctx.setLineDash([]);
  // sombra da dobra da lombada
  const g = ctx.createLinearGradient(0, 0, 110, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.5)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 110, h);
  // título em colagem: cada linha centrada, letras trocando (A, B, C...) quando entram
  const esc = (w / 1920) * 1.3;
  let y = h * 0.40;
  linhas.forEach((l, li) => {
    const cs = l.t.split('');
    const base = l.size * esc;
    const total0 = cs.reduce((a, c) => a + (c === ' ' ? base * 0.8 : base * 0.98), 0);
    const size = base * Math.min(1, (w * 0.74) / total0); // a palavra nunca passa da costura
    const adv = (c: string) => (c === ' ' ? size * 0.8 : size * 0.98);
    const total = cs.reduce((a, c) => a + adv(c), 0);
    let x = w * 0.54 - total / 2;
    cs.forEach((c, i) => {
      if (c !== ' ') recorte(ctx, c, (li + 5) * 31 + i, size, f - (l.ini + i * l.passo), x + size * 0.5, y);
      x += adv(c);
    });
    y += size * 1.25;
  });
  if (sub) {
    ctx.save();
    ctx.globalAlpha = clamp((f - subA) / 30);
    ctx.fillStyle = '#f1e3c4';
    ctx.font = `${58 * esc}px S_Caveat`;
    ctx.textAlign = 'center';
    ctx.fillText(sub, w * 0.54, h * 0.88);
    ctx.restore();
  }
};

const desenhaPagina = (cv: HTMLCanvasElement, usaUltima: boolean) => {
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#e5dac3';
  ctx.fillRect(0, 0, cv.width, cv.height);
  cobre(ctx, usaUltima && ultima ? ultima : imgs.fundo1, cv.width, cv.height);
};

const desenhaMiolo = (cv: HTMLCanvasElement) => {
  // lateral do miolo: folhas finas (linhas horizontais) em creme envelhecido
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(0, 0, cv.width, cv.height);
  for (let y = 0; y < cv.height; y += 3) {
    const a = 0.1 + hash(y, 4) * 0.22;
    ctx.fillStyle = `rgba(110,80,40,${a})`;
    ctx.fillRect(0, y, cv.width, 1.4);
  }
  const g = ctx.createLinearGradient(0, 0, cv.width, 0);
  g.addColorStop(0, 'rgba(80,50,20,0.35)');
  g.addColorStop(0.08, 'rgba(80,50,20,0)');
  g.addColorStop(0.92, 'rgba(80,50,20,0)');
  g.addColorStop(1, 'rgba(80,50,20,0.35)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cv.width, cv.height);
};

const tex = (cv: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// ---------------------------------------------------------------- cena
export type Cam = {px: number; py: number; pz: number; lx: number; ly: number; lz: number};

const Cena: React.FC<{f: number; ang: number; cam: Cam; linhas: Linha[]; sub?: string; subA: number; usaUltima: boolean}> = ({f, ang, cam, linhas, sub, subA, usaUltima}) => {
  const capaCv = useMemo(() => { const c = document.createElement('canvas'); c.width = 2560; c.height = 1500; return c; }, []);
  const capaTex = useMemo(() => tex(capaCv), [capaCv]);
  desenhaCapa(capaCv, f, linhas, sub, subA);
  capaTex.needsUpdate = true;

  const {pagTex, miolo, dentro, mesa} = useMemo(() => {
    const p = document.createElement('canvas'); p.width = 1920; p.height = 1080; desenhaPagina(p, usaUltima);
    const m = document.createElement('canvas'); m.width = 64; m.height = 256; desenhaMiolo(m);
    const d = document.createElement('canvas'); d.width = 1600; d.height = 940; const dc = d.getContext('2d')!; dc.fillStyle = '#d9ccb0'; dc.fillRect(0, 0, 1600, 940); dc.filter = 'brightness(0.92)'; cobre(dc, imgs.fundo4, 1600, 940);
    const t = document.createElement('canvas'); t.width = 1600; t.height = 900; const tc = t.getContext('2d')!; tc.fillStyle = '#151210'; tc.fillRect(0, 0, 1600, 900); cobre(tc, imgs.escuro, 1600, 900);
    return {pagTex: tex(p), miolo: tex(m), dentro: tex(d), mesa: tex(t)};
  }, [usaUltima]);

  const u = ang / Math.PI; // 0 fechado, 1 aberto
  const s = E(clamp((u - 0.3) / 0.7));
  const pivotY = BT * (1 - s);

  const leather = '#4a2f22';
  // faces do box: +x, -x, +y, -y, +z, -z
  const matCapa = [
    <meshStandardMaterial key="a" attach="material-0" color={leather} roughness={0.8} />,
    <meshStandardMaterial key="b" attach="material-1" color={leather} roughness={0.8} />,
    <meshStandardMaterial key="c" attach="material-2" map={capaTex} roughness={0.78} metalness={0.02} />,
    <meshStandardMaterial key="d" attach="material-3" map={dentro} roughness={0.9} />,
    <meshStandardMaterial key="e" attach="material-4" color={leather} roughness={0.8} />,
    <meshStandardMaterial key="f" attach="material-5" color={leather} roughness={0.8} />,
  ];
  const matMiolo = [
    <meshStandardMaterial key="a" attach="material-0" map={miolo} roughness={0.95} />,
    <meshStandardMaterial key="b" attach="material-1" map={miolo} roughness={0.95} />,
    <meshBasicMaterial key="c" attach="material-2" map={pagTex} />,
    <meshStandardMaterial key="d" attach="material-3" map={miolo} roughness={0.95} />,
    <meshStandardMaterial key="e" attach="material-4" map={miolo} roughness={0.95} />,
    <meshStandardMaterial key="f" attach="material-5" map={miolo} roughness={0.95} />,
  ];

  return (
    <>
      <CameraRig cam={cam} />
      <hemisphereLight args={["#fff1d8", "#3a2616", 1.5]} />
      <directionalLight position={[-2.2, 5.5, 2.6]} intensity={1.7} color="#ffe2b8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-camera-near={0.5} shadow-camera-far={14} shadow-bias={-0.0004} shadow-radius={5} />
      {/* mesa */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, -0.062, 0]} receiveShadow>
        <planeGeometry args={[22, 12.4]} />
        <meshStandardMaterial map={mesa} roughness={1} />
      </mesh>
      {/* capa de trás */}
      <mesh position={[(W + 0.07 - 0.06) / 2, -CT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.13, CT, H + 0.16]} />
        <meshStandardMaterial color={leather} roughness={0.8} />
      </mesh>
      {/* lombada */}
      <mesh position={[-0.03, (BT + CT - CT) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, BT + CT, H + 0.16]} />
        <meshStandardMaterial color="#3a2418" roughness={0.75} />
      </mesh>
      {/* miolo de páginas (a face de cima é a página que o 2D continua) */}
      <mesh position={[W / 2, BT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, BT, H]} />
        {matMiolo}
      </mesh>
      {/* capa da frente: gira na lombada */}
      <group position={[0, pivotY, 0]} rotation={[0, 0, ang]}>
        <mesh position={[(W + 0.07) / 2, CT / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.07, CT, H + 0.16]} />
          {matCapa}
        </mesh>
      </group>
    </>
  );
};

const CameraRig: React.FC<{cam: Cam}> = ({cam}) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  // mexe na câmera padrão durante o render (os efeitos do ThreeCanvas rodam depois de nós; o quadro só avança após eles)
  camera.fov = FOV;
  camera.near = 0.1;
  camera.far = 60;
  camera.position.set(cam.px, cam.py, cam.pz);
  camera.up.set(0, 0, -1);
  camera.lookAt(cam.lx, cam.ly, cam.lz);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return null;
};

export const FOV = 35;
export const DIST_TOPO = H / 2 / Math.tan((FOV * Math.PI) / 360); // distância para a página ocupar a tela inteira

export const Album3D: React.FC<{f: number; ang: number; cam: Cam; linhas: Linha[]; sub?: string; subA?: number; usaUltima?: boolean}> = ({f, ang, cam, linhas, sub, subA = 0, usaUltima = false}) => {
  const [ok, setOk] = useState(imgsOk);
  const [h] = useState(() => (imgsOk ? null : delayRender('imagens do album3d')));
  useEffect(() => {
    carregaImgs().then(() => { setOk(true); if (h !== null) continueRender(h); });
  }, [h]);
  if (!ok) return null;
  return (
    <ThreeCanvas width={1920} height={1080} shadows="soft" flat gl={{antialias: true, preserveDrawingBuffer: true}} style={{position: 'absolute', inset: 0}}>
      <Cena f={f} ang={ang} cam={cam} linhas={linhas} sub={sub} subA={subA} usaUltima={usaUltima} />
    </ThreeCanvas>
  );
};

export const ALBUM = {W, H, BT, CT};
