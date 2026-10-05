import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, E, FILTRO, approach, arrive, clamp, f, tween} from '../lib';
import {Kinetic, Photo, SERIF, TypeTag} from '../kit';
import words from '../../public/words.json';

const W = words as {w: string; s: number; e: number}[];
const wAt = (txt: string, after: number) => W.find((w) => w.w.startsWith(txt) && w.s >= after)!.s;

// Ano gigante (mesma peça para 1850 e 1888)
const Ano: React.FC<{txt: string; size?: number; color?: string; blur?: number; style?: React.CSSProperties}> = ({txt, size = 300, color = C.papel, blur = 0, style}) => (
  <div
    style={{
      fontFamily: SERIF, fontWeight: 700, fontSize: size, color, lineHeight: 1, letterSpacing: '0.01em',
      fontVariantNumeric: 'lining-nums tabular-nums', filter: blur > 0.3 ? `url(#vblur${Math.round(Math.min(blur, 30))})` : undefined,
      textShadow: '0 6px 30px rgba(0,0,0,0.5)', ...style,
    }}
  >
    {txt}
  </div>
);

// Filtros SVG de borrão vertical (movimento vertical rápido): 0..30
export const VBlurDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    {Array.from({length: 31}).map((_, i) => (
      <filter key={i} id={`vblur${i}`} x="-10%" y="-50%" width="120%" height="200%">
        <feGaussianBlur stdDeviation={`0 ${i}`} />
      </filter>
    ))}
  </svg>
);

// 40,55-46,0 · "Para entender como chegamos aqui" → rebobinar 2026 → 1850 (a cor escorre para sépia)
const PILHA = ['fotos/favela-hoje.jpg', 'fotos/rua-alagada.jpg', 'fotos/lixo.jpg', 'fotos/mesmas-casas.jpg', 'fotos/missa-1888.jpg', 'fotos/escravizados.jpg', 'fotos/fazenda.jpg'];
export const Rebobina: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (frame < f(40.55) || frame >= f(47.6)) return null;
  const a = 43.1, b = 46.0; // "voltar" → "1850"
  const p = E.camera(clamp((t - a) / (b - a)));
  const dp = (E.camera(clamp((t + 1 / 30 - a) / (b - a))) - p) * 30; // velocidade
  const ano = Math.round(2026 - 176 * p);
  const scroll = p * (PILHA.length - 1) * 1080;
  const vblur = Math.min(30, dp * 22);
  const sat = 1 - p;
  const anoIn = arrive(frame, f(42.6), 0.14);
  const anoSize = tween(frame, f(46.0), f(46.35), 300, 330, E.saida) - tween(frame, f(46.35), f(47.2), 0, 30, E.expressiva);
  const sai = clamp((t - 47.2) / 0.35);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: `brightness(${0.62 - 0.12 * Math.sin(Math.PI * p)}) url(#vblur${Math.round(vblur)})`}}>
        {PILHA.map((src, i) => (
          <AbsoluteFill key={i} style={{transform: `translateY(${scroll - i * 1080}px)`}}>
            <Photo
              src={src} from={f(40.55)} zoom0={1.04} zoomRate={0.012}
              filter={`saturate(${0.2 + 0.55 * sat}) sepia(${0.25 + 0.45 * p}) contrast(1.1) brightness(0.9)`}
            />
          </AbsoluteFill>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: anoIn * (1 - sai)}}>
        <Ano txt={String(ano)} size={anoSize} blur={Math.min(30, dp * 9)} color={t >= b ? C.papel : C.papel} />
        <div style={{width: 520 * arrive(frame, f(46.05), 0.16), height: 4, background: C.vermelho, marginTop: 18}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 47,2-56,35 · Lei de Terras: o texto real do Art. 1º composto num papel (não há fac-símile livre da lei),
// etiqueta de máquina, câmera aproxima e "compra" é circulado à mão.
export const Lei1850: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (frame < f(47.2) || frame >= f(56.35)) return null;
  const entra = arrive(frame, f(47.2), 0.12);
  const zoom = tween(frame, f(51.4), f(53.6), 1, 1.55, E.camera) * (1 + 0.0008 * (frame - f(47.2)));
  const oy = tween(frame, f(51.4), f(53.6), 0, 150, E.camera);
  const circ = E.entrada(clamp((t - (wAt('compra', 55) + 0.15)) / 0.5));
  const artIn = arrive(frame, f(49.9), 0.14);
  const L = 1150;
  return (
    <AbsoluteFill style={{background: C.fundo, overflow: 'hidden', backgroundImage: `url(${staticFile('papel.png')})`, backgroundBlendMode: 'soft-light'}}>
      <AbsoluteFill style={{transform: `translateY(${-oy}px) scale(${zoom})`, transformOrigin: '50% 62%'}}>
        <div
          style={{
            position: 'absolute', left: 960 - 560, top: 110, width: 1120, height: 860, opacity: entra,
            transform: `translateY(${(1 - entra) * 60}px) rotate(-1.2deg)`, boxShadow: '0 30px 80px rgba(0,0,0,.7)',
            background: '#E2D5BA', padding: '90px 110px', color: '#2B1F18', fontFamily: SERIF,
          }}
        >
          <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('papel.png')})`, opacity: 0.16, mixBlendMode: 'multiply'}} />
          <div style={{textAlign: 'center', fontWeight: 700, fontSize: 40, letterSpacing: '0.08em'}}>LEI Nº 601, DE 18 DE SETEMBRO DE 1850</div>
          <div style={{textAlign: 'center', fontStyle: 'italic', fontWeight: 500, fontSize: 32, marginTop: 18, opacity: 0.85}}>
            Dispõe sobre as terras devolutas do Imperio.
          </div>
          <div style={{width: 200, height: 2, background: '#2B1F18', opacity: 0.5, margin: '44px auto'}} />
          <div style={{fontWeight: 600, fontSize: 60, lineHeight: 1.32, opacity: artIn, transform: `translateY(${(1 - artIn) * 20}px)`}}>
            Art. 1º Ficam prohibidas as acquisições de terras devolutas por outro titulo que não seja o de{' '}
            <span style={{position: 'relative', display: 'inline-block'}}>
              compra.
              <svg width={300} height={130} style={{position: 'absolute', left: -38, top: -22, overflow: 'visible'}}>
                <path
                  d="M 150 8 C 260 4, 300 40, 285 70 C 268 108, 150 118, 70 108 C 10 100, -5 60, 30 32 C 60 10, 130 2, 185 10"
                  fill="none" stroke={C.vermelho} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${L * circ} ${L + 10}`}
                />
              </svg>
            </span>
          </div>
        </div>
      </AbsoluteFill>
      <TypeTag text="LEI DE TERRAS · 1850" start={f(48.0)} x={140} y={80} size={40} cps={22} end={f(51.3)} />
    </AbsoluteFill>
  );
};

