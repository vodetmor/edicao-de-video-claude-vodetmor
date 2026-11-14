// Meu Terceirão · FINAL (Tempo Perdido inteira, 302 s, 1920x1080, 30 fps)
// Plano: memoria/meu-terceirao-plano-final.md · linha do tempo: plano.json (gerada por trabalho/scripts/montar_final.py)
// Assets: public/final/p (fotos), public/final/v (vídeos), public/final/tempo-perdido.mp3
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {approach, clamp, E, hash, lerp} from '../../kit';
import {IntroTV, Lembranca, useFontes} from './Terceirao';
import plano from './plano.json';
import acervo from './acervo.json';
import rostos from './rostos.json';
import atlas from './atlas.json';

const FPS = 30;
export const DUR_FINAL = Math.round(plano.duracao * FPS);
const s = (t: number) => Math.round(t * FPS);
const FOTO = (id: string) => staticFile(`final/p/${id}.jpg`);
const VID = (id: string) => staticFile(`final/v/${id}.mp4`);
const CREME = '#ece4d1';
const FUNDO = '#0e0d0b';
const SERIF = "'Instrument Serif', Georgia, serif";
const MONO = "'JetBrains Mono', monospace";
const SOMBRA_TXT = '0 2px 22px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.9)';

type FotoM = {id: string; grupo: string; w: number; h: number; o: 'h' | 'v'};
type VidM = {id: string; w: number; h: number; o: 'h' | 'v'; dur: number; audio: boolean; lufs: number | null; ini: number};
const FM: Record<string, FotoM> = Object.fromEntries((acervo.fotos as FotoM[]).map((x) => [x.id, x]));
const VM: Record<string, VidM> = Object.fromEntries((acervo.videos as VidM[]).map((x) => [x.id, x]));

type Tile = {id: string; v?: number};
type Bloco = {k: string; t0: number; t1: number; id?: string; ids?: string[]; bloom?: number; flash?: boolean; voo?: number; foco?: string; abraco?: boolean; tiles?: Tile[]; A?: number[][]; B?: number[][]; C?: number[][]};
const BLOCOS = plano.blocos as unknown as Bloco[];
const MINI = (id: string) => staticFile(`final/t/${id}.jpg`);

// ---------------------------------------------------------------- enquadramento pelo rosto (rostos.json, gerado por trabalho/scripts/rostos.py)
// O corte automático centralizava no meio da foto e pegava o chapéu em vez do rosto.
// Aqui o rosto vai para ~54% da altura do quadro, sem cortar o que está acima dele (chapéu), e o zoom caminha para o rosto.
type Rosto = {x: number; y: number; topo: number; n: number};
const RO = rostos as Record<string, Rosto>;
const enquadra = (id: string, W: number, H: number) => {
  const m = FM[id];
  const r = RO[id] ?? {x: 0.5, y: 0.42, topo: 0.3, n: 0};
  const k = Math.max(W / m.w, H / m.h);
  const iw = m.w * k, ih = m.h * k;
  let px = 50, py = 50, sx = r.x, sy = r.y;
  if (ih > H + 1) {
    const chapeu = Math.max(0, r.topo - (r.y - r.topo) * 2) * ih; // topo provável do chapéu/cabelo
    const top = Math.max(0, Math.min(ih - H, Math.min(r.y * ih - 0.54 * H, chapeu)));
    py = (top / (ih - H)) * 100;
    sy = (r.y * ih - top) / H;
  }
  if (iw > W + 1) {
    const left = Math.max(0, Math.min(iw - W, r.x * iw - 0.5 * W));
    px = (left / (iw - W)) * 100;
    sx = (r.x * iw - left) / W;
  }
  return {pos: `${px.toFixed(1)}% ${py.toFixed(1)}%`, origem: `${(clamp(sx) * 100).toFixed(1)}% ${(clamp(sy) * 100).toFixed(1)}%`};
};

// ---------------------------------------------------------------- passagem contínua entre fotos (no lugar do corte seco)
// A foto nova entra deslizando pela direita enquanto a anterior segue para a esquerda mais devagar (paralaxe):
// a sensação é de uma câmera que anda por uma fileira de fotos sem parar.
type Passagem = {entra?: number; cauda?: number};
const usePassagem = (dur: number, {entra = 0, cauda = 0}: Passagem): React.CSSProperties => {
  const f = useCurrentFrame();
  if (entra && f < entra) {
    const k = E.cam(clamp(f / entra));
    return {transform: `translateX(${((1 - k) * 100).toFixed(2)}%) scale(${lerp(1.05, 1, k).toFixed(4)})`, boxShadow: '-60px 0 120px rgba(0,0,0,0.55)'};
  }
  if (cauda && f >= dur) {
    const k = E.cam(clamp((f - dur) / cauda));
    return {transform: `translateX(${(-k * 34).toFixed(2)}%) scale(${lerp(1, 0.97, k).toFixed(4)})`, filter: `brightness(${lerp(1, 0.55, k).toFixed(3)})`};
  }
  return {};
};

