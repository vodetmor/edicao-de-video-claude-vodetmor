// Celular 3D estilo iPhone (Pro, bordas de titânio, Dynamic Island, câmera tripla). three.js puro.
// O mesmo arquivo serve o Remotion (IPhone3D.tsx) e a página de demonstração (demo.html).
// Medidas em décimos de metro: 1 unidade = 100 mm. Sem logo da Apple de propósito.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

const BORDA = 0.0277; // moldura preta em volta da tela
export const IPHONE = {
  w: 0.706, h: 1.466, d: 0.0825, raio: 0.118,
  tela: {w: 0.706 - 2 * BORDA, h: 1.466 - 2 * BORDA, raio: 0.118 - BORDA}, // 1179 × 2556 px, proporção 2,168
  px: {w: 1179, h: 2556},
};

export const CORES = {
  natural: {aro: '#a19d95', traseira: '#b3aea5', anel: '#8f8b84'},
  preto: {aro: '#3a3a3c', traseira: '#2b2b2d', anel: '#2f2f31'},
  branco: {aro: '#d8d6d1', traseira: '#dcdad5', anel: '#c9c7c2'},
  deserto: {aro: '#b8a58f', traseira: '#c4b4a0', anel: '#a8957f'},
};

const forma = (w, h, r) => {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  // cantos "squircle": bézier cúbica em vez de arco, como nos aparelhos da Apple
  const k = 0.62;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.bezierCurveTo(x + w - r * (1 - k), y, x + w, y + r * (1 - k), x + w, y + r);
  s.lineTo(x + w, y + h - r); s.bezierCurveTo(x + w, y + h - r * (1 - k), x + w - r * (1 - k), y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.bezierCurveTo(x + r * (1 - k), y + h, x, y + h - r * (1 - k), x, y + h - r);
  s.lineTo(x, y + r); s.bezierCurveTo(x, y + r * (1 - k), x + r * (1 - k), y, x + r, y);
  return s;
};
// plano com UV 0..1 na caixa toda (a imagem ocupa a tela inteira, os cantos cortam)
const plano = (w, h, r, seg = 24) => {
  const g = new THREE.ShapeGeometry(forma(w, h, r), seg);
  const uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  return g;
};
const pilula = (w, h) => plano(w, h, Math.min(w, h) / 2, 12);

/** Barra de status (hora, sinal, wi-fi, bateria) desenhada em canvas, transparente. */
export const desenhaBarra = (hora = '9:41', cor = '#ffffff') => {
  const c = document.createElement('canvas');
  c.width = 1179; c.height = 170;
  const g = c.getContext('2d');
  g.fillStyle = cor; g.strokeStyle = cor;
  g.font = '600 52px Inter, "SF Pro Text", -apple-system, "Helvetica Neue", Arial, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(hora, 215, 92);
  // sinal: 4 barras
  for (let i = 0; i < 4; i++) { const bh = 14 + i * 8; g.beginPath(); g.roundRect(842 + i * 17, 108 - bh, 11, bh, 3); g.fill(); }
  // wi-fi: 3 arcos
  g.lineCap = 'round'; g.lineWidth = 8;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(940, 110, 12 + i * 13, -Math.PI * 0.75, -Math.PI * 0.25); g.stroke(); }
  g.beginPath(); g.arc(940, 106, 4, 0, Math.PI * 2); g.fill();
  // bateria
  g.lineWidth = 3.5; g.globalAlpha = 0.45; g.beginPath(); g.roundRect(990, 76, 70, 33, 9); g.stroke();
  g.beginPath(); g.roundRect(1064, 86, 5, 13, 2); g.fill(); g.globalAlpha = 1;
  g.beginPath(); g.roundRect(995, 81, 52, 23, 5.5); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};

