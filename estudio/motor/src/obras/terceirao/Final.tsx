// Meu Terceirão · FINAL (Tempo Perdido inteira, 302 s, 1920x1080, 30 fps)
// Plano: memoria/meu-terceirao-plano-final.md · linha do tempo: plano.json (gerada por trabalho/scripts/montar_final.py)
// Assets: public/final/p (fotos), public/final/v (vídeos), public/final/tempo-perdido.mp3
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {approach, clamp, E, hash, lerp} from '../../kit';
import {IntroTV, Lembranca, useFontes} from './Terceirao';
import plano from './plano.json';
import acervo from './acervo.json';

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

type Bloco = {k: string; t0: number; t1: number; id?: string; ids?: string[]; bloom?: number; flash?: boolean; voo?: number; foco?: string; abraco?: boolean};
const BLOCOS = plano.blocos as Bloco[];

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
const FotoCheia: React.FC<{id: string; dur: number; bloom?: number; flash?: boolean; vhs?: boolean}> = ({id, dur, bloom = 0, flash, vhs}) => {
  const f = useCurrentFrame();
  const m = FM[id];
  const t = f / Math.max(1, dur);
  const sc = 1 + 0.07 * t + 0.035 * (1 - clamp(f / 6));
  const dx = (hash(id.length + id.charCodeAt(id.length - 1), 3) - 0.5) * 40 * t;
  const miolo =
    m.o === 'h' ? (
      <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc.toFixed(4)}) translateX(${dx.toFixed(1)}px)`, filter: filtro(0.4)}} />
    ) : (
      <AbsoluteFill style={{background: FUNDO}}>
        <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(46px) brightness(0.55) ${filtro(0.4)}`, transform: 'scale(1.25)'}} />
        <Img src={FOTO(id)} style={{position: 'absolute', left: '50%', top: 0, height: '100%', width: 'auto', transform: `translateX(-50%) scale(${sc.toFixed(4)})`, boxShadow: '0 0 80px rgba(0,0,0,0.6)', filter: filtro(0.4)}} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: FUNDO}}>
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
const Dupla: React.FC<{ids: string[]; dur: number; bloom?: number}> = ({ids, dur, bloom = 0}) => {
  const f = useCurrentFrame();
  const t = f / Math.max(1, dur);
  const lado = (id: string, esq: boolean) => (
    <div style={{position: 'absolute', left: esq ? 0 : '50.2%', top: 0, width: '49.8%', height: '100%', overflow: 'hidden'}}>
      <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${(1 + 0.06 * (esq ? t : 1 - t) + 0.03 * (1 - clamp(f / 6))).toFixed(4)})`, filter: filtro(0.4)}} />
    </div>
  );
  return (
    <AbsoluteFill style={{background: FUNDO}}>
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
            <Img src={FOTO(id)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro(0.4), transform: `scale(${(1 + (0.09 * f) / Math.max(1, dur)).toFixed(4)})`}} />
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
  const sway = Math.sin(u * Math.PI * 2 + voo) * 90;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #2a2118 0%, #0e0d0b 100%)', perspective: 1100, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 960, top: 540, transformStyle: 'preserve-3d', transform: `translate3d(${(-sway).toFixed(1)}px, ${(Math.cos(u * 4 + voo) * 30).toFixed(1)}px, ${camZ.toFixed(1)}px) rotateY(${(sway * 0.03).toFixed(2)}deg)`}}>
        {ids.map((id, i) => {
          const z = -i * DZ - 700;
          const ef = z + camZ; // posição efetiva em relação à câmera
          if (ef > 1000 || ef < -3800) return null;
          const ultimo = i === n - 1;
          const lado = i % 2 === 0 ? -1 : 1;
          const x = ultimo ? 0 : lado * (330 + hash(i, 5 + voo) * 260);
          const y = ultimo ? 0 : (hash(i, 9 + voo) - 0.5) * 380;
          const rot = ultimo ? 0 : lado * (4 + hash(i, 13) * 10) * -1;
          const op = clamp((ef + 3800) / 900) * clamp((950 - ef) / 450);
          const w = ultimo ? 900 : 640;
          return (
            <div key={id} style={{position: 'absolute', left: 0, top: 0, opacity: op, transform: `translate3d(${x - w / 2}px, ${y - w * 0.37}px, ${z}px) rotateY(${rot}deg) rotateZ(${(rot * 0.25).toFixed(2)}deg)`}}>
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

type Fecho = {a: number; b: number; l: string[]; fonte?: string; grande?: boolean; pequeno?: boolean; final?: boolean};
const FECHO = plano.fecho as Fecho[];
const TextosFecho: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const F = FECHO.find((x) => t >= x.a - 0.1 && t < x.b + 0.1);
  if (!F) return null;
  const k = Math.min(clamp((t - F.a) / 0.7), clamp((F.b - t) / (F.final ? 1.4 : 0.7)));
  const size = F.grande ? 130 : F.pequeno ? 60 : 66;
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

const Bloco: React.FC<{b: Bloco}> = ({b}) => {
  const dur = s(b.t1) - s(b.t0);
  switch (b.k) {
    case 'foto':
      return <FotoCheia id={b.id!} dur={dur} bloom={b.bloom} flash={b.flash} />;
    case 'vhs':
      return <FotoCheia id={b.id!} dur={dur} bloom={0.2} vhs />;
    case 'dupla':
      return <Dupla ids={b.ids!} dur={dur} bloom={b.bloom} />;
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
      {BLOCOS.filter((b) => b.k !== 'intro').map((b, i) => (
        <Sequence key={i} from={s(b.t0)} durationInFrames={Math.max(1, s(b.t1) - s(b.t0)) + (b.k === 'parede' ? FUSAO_FINAL : 0)} layout="none">
          <Bloco b={b} />
        </Sequence>
      ))}
      <Letra />
      <TextosFecho />
      <Grao />
    </AbsoluteFill>
  );
};