// cor de lembrança: quente, amarelada (n = 0 cor viva … 1 mais quente)
const filtro = (n: number) =>
  `sepia(${lerp(0.08, 0.38, n).toFixed(3)}) saturate(${lerp(1.2, 1.4, n).toFixed(3)}) contrast(${lerp(1.0, 0.92, n).toFixed(3)}) brightness(${lerp(1, 1.05, n).toFixed(3)})`;

const Grao: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <filter id="grao-f">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 97} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grao-f)" />
    </svg>
  );
};

const Sombra: React.FC<{forte?: boolean}> = ({forte}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 48%, rgba(0,0,0,${forte ? 0.85 : 0.72}) 100%)`}} />
);
const Clarao: React.FC<{n?: number}> = ({n = 3}) => {
  const f = useCurrentFrame();
  if (f >= n) return null;
  return <AbsoluteFill style={{background: '#fff6e6', opacity: [0.85, 0.45, 0.18][f] ?? 0}} />;
};

// ---------------------------------------------------------------- uma foto em tela cheia (horizontal = cover; vertical = fundo desfocado + foto na altura toda)
const FotoCheia: React.FC<{id: string; dur: number; bloom?: number; flash?: boolean; vhs?: boolean} & Passagem> = ({id, dur, bloom = 0, flash, vhs, entra, cauda}) => {
  const f = useCurrentFrame();
  const m = FM[id];
  const total = dur + (cauda ?? 0);
  const t = f / Math.max(1, total);
  const pulo = entra ? 0 : 0.035 * (1 - clamp(f / 6)); // o "soco" de entrada só existe no corte seco
  const sc = 1 + 0.09 * t + pulo;
  const dx = -18 * t; // deriva sempre para a esquerda: mesma direção da passagem entre fotos
  const q = enquadra(id, 1920, 1080);
  const r = RO[id];
  const pass = usePassagem(dur, {entra, cauda});
  const miolo =
    m.o === 'h' ? (
      <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: q.pos, transformOrigin: q.origem, transform: `scale(${sc.toFixed(4)}) translateX(${dx.toFixed(1)}px)`, filter: filtro(0.4)}} />
    ) : (
      <AbsoluteFill style={{background: FUNDO}}>
        <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(46px) brightness(0.55) ${filtro(0.4)}`, transform: 'scale(1.25)'}} />
        <Img src={FOTO(id)} style={{position: 'absolute', left: '50%', top: 0, height: '100%', width: 'auto', transformOrigin: r ? `${(r.x * 100).toFixed(1)}% ${(r.y * 100).toFixed(1)}%` : undefined, transform: `translateX(-50%) scale(${sc.toFixed(4)})`, boxShadow: '0 0 80px rgba(0,0,0,0.6)', filter: filtro(0.4)}} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: FUNDO, ...pass}}>
      <Lembranca i={bloom}>{miolo}</Lembranca>
      <Sombra />
      {vhs && <Vhs />}
      {flash && <Clarao />}
    </AbsoluteFill>
  );
};

const Vhs: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0) 5px, rgba(0,0,0,0) 10px)'}} />
      <div style={{position: 'absolute', left: 110, top: 80, fontFamily: MONO, fontWeight: 500, fontSize: 44, color: '#f6f3ea', textShadow: '3px 0 0 rgba(255,0,0,0.4), -3px 0 0 rgba(0,255,255,0.4)', opacity: Math.floor(f / 15) % 2 ? 0.55 : 1}}>▶ PLAY</div>
      <div style={{position: 'absolute', right: 110, top: 80, fontFamily: MONO, fontWeight: 500, fontSize: 44, color: '#f6f3ea', textShadow: '3px 0 0 rgba(255,0,0,0.4), -3px 0 0 rgba(0,255,255,0.4)'}}>DF</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- duas verticais lado a lado