/** Tela de bloqueio simples (fundo de cor única, hora grande, data). Útil para "ligar" o celular. */
export const desenhaBloqueio = ({hora = '9:41', data = 'terça-feira, 21 de outubro', fundo = '#1f2b33', texto = '#f4f1ec'} = {}) => {
  const c = document.createElement('canvas');
  c.width = IPHONE.px.w; c.height = IPHONE.px.h;
  const g = c.getContext('2d');
  g.fillStyle = fundo; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = texto; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const fam = 'Inter, "SF Pro Display", -apple-system, "Helvetica Neue", Arial, sans-serif';
  g.globalAlpha = 0.85; g.font = `500 62px ${fam}`; g.fillText(data, c.width / 2, 420);
  g.globalAlpha = 1; g.font = `600 330px ${fam}`; g.fillText(hora, c.width / 2, 730);
  // botões de lanterna e câmera
  g.globalAlpha = 0.18;
  for (const x of [190, c.width - 190]) { g.beginPath(); g.arc(x, c.height - 260, 82, 0, Math.PI * 2); g.fill(); }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};

const ambientes = new WeakMap();
/** Reflexo de estúdio (RoomEnvironment) para o metal e o vidro. Um por renderer. */
export const ambienteEstudio = (renderer) => {
  if (!ambientes.has(renderer)) {
    const pm = new THREE.PMREMGenerator(renderer);
    ambientes.set(renderer, pm.fromScene(new RoomEnvironment(), 0.04).texture);
    pm.dispose();
  }
  return ambientes.get(renderer);
};

/**
 * Cria o celular. Devolve {objeto, setTela, setRolagem, setBrilho, setCor, setBarra, setAmbiente, dispose}.
 * Frente olha para +Z. Centro do aparelho na origem.
 */