// 56,35-62,05 · tela dividida: quem tinha dinheiro comprou | quem era escravizado não tinha nada
export const Divisao: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (frame < f(56.35) || frame >= f(62.05)) return null;
  const esq = approach(frame, f(56.35), -300, 0, 0.13);
  const dirOn = frame >= f(58.05);
  const dir = approach(frame, f(58.05), 980, 0, 0.13);
  const linha = arrive(frame, f(58.3), 0.12);
  const apaga = tween(frame, f(60.2), f(61.0), 1, 0.45, E.produtiva);
  const fim = clamp((t - 61.75) / 0.3);
  return (
    <AbsoluteFill style={{background: '#000', opacity: 1 - fim}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: dirOn ? approach(frame, f(58.05), 1920, 960, 0.13) : 1920, height: 1080, overflow: 'hidden', transform: `translateX(${esq}px)`, filter: `brightness(${apaga})`}}>
        <Photo src="fotos/fazenda.jpg" from={f(56.35)} filter="arquivo" zoom0={1.06} zoomRate={0.012} />
        <TypeTag text="COMPROU." start={f(57.55)} x={90} y={130} size={48} />
      </div>
      {dirOn && (
        <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, overflow: 'hidden', transform: `translateX(${dir}px)`}}>
          <Photo src="fotos/escravizados.jpg" from={f(58.05)} filter="arquivo" zoom0={1.06} zoomRate={0.02} />
          <TypeTag text="NADA." start={f(59.9)} x={90} y={130} size={48} />
        </div>
      )}
      <div style={{position: 'absolute', left: 958, top: 540 - 540 * linha, width: 5, height: 1080 * linha, background: C.vermelho}} />
    </AbsoluteFill>
  );
};