const Dupla: React.FC<{ids: string[]; dur: number; bloom?: number} & Passagem> = ({ids, dur, bloom = 0, entra, cauda}) => {
  const f = useCurrentFrame();
  const t = f / Math.max(1, dur + (cauda ?? 0));
  const pass = usePassagem(dur, {entra, cauda});
  const lado = (id: string, esq: boolean) => {
    const q = enquadra(id, 956, 1080);
    return (
      <div style={{position: 'absolute', left: esq ? 0 : '50.2%', top: 0, width: '49.8%', height: '100%', overflow: 'hidden'}}>
        <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: q.pos, transformOrigin: q.origem, transform: `scale(${(1 + 0.07 * (esq ? t : 1 - t) + (entra ? 0 : 0.03 * (1 - clamp(f / 6)))).toFixed(4)})`, filter: filtro(0.4)}} />
      </div>
    );
  };
  return (
    <AbsoluteFill style={{background: FUNDO, ...pass}}>
      <Lembranca i={bloom}>
        <AbsoluteFill>{lado(ids[0], true)}{lado(ids[1], false)}</AbsoluteFill>
      </Lembranca>
      <Sombra />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- portal: câmera entra na parede de polaroids de criança
const Portal: React.FC<{id: string; dur: number}> = ({id, dur}) => {
  const f = useCurrentFrame();
  const u = clamp(f / dur);
  const k = E.inQuad(u);
  const sc = lerp(1, 6.5, k);
  const m = FM[id];
  const larg = 1080 * (m.w / m.h);
  const ox = (1920 - larg) / 2 + larg * 0.1; // onde ficam os polaroids de criança na parede
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      <Lembranca i={0.3 + 0.7 * u}>
        <AbsoluteFill style={{overflow: 'hidden'}}>
          <AbsoluteFill style={{transformOrigin: `${ox.toFixed(0)}px 594px`, transform: `scale(${sc.toFixed(3)})`}}>
            <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(46px) brightness(0.6) ${filtro(0.4)}`, transform: 'scale(1.25)'}} />
            <Img src={FOTO(id)} style={{position: 'absolute', left: '50%', top: 0, height: '100%', width: 'auto', transform: 'translateX(-50%)', filter: filtro(0.4)}} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Lembranca>
      <Sombra />
      <AbsoluteFill style={{background: '#fff6e6', opacity: clamp((u - 0.7) / 0.3) * 0.9}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- vídeo com som (solo) e mosaico mudo
// ritmo de segurança: se o vídeo tem menos imagem do que o bloco pede, desacelera um pouco em vez de ficar preto
const ritmo = (id: string, dur: number) => {
  const m = VM[id];
  const tem = m.dur - m.ini - 0.1;
  const precisa = dur / FPS;
  return tem >= precisa ? 1 : Math.max(0.5, tem / precisa);
};
const ganhoDe = (id: string, alvo: number) => {
  const m = VM[id];
  return m.lufs == null || m.lufs < -45 ? 0 : Math.min(1, Math.pow(10, (alvo - m.lufs) / 20));
};
const Solo: React.FC<{id: string; dur: number; abraco?: boolean}> = ({id, dur}) => {
  const f = useCurrentFrame();
  const m = VM[id];
  const entra = clamp(f / 5);
  const sai = clamp((dur - f) / 5);
  const op = Math.min(entra, sai);
  const ini = s(m.ini);
  const g = ganhoDe(id, -18);
  const pr = ritmo(id, dur);
  const ganho = (fr: number) => g * Math.min(clamp((fr + 1) / 4), clamp((dur - fr) / 5));
  const fg: React.CSSProperties =
    m.o === 'h'
      ? {width: '100%', height: '100%', objectFit: 'cover', filter: filtro(0.35)}
      : {position: 'absolute', left: '50%', top: 0, height: '100%', width: 'auto', transform: 'translateX(-50%)', filter: filtro(0.35)};
  return (
    <AbsoluteFill style={{background: FUNDO, opacity: op}}>
      {m.o === 'v' && <OffthreadVideo src={VID(id)} startFrom={ini} playbackRate={pr} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(46px) brightness(0.5) ${filtro(0.35)}`, transform: 'scale(1.25)'}} />}
      <OffthreadVideo src={VID(id)} startFrom={ini} playbackRate={pr} volume={ganho} style={fg} />
      <Sombra />
    </AbsoluteFill>
  );
};