export const criarIPhone = ({cor = 'natural', barra = 'clara', hora = '9:41', indicador = true} = {}) => {
  const {w, h, d, raio, tela: T} = IPHONE;
  const objeto = new THREE.Group();
  const geos = [], mats = [];
  const g = (x) => (geos.push(x), x);
  const m = (x) => (mats.push(x), x);
  const add = (geo, mat, pos = [0, 0, 0], rot = null, pai = objeto) => {
    const me = new THREE.Mesh(geo, mat);
    me.position.set(...pos);
    if (rot) me.rotation.set(...rot);
    me.castShadow = true;
    pai.add(me);
    return me;
  };

  // aro de titânio: forma extrudada com chanfro arredondado
  const b = 0.014;
  const aroGeo = g(new THREE.ExtrudeGeometry(forma(w - 2 * b, h - 2 * b, raio - b), {
    depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 8, curveSegments: 40,
  }));
  aroGeo.translate(0, 0, -(d - 2 * b) / 2);
  const matAro = m(new THREE.MeshPhysicalMaterial({metalness: 1, roughness: 0.32, clearcoat: 0.3, clearcoatRoughness: 0.4}));
  add(aroGeo, matAro);

  // vidro da frente (preto) e tela
  const zf = d / 2;
  const matVidro = m(new THREE.MeshPhysicalMaterial({color: '#030304', roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03}));
  add(g(plano(w - 0.01, h - 0.01, raio - 0.005)), matVidro, [0, 0, zf + 0.0003]);
  const matTela = m(new THREE.MeshBasicMaterial({color: '#000000', toneMapped: false}));
  add(g(plano(T.w, T.h, T.raio)), matTela, [0, 0, zf + 0.0006]);

  // barra de status e indicador de início, por cima da tela
  const hBarra = T.w * (170 / 1179);
  const matBarra = m(new THREE.MeshBasicMaterial({transparent: true, toneMapped: false, depthWrite: false}));
  const barraMesh = add(g(new THREE.PlaneGeometry(T.w, hBarra)), matBarra, [0, T.h / 2 - hBarra / 2, zf + 0.0008]);
  const matIndic = m(new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false}));
  const indic = add(g(pilula(T.w * 0.36, 0.0085)), matIndic, [0, -T.h / 2 + 0.017, zf + 0.0008]);
  indic.visible = indicador;

  // Dynamic Island
  const matPreto = m(new THREE.MeshBasicMaterial({color: '#000000'}));
  add(g(pilula(0.127, 0.0375)), matPreto, [0, T.h / 2 - 0.0335, zf + 0.0009]);
  const matLenteF = m(new THREE.MeshPhysicalMaterial({color: '#0b0d12', roughness: 0.05, clearcoat: 1}));
  add(g(new THREE.CircleGeometry(0.0062, 24)), matLenteF, [0.037, T.h / 2 - 0.0335, zf + 0.001]);

  // reflexo do vidro: camada aditiva preta, só soma o brilho do ambiente
  const matReflexo = m(new THREE.MeshStandardMaterial({color: '#000000', roughness: 0.06, metalness: 1, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, envMapIntensity: 0.22}));
  add(g(plano(w - 0.01, h - 0.01, raio - 0.005)), matReflexo, [0, 0, zf + 0.0012]);

  // botões laterais (ação, volume +, volume −; liga/desliga do outro lado)
  const matBotao = matAro;
  const botao = (lado, y, comp) => add(g(new RoundedBoxGeometry(0.012, comp, d * 0.34, 4, 0.0055)), matBotao, [lado * (w / 2 + 0.0025), y, 0]);
  botao(-1, 0.41, 0.07); botao(-1, 0.285, 0.115); botao(-1, 0.15, 0.115); botao(1, 0.26, 0.18);

  // traseira de vidro fosco
  const zt = -d / 2;
  const matTraseira = m(new THREE.MeshPhysicalMaterial({roughness: 0.42, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.5}));
  add(g(plano(w - 0.01, h - 0.01, raio - 0.005)), matTraseira, [0, 0, zt - 0.0003], [0, Math.PI, 0]);

  // módulo da câmera (canto superior esquerdo visto de trás = +X local)
  const cam = new THREE.Group();
  const mod = 0.335, cx = w / 2 - 0.035 - mod / 2, cy = h / 2 - 0.035 - mod / 2;
  cam.position.set(cx, cy, zt);
  cam.rotation.y = Math.PI; // dentro do grupo, +Z aponta para fora da traseira
  objeto.add(cam);
  const matModulo = m(new THREE.MeshPhysicalMaterial({roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05}));
  const modGeo = g(new THREE.ExtrudeGeometry(forma(mod - 0.008, mod - 0.008, 0.072), {depth: 0.006, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 4, curveSegments: 24}));
  add(modGeo, matModulo, [0, 0, 0.004], null, cam);
  const matAnel = m(new THREE.MeshPhysicalMaterial({metalness: 1, roughness: 0.22}));
  const matLente = m(new THREE.MeshPhysicalMaterial({color: '#07080b', roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0}));
  const matMiolo = m(new THREE.MeshPhysicalMaterial({color: '#1b2030', roughness: 0.05, metalness: 0.4, clearcoat: 1}));
  const lente = (x, y) => {
    add(g(new THREE.CylinderGeometry(0.06, 0.062, 0.02, 48)), matAnel, [x, y, 0.02], [Math.PI / 2, 0, 0], cam);
    add(g(new THREE.CircleGeometry(0.048, 48)), matLente, [x, y, 0.0302], null, cam);
    add(g(new THREE.CircleGeometry(0.02, 32)), matMiolo, [x, y, 0.0304], null, cam);
  };
  // visto de trás: duas lentes empilhadas à esquerda, uma no meio à direita
  lente(-0.08, 0.08); lente(-0.08, -0.08); lente(0.075, 0);
  const matFlash = m(new THREE.MeshPhysicalMaterial({color: '#f3ecd6', roughness: 0.3, clearcoat: 1}));
  add(g(new THREE.CircleGeometry(0.019, 32)), matFlash, [0.085, 0.112, 0.0145], null, cam);
  add(g(new THREE.CircleGeometry(0.017, 32)), matLente, [0.085, -0.112, 0.0145], null, cam);

  // ---------------------------------------------------------------- controles
  let tex = null, razao = IPHONE.tela.h / IPHONE.tela.w, rolagem = 0, brilho = 1, topo = 0;
  const aplicaTela = () => {
    if (!tex) return;
    // a imagem ocupa a tela abaixo da faixa `topo`; a faixa repete a primeira linha da imagem (como o Safari faz)
    const vis = Math.min(1, ((1 - topo) * T.h / T.w) / razao); // fração visível da imagem
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1, vis / (1 - topo));
    tex.offset.set(0, 1 - vis - rolagem * (1 - vis));
  };
  const api = {
    objeto,
    /**
     * Textura da tela (imagem, canvas ou vídeo). Imagem mais alta que a tela rola com setRolagem.
     * Opções: {razao: altura/largura da imagem (lida da imagem se faltar), areaSegura: true para começar a imagem
     * abaixo da barra de status, como um site aberto no Safari}. Um número no lugar das opções vale como razao.
     */
    setTela(t, op = {}) {
      if (typeof op === 'number') op = {razao: op};
      const r = op.razao;
      topo = op.areaSegura ? 0.069 : 0; // 177 px de 2556: altura da barra de status do iOS
      if (t !== tex) {
        tex = t;
        matTela.map = t; matTela.needsUpdate = true;
      }
      if (r) razao = r;
      else if (t && t.image && t.image.width) razao = t.image.height / t.image.width;
      aplicaTela();
      api.setBrilho(brilho);
      return api;
    },
    /** 0 = topo da imagem, 1 = fim. */
    setRolagem(r) { rolagem = Math.max(0, Math.min(1, r)); aplicaTela(); return api; },
    /** 0 = tela apagada, 1 = normal. Apaga a barra e o indicador junto. */
    setBrilho(v) {
      brilho = v;
      matTela.color.setScalar(tex ? v : 0);
      matBarra.opacity = v; matIndic.opacity = 0.9 * v;
      return api;
    },
    setCor(nome) {
      const c = CORES[nome] || CORES.natural;
      matAro.color.set(c.aro); matTraseira.color.set(c.traseira); matModulo.color.set(c.traseira).multiplyScalar(0.93); matAnel.color.set(c.anel);
      return api;
    },
    /** 'clara' (texto branco), 'escura' (texto preto) ou false. */
    setBarra(modo, novaHora = hora) {
      if (matBarra.map) matBarra.map.dispose();
      matBarra.map = modo ? desenhaBarra(novaHora, modo === 'escura' ? '#000000' : '#ffffff') : null;
      barraMesh.visible = !!modo; matBarra.needsUpdate = true;
      return api;
    },
    setAmbiente(env) {
      for (const x of mats) if (x.isMeshStandardMaterial) { x.envMap = env; x.needsUpdate = true; }
      return api;
    },
    dispose() {
      geos.forEach((x) => x.dispose());
      if (matBarra.map) matBarra.map.dispose();
      mats.forEach((x) => x.dispose());
    },
  };
  api.setCor(cor).setBarra(barra, hora).setBrilho(1);
  return api;
};