// 62,05-73,0 · 1888: ano, Lei Áurea, pilha "SEM ...", multidão de 1888, o papel
export const Abolicao: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (frame < f(62.05) || frame >= f(73.0)) return null;
  const anoP = arrive(frame, f(62.12), 0.2);
  const anoSai = tween(frame, f(62.95), f(63.5), 0, 1, E.expressiva);
  const docIn = clamp((t - 62.9) / 0.5);
  const escurece = tween(frame, f(64.0), f(64.4), 1, 0.38, E.produtiva);
  const pilhaSai = tween(frame, f(68.35), f(68.9), 0, 1, E.saida);
  const multidao = t >= 68.4;
  const recua = tween(frame, f(68.4), f(70.9), 2.1, 1.02, E.expressiva);
  const papel = t >= 70.9;
  const linhas = [
    {sem: wAt('Sem', 64), x: wAt('terra', 64), txt: 'TERRA.'},
    {sem: wAt('sem', 65), x: wAt('indeniza', 65), txt: 'INDENIZAÇÃO.'},
    {sem: wAt('sem', 66.3), x: wAt('casa', 66.3), txt: 'CASA.'},
    {sem: wAt('sem', 67.5), x: wAt('plano', 67.5), txt: 'PLANO.'},
  ];
  return (
    <AbsoluteFill style={{background: C.fundo, overflow: 'hidden'}}>
      {!multidao && (
        <AbsoluteFill style={{opacity: docIn, filter: `brightness(${escurece})`}}>
          <Photo src="fotos/lei-aurea.jpg" from={f(62.9)} filter="arquivo" zoom0={1.1} zoomRate={0.02} />
        </AbsoluteFill>
      )}
      {multidao && !papel && (
        <AbsoluteFill style={{transform: `scale(${recua})`}}>
          <Photo src="fotos/missa-1888.jpg" from={f(68.4)} filter="arquivo" zoom0={1} zoomRate={0} />
        </AbsoluteFill>
      )}
      {papel && <Photo src="fotos/lei-aurea-assinatura.jpg" from={f(70.9)} filter="arquivo" zoom0={1.15} zoomRate={0.035} />}
      {t < 63.6 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: `rgba(21,17,14,${1 - docIn * 0.4})`}}>
          <div style={{transform: `translateY(${(1 - anoP) * 60 - anoSai * 420}px) scale(${1 - 0.6 * anoSai})`, opacity: anoP}}>
            <Ano txt="1888" size={330} />
          </div>
        </AbsoluteFill>
      )}
      <TypeTag text="LEI Nº 3.353 · 13 DE MAIO DE 1888" start={f(63.1)} x={140} y={90} size={40} cps={24} end={f(68.3)} />
      {t >= 64.1 && t < 68.95 && (
        <div style={{position: 'absolute', left: 170, top: 250, opacity: 1 - pilhaSai, transform: `translateY(${-pilhaSai * 60}px)`}}>
          {linhas.map((l, i) => {
            const p1 = arrive(frame, f(l.sem), 0.2), p2 = arrive(frame, f(l.x), 0.2);
            return (
              <div key={i} style={{display: 'flex', gap: 34, fontFamily: SERIF, fontWeight: 700, fontSize: 112, lineHeight: 1.12, overflow: 'hidden'}}>
                <span style={{color: C.terracota, opacity: t >= l.sem ? 1 : 0, transform: `translateY(${(1 - p1) * 110}px)`}}>SEM</span>
                <span style={{color: C.papel, opacity: t >= l.x ? 1 : 0, transform: `translateY(${(1 - p2) * 110}px)`}}>{l.txt}</span>
              </div>
            );
          })}
        </div>
      )}
      {multidao && !papel && <TypeTag text="RIO DE JANEIRO · 17 DE MAIO DE 1888" start={f(68.9)} x={140} y={90} size={40} cps={24} />}
    </AbsoluteFill>
  );
};

// 73,0-75,7 · silêncio em preto e "Na prática, não."
export const NaPratica: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(73.0) || frame >= f(75.75)) return null;
  const ws = W.filter((w) => w.s >= 73.8 && w.s < 75.5).map((w) => ({w: w.w, s: f(w.s)}));
  return (
    <AbsoluteFill style={{background: '#0B0908'}}>
      <Kinetic words={ws} accent={['não.']} size={130} y={540} end={f(75.55)} />
    </AbsoluteFill>
  );
};

// 75,75-fim · Morro da Favella (1920) → entra na foto → a favela hoje, em cor
export const Hoje: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (frame < f(75.75)) return null;
  const tr = 77.62; // "até os dias atuais" começa 77,84
  const zoomIn = t < tr ? 1.02 + 0.012 * (t - 75.75) : 1.02 + 0.012 * (tr - 75.75) + Math.pow(clamp((t - tr) / 0.55), 2.2) * 2.4;
  const mix = E.expressiva(clamp((t - tr - 0.2) / 0.5));
  const fim = clamp((t - 81.25) / 0.5);
  const entra = arrive(frame, f(75.75), 0.14);
  return (
    <AbsoluteFill style={{background: '#000', opacity: 1 - fim}}>
      {mix < 1 && (
        <AbsoluteFill style={{transform: `scale(${zoomIn})`, opacity: entra}}>
          <Photo src="fotos/providencia-1920.jpg" from={f(75.75)} filter="grayscale(1) sepia(0.45) contrast(1.05) brightness(1.12)" zoom0={1} zoomRate={0} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{opacity: mix, transform: `scale(${1.25 - 0.2 * mix})`}}>
        <Photo src="fotos/favela-hoje.jpg" from={f(tr)} filter="cor" zoom0={1} zoomRate={0.012} />
      </AbsoluteFill>
      {t < tr + 0.1 && <TypeTag text="MORRO DA FAVELLA, RIO · 1920" start={f(76.0)} x={140} y={90} size={40} cps={24} end={f(tr - 0.1)} />}
      <TypeTag text="MORRO DA PROVIDÊNCIA · HOJE" start={f(78.5)} x={140} y={90} size={40} cps={24} />
    </AbsoluteFill>
  );
};