const Mosaico: React.FC<{ids: string[]; dur: number}> = ({ids, dur}) => {
  const f = useCurrentFrame();
  const todosV = ids.every((i) => VM[i].o === 'v');
  // som: o vídeo mais vivo do mosaico na frente (-20 LUFS), os outros como burburinho ao fundo (-32)
  const lider = [...ids].filter((i) => ritmo(i, dur) === 1 && (VM[i].lufs ?? -99) > -45).sort((a, b) => (VM[b].lufs ?? -99) - (VM[a].lufs ?? -99))[0];
  const lay = (i: number): React.CSSProperties =>
    ids.length === 2 ? {left: (i % 2) * 962, top: 0, width: 958, height: 1080} : todosV ? {left: i * 480, top: 0, width: 476, height: 1080} : {left: (i % 2) * 962, top: Math.floor(i / 2) * 542, width: 958, height: 538};
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      {ids.map((id, i) => {
        const k = E.expr(clamp((f - i * 3) / 6));
        const sai = clamp((dur - f) / 4);
        return (
          <div key={id} style={{position: 'absolute', ...lay(i), overflow: 'hidden', opacity: Math.min(k, sai), transform: `scale(${lerp(1.08, 1, k).toFixed(4)})`}}>
            <OffthreadVideo
              src={VID(id)}
              startFrom={s(VM[id].ini)}
              playbackRate={ritmo(id, dur)}
              volume={(fr) => (ritmo(id, dur) === 1 ? ganhoDe(id, id === lider ? -20 : -32) : 0) * Math.min(clamp((fr + 1) / 5), clamp((dur - fr) / 6))}
              style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro(0.4)}}
            />
          </div>
        );
      })}
      <Sombra />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- grade que se enche na meia-batida