// ---------------------------------------------------------------- animação de demonstração (8 s, em loop)
const lim = (x) => Math.max(0, Math.min(1, x));
const faixa = (t, a, b) => lim((t - a) / (b - a));
// mola criticamente amortecida aproximada: chega rápido e pousa suave
const pousa = (x) => 1 - Math.pow(1 - x, 3.2);
const vaivem = (x) => x * x * (3 - 2 * x);

/** Pose do celular no tempo t (segundos). Mesma coreografia na demo e no Remotion. */
export const poseDemo = (t) => {
  t = ((t % 8) + 8) % 8;
  const sobe = pousa(faixa(t, 0, 1.4));
  const vira = pousa(faixa(t, 1.5, 2.9));
  const inclina = vaivem(faixa(t, 4.2, 5.4)) - vaivem(faixa(t, 6.6, 7.6));
  return {
    pos: [0, -1.2 * (1 - sobe), 0],
    rot: [
      -0.32 * (1 - sobe) - 0.12 * inclina,
      Math.PI * (1 - vira) + 0.5 * (1 - sobe) + 0.38 * inclina,
      0.05 * (1 - vira) * sobe,
    ],
    brilho: lim(faixa(t, 3.0, 3.35)) * (t > 4.0 && t < 4.3 ? 1 - Math.sin(faixa(t, 4.0, 4.3) * Math.PI) * 0.9 : 1),
    tela: t < 4.15 ? 'bloqueio' : 'site',
    rolagem: vaivem(faixa(t, 4.6, 6.9)) * 0.55,
    sumir: faixa(t, 7.6, 8), // fade de saída para o loop
  };
};