const Grade: React.FC<{ids: string[]; dur: number}> = ({ids, dur}) => {
  const f = useCurrentFrame();
  const cols = 4, rows = Math.ceil(ids.length / cols);
  const w = 1920 / cols, h = 1080 / rows;
  const passo = Math.max(2, Math.floor((dur * 0.8) / ids.length));
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      {ids.map((id, i) => {
        const k = E.expr(clamp((f - i * passo) / 7));
        return (
          <div key={id} style={{position: 'absolute', left: (i % cols) * w, top: Math.floor(i / cols) * h, width: w - 4, height: h - 4, overflow: 'hidden', opacity: clamp(k * 3), transform: `scale(${lerp(1.25, 1, k).toFixed(4)})`}}>
            <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: enquadra(id, w, h).pos, transformOrigin: enquadra(id, w, h).origem, filter: filtro(0.4), transform: `scale(${(1 + (0.09 * f) / Math.max(1, dur)).toFixed(4)})`}} />
          </div>
        );
      })}
      <Clarao n={3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- mural 3D: a câmera voa por um túnel de fotos (polaroids no espaço)
const Polaroid: React.FC<{id: string; w: number; flat?: boolean}> = ({id, w}) => {
  const m = FM[id];
  const ratio = m.h / m.w;
  const iw = m.o === 'h' ? w : w * 0.78;
  const ih = iw * ratio;
  return (
    <div style={{width: iw + 28, height: ih + 28 + 30, padding: 14, paddingBottom: 44, background: CREME, boxShadow: '0 30px 70px rgba(0,0,0,0.55)', boxSizing: 'border-box'}}>
      <Img src={FOTO(id)} style={{width: iw, height: ih, objectFit: 'cover', display: 'block', filter: filtro(0.4)}} />
    </div>
  );
};

const Mural: React.FC<{ids: string[]; dur: number; voo: number}> = ({ids, dur, voo}) => {
  const f = useCurrentFrame();
  const n = ids.length;
  const DZ = 430;
  const u = clamp(f / dur);
  const prog = E.cam(u);
  const camZ = prog * (n * DZ - 150);
  // onde fica cada foto no túnel (a última fica no centro)
  const lugar = (i: number) => {
    if (i >= n - 1) return {x: 0, y: 0, lado: 0};
    const lado = i % 2 === 0 ? -1 : 1;
    return {x: lado * (300 + hash(i, 5 + voo) * 220), y: (hash(i, 9 + voo) - 0.5) * 300, lado};
  };
  // a câmera vai de foto em foto: mira a que está chegando perto, para ela passar no meio do quadro
  // (antes a câmera só balançava no eixo e as fotos grandes passavam meio fora do quadro)
  // fica travada na foto enquanto ela está grande; só troca para a próxima quando a atual já está se dissolvendo
  const q = Math.max(0, Math.min(n - 1, (camZ - 600) / DZ));
  const qa = Math.floor(q), qb = Math.min(n - 1, qa + 1), qk = E.cam(clamp((q - qa - 0.62) / 0.38));
  const camX = lerp(lugar(qa).x, lugar(qb).x, qk) * 0.95;
  const camY = lerp(lugar(qa).y, lugar(qb).y, qk) * 0.95;
  const vira = (lugar(qb).x - lugar(qa).x) * Math.sin(Math.PI * qk) * 0.006; // inclina de leve na direção em que está indo
  // fundo: em vez do marrom chapado, a luz da própria foto que está passando (bem desfocada e escura), trocando em fusão
  const pos = clamp((camZ + 500) / DZ / Math.max(1, n - 1)) * (n - 1);
  const ia = Math.floor(pos), ib = Math.min(n - 1, ia + 1), mix = pos - ia;
  const luz = (id: string, op: number) => (
    <Img key={id} src={MINI(id)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(70px) brightness(0.5) saturate(1.5)', transform: `scale(${(1.35 + 0.1 * u).toFixed(3)})`, opacity: op}} />
  );
  return (
    <AbsoluteFill style={{background: FUNDO, perspective: 1100, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        {luz(ids[ia], 1)}
        {ib !== ia && luz(ids[ib], E.cam(mix))}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(10,9,8,0.15) 0%, rgba(10,9,8,0.78) 100%)'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 960, top: 540, transformStyle: 'preserve-3d', transform: `rotateY(${vira.toFixed(2)}deg) translate3d(${(-camX).toFixed(1)}px, ${(-camY).toFixed(1)}px, ${camZ.toFixed(1)}px)`}}>
        {ids.map((id, i) => {
          const z = -i * DZ - 700;
          const ef = z + camZ; // posição efetiva em relação à câmera
          if (ef > 1000 || ef < -3800) return null;
          const ultimo = i === n - 1;
          const {x, y, lado} = lugar(i);
          const rot = ultimo ? 0 : lado * (3 + hash(i, 13) * 6) * -1;
          const op = clamp((ef + 3800) / 900) * clamp((400 - ef) / 200); // cresce até ocupar boa parte do quadro e some antes de passar dele
          const w = ultimo ? 900 : 760;
          const mm = FM[id];
          const pw = (mm.o === 'h' ? w : w * 0.78) + 28, ph = (mm.o === 'h' ? w : w * 0.78) * (mm.h / mm.w) + 58; // tamanho real do polaroid: centraliza de verdade
          return (
            <div key={id} style={{position: 'absolute', left: 0, top: 0, opacity: op, transform: `translate3d(${(x - pw / 2).toFixed(1)}px, ${(y - ph / 2).toFixed(1)}px, ${z}px) rotateY(${rot}deg) rotateZ(${(rot * 0.25).toFixed(2)}deg)`}}>
              <Polaroid id={id} w={w} />
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- parede final: a câmera recua e revela todas as fotos juntas (infância + presente)
const recuoCentro = 1;
const Parede: React.FC<{ids: string[]; dur: number; foco?: string}> = ({ids, dur, foco}) => {
  const f = useCurrentFrame();
  const u = Math.min(1.15, Math.max(0, f / dur)); // passa de 1 durante a fusão para a câmera seguir andando
  const n = ids.length;
  const cols = Math.ceil(Math.sqrt(n * 1.9));
  const rows = Math.ceil(n / cols);
  const cw = 1000, ch = 750;
  const lista = React.useMemo(() => {
    const l = ids.filter((i) => i !== foco);
    const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
    const celulas: {x: number; y: number}[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) celulas.push({x: c - cx, y: r - cy});
    celulas.sort((a, b) => Math.abs(a.x) + Math.abs(a.y) - (Math.abs(b.x) + Math.abs(b.y)));
    const ordem = foco ? [foco, ...l] : l;
    const usadas = ordem.map((id, i) => ({id, ...celulas[i]}));
    // centraliza a parede no quadro (a grade nem sempre fecha simétrica)
    const xs = usadas.map((c) => c.x), ys = usadas.map((c) => c.y);
    const mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
    return usadas.map((c) => ({...c, x: c.x - mx * recuoCentro, y: c.y - my * recuoCentro}));
  }, [ids, foco, cols, rows]);
  // recuo com deriva contínua: a câmera nunca para (sem quadro congelado no fim)
  const recuo = E.cam(clamp(u / 0.8));
  const tz = lerp(520, -5600, recuo) - 700 * u;
  const rotY = lerp(0, -9, recuo) - 3 * u;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #2a2118 0%, #0e0d0b 100%)', perspective: 1300, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 960, top: 540, transformStyle: 'preserve-3d', transform: `translateZ(${tz.toFixed(1)}px) rotateY(${rotY.toFixed(2)}deg)`}}>
        {lista.map((c, i) => {
          const x = c.x * (cw + 24), y = c.y * (ch + 24);
          const z = -Math.abs(c.x) * 90 - Math.abs(c.y) * 30;
          return (
            <div key={c.id} style={{position: 'absolute', left: 0, top: 0, width: cw, height: ch, transform: `translate3d(${x - cw / 2}px, ${y - ch / 2}px, ${z}px)`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)', opacity: clamp(u * 6 - hash(i, 4) * 0.6 + 0.4)}}>
              <Img src={FOTO(c.id)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro(0.4)}} />
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: `rgba(14,13,11,${(0.42 + 0.22 * u).toFixed(3)})`}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cena final: TODAS as mídias; a câmera recua, elas formam um "3" (terceiro ano) e depois "231 e 232"
// Ideia do Vítor (14/11). As fotos são ladrilhos; os vídeos tocam mudos dentro dos seus ladrilhos (só o texto fala nessa parte).
// Os 74 vídeos vêm de UM arquivo (atlas.mp4, feito por trabalho/scripts/atlas_videos.py): extrai-se um quadro por quadro
// e cada ladrilho recorta a sua célula num canvas. 74 vídeos soltos estourariam a memória do render.
const AT = atlas as unknown as {cols: number; rows: number; cw: number; ch: number; pos: Record<string, number[]>};
const CW = 400, CH = 300, PX = 424, PY = 324;
const T_RECUO = 21.5, T_M1 = [21.5, 27.0], T_M2 = [33.0, 37.4]; // s dentro da cena: recuo, parede→3, 3→"231 e 232"
const caixa = (P: number[][]) => {
  const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  return {w: (Math.max(...xs) - Math.min(...xs) + 1) * PX, h: (Math.max(...ys) - Math.min(...ys) + 1) * PY};
};
const Tres: React.FC<{tiles: Tile[]; A: number[][]; B: number[][]; C: number[][]; dur: number}> = ({tiles, A, B, C, dur}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const telas = React.useRef<Record<string, HTMLCanvasElement | null>>({});
  const desenha = React.useCallback(
    (quadro: CanvasImageSource) => {
      for (const tl of tiles) {
        if (!tl.v) continue;
        const c = telas.current[tl.id];
        const p = AT.pos[tl.id];
        if (!c || !p) continue;
        c.getContext('2d')!.drawImage(quadro, p[0] * AT.cw, p[1] * AT.ch, AT.cw, AT.ch, 0, 0, AT.cw, AT.ch);
      }
    },
    [tiles],
  );
  const esc = React.useMemo(() => {
    const a = caixa(A), b = caixa(B), c = caixa(C);
    return {a: Math.min(1880 / a.w, 1040 / a.h), b: Math.min(1800 / b.w, 800 / b.h), c: Math.min(1760 / c.w, 600 / c.h)};
  }, [A, B, C]);
  const k0 = E.cam(clamp(t / T_RECUO));
  const k1 = E.cam(clamp((t - T_M1[0]) / (T_M1[1] - T_M1[0])));
  const k2 = E.cam(clamp((t - T_M2[0]) / (T_M2[1] - T_M2[0])));
  const ln = lerp(lerp(lerp(Math.log(4.9), Math.log(esc.a), k0), Math.log(esc.b), k1), Math.log(esc.c), k2);
  const S = Math.exp(ln) * (1 - 0.0025 * Math.max(0, t - T_RECUO)); // depois do recuo a câmera continua se afastando bem devagar
  const oy = lerp(lerp(0, -70, k1), -40, k2);
  const fim = dur / FPS;
  return (
    <AbsoluteFill style={{background: '#0b0a09', overflow: 'hidden', opacity: clamp(f / 10)}}>
      <OffthreadVideo src={staticFile('final/atlas.mp4')} muted onVideoFrame={desenha} style={{position: 'absolute', left: 0, top: 0, width: 8, height: 8, opacity: 0}} />
      <AbsoluteFill style={{filter: filtro(0.4), overflow: 'hidden'}}>
        {/* cada ladrilho já vai na posição e no tamanho de tela (escala por ladrilho): com a escala no contêiner, o navegador não desenhava o que ficava muito longe da origem */}
        <div style={{position: 'absolute', left: 960, top: 540 + oy}}>
          {tiles.map((tl, i) => {
            const d = hash(i, 7) * 1.6;
            const ka = E.cam(clamp((t - T_M1[0] - d) / (T_M1[1] - T_M1[0] - 1.6)));
            const kb = E.cam(clamp((t - T_M2[0] - d * 0.8) / (T_M2[1] - T_M2[0] - 1.3)));
            const x = lerp(lerp(A[i][0], B[i][0], ka), C[i][0], kb) * PX;
            const y = lerp(lerp(A[i][1], B[i][1], ka), C[i][1], kb) * PY;
            if (Math.abs(x * S) > 960 + CW * S || Math.abs(y * S + oy) > 540 + CH * S) return null; // fora do quadro
            const giro = (hash(i, 11) - 0.5) * 50 * (Math.sin(Math.PI * ka) + Math.sin(Math.PI * kb));
            return (
              <div key={tl.id} style={{position: 'absolute', left: 0, top: 0, width: CW, height: CH, overflow: 'hidden', transformOrigin: '0 0', transform: `translate(${((x - CW / 2) * S).toFixed(2)}px, ${((y - CH / 2) * S).toFixed(2)}px) scale(${S.toFixed(5)}) rotate(${giro.toFixed(2)}deg)`}}>
                {tl.v ? (
                  <canvas ref={(el) => { telas.current[tl.id] = el; }} width={AT.cw} height={AT.ch} style={{width: '100%', height: '100%', display: 'block'}} />
                ) : (
                  <Img src={i < 9 ? FOTO(tl.id) : MINI(tl.id)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: i < 9 ? enquadra(tl.id, CW, CH).pos : undefined, display: 'block'}} />
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(11,10,9,${(0.34 * (1 - k1) * clamp(t / 2.5)).toFixed(3)})`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: clamp((t - (fim - 1.9)) / 1.7)}} />
    </AbsoluteFill>
  );
};

const FUSAO_FINAL = 40; // quadros de fusão da parede para a foto final
const FinalFoto: React.FC<{id: string; dur: number}> = ({id, dur}) => {
  const f = useCurrentFrame();
  const t = f / dur;
  const apaga = clamp((f - (dur - s(3.2))) / s(3.2));
  return (
    <AbsoluteFill style={{background: FUNDO, opacity: clamp(f / FUSAO_FINAL)}}>
      <Lembranca i={0.5}>
        <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${(1.02 + 0.05 * t).toFixed(4)})`, filter: filtro(0.4)}} />
      </Lembranca>
      <AbsoluteFill style={{background: 'rgba(8,7,6,0.62)'}} />
      <AbsoluteFill style={{background: '#000', opacity: apaga}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- passagem do tempo (ponte da infância para agora)
// Sem anos escritos: as fotos não têm data real, então a ponte é só a sensação de tempo passando
// (o quadro escurece devagar e clareia de novo, sem texto).
const Ponte: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const u = clamp(f / dur);
  const meio = 1 - Math.abs(2 * u - 1);
  return <AbsoluteFill style={{background: `rgba(14,13,11,${(0.12 + 0.38 * E.cam(meio)).toFixed(3)})`, pointerEvents: 'none'}} />;
};

// ---------------------------------------------------------------- letra e textos
const LETRA = plano.letra as {a: number; b: number; p: string[]; t: number[]; grande?: number}[];
const Letra: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let L: (typeof LETRA)[number] | undefined;
  for (const l of LETRA) if (t >= l.a - 0.05 && t < l.b + 0.45) L = l;
  if (!L) return null;
  const sai = clamp((t - L.b) / 0.4);
  const grande = L.grande != null;
  const size = L.grande === 9 ? 150 : grande ? 100 + (L.grande ?? 0) * 10 : 84;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: grande ? 770 : 900, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: size, color: CREME, lineHeight: 1, whiteSpace: 'nowrap', textShadow: SOMBRA_TXT, opacity: 1 - sai, transform: `translateY(${(-14 * sai).toFixed(1)}px)`, pointerEvents: 'none'}}>
      {L.p.map((p, i) => {
        const k = approach(f, s(L!.t[i] ?? L!.a), 0, 1, 0.2);
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: k, transform: `translateY(${((1 - k) * 0.35 * size).toFixed(1)}px)`}}>{p}</span>
        );
      })}
    </div>
  );
};

type Fecho = {a: number; b: number; l: string[]; fonte?: string; grande?: boolean; pequeno?: boolean; final?: boolean; baixo?: boolean};
const FECHO = plano.fecho as Fecho[];
const TextosFecho: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const F = FECHO.find((x) => t >= x.a - 0.1 && t < x.b + 0.1);
  if (!F) return null;
  const k = Math.min(clamp((t - F.a) / 0.7), clamp((F.b - t) / (F.final ? 1.4 : 0.7)));
  const size = F.grande ? 130 : F.pequeno ? 52 : F.baixo ? 84 : 66;
  if (F.baixo)
    // embaixo, sem cobrir o "3" nem o "231 e 232" formados pelas mídias
    return (
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', opacity: k, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(8,7,6,0) 78%, rgba(8,7,6,0.7) 100%)'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: size, color: CREME, lineHeight: 1, textShadow: SOMBRA_TXT, marginBottom: F.pequeno ? 70 : 44, filter: `blur(${((1 - k) * 8).toFixed(1)}px)`}}>{F.l[0]}</div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: k, pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 45% at 50% 50%, rgba(8,7,6,0.62) 0%, rgba(8,7,6,0) 100%)'}}>
      <div style={{textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: size, color: CREME, lineHeight: 1.18, textShadow: SOMBRA_TXT, padding: '0 140px', filter: `blur(${((1 - k) * 8).toFixed(1)}px)`}}>
        {F.l.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        {F.fonte && <div style={{fontFamily: "'Inter', sans-serif", fontStyle: 'normal', fontWeight: 500, fontSize: 28, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7, marginTop: 28}}>{F.fonte}</div>}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- música com ducking (−12 dB sob os vídeos com som)
const DUCK = plano.duck as number[][];
const volMusica = (f: number) => {
  const t = f / FPS;
  let v = 1;
  for (const [a, b, fator = 0.25] of DUCK) {
    const entra = clamp((t - (a - 0.25)) / 0.25);
    const sai = 1 - clamp((t - b) / 0.5);
    const k = Math.min(entra, sai);
    v = Math.min(v, 1 - (1 - fator) * k); // solo 0,25 ≈ −12 dB; mosaico 0,5 ≈ −6 dB
  }
  return v;
};

// passagem contínua só entre fotos com tempo para isso (a rajada de "selvagem" continua em corte seco com clarão: é o ritmo dela)
const continua = (b?: Bloco) => !!b && (b.k === 'foto' || b.k === 'dupla') && !b.flash && s(b.t1) - s(b.t0) >= 30;
const PASS: Passagem[] = BLOCOS.map(() => ({}));
BLOCOS.forEach((b, i) => {
  const ant = BLOCOS[i - 1];
  if (i > 0 && continua(b) && continua(ant) && Math.abs(ant.t1 - b.t0) < 0.01) {
    const T = Math.min(14, Math.floor(0.3 * Math.min(s(b.t1) - s(b.t0), s(ant.t1) - s(ant.t0))));
    PASS[i].entra = T;
    PASS[i - 1].cauda = T;
  }
});

const Bloco: React.FC<{b: Bloco; pass: Passagem}> = ({b, pass}) => {
  const dur = s(b.t1) - s(b.t0);
  switch (b.k) {
    case 'foto':
      return <FotoCheia id={b.id!} dur={dur} bloom={b.bloom} flash={b.flash} {...pass} />;
    case 'vhs':
      return <FotoCheia id={b.id!} dur={dur} bloom={0.2} vhs />;
    case 'dupla':
      return <Dupla ids={b.ids!} dur={dur} bloom={b.bloom} {...pass} />;
    case 'tres':
      return <Tres tiles={b.tiles!} A={b.A!} B={b.B!} C={b.C!} dur={dur} />;
    case 'portal':
      return <Portal id={b.id!} dur={dur} />;
    case 'solo':
      return <Solo id={b.id!} dur={dur} abraco={b.abraco} />;
    case 'mosaico':
      return <Mosaico ids={b.ids!} dur={dur} />;
    case 'grade':
      return <Grade ids={b.ids!} dur={dur} />;
    case 'mural':
      return <Mural ids={b.ids!} dur={dur} voo={b.voo ?? 0} />;
    case 'parede':
      return <Parede ids={b.ids!} dur={dur} foco={b.foco} />;
    case 'final':
      return <FinalFoto id={b.id!} dur={dur} />;
    case 'ponte':
      return <Ponte dur={dur} />;
    default:
      return null;
  }
};

export const Final: React.FC = () => {
  useFontes();
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      <Audio src={staticFile('final/tempo-perdido.mp3')} volume={volMusica} />
      <IntroTV />
      {BLOCOS.map((b, i) =>
        b.k === 'intro' ? null : (
          <Sequence key={i} from={s(b.t0)} durationInFrames={Math.max(1, s(b.t1) - s(b.t0)) + (b.k === 'parede' ? FUSAO_FINAL : 0) + (PASS[i].cauda ?? 0)} layout="none">
            <Bloco b={b} pass={PASS[i]} />
          </Sequence>
        ),
      )}
      <Letra />
      <TextosFecho />
      <Grao />
    </AbsoluteFill>
  );
};
