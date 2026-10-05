// PARTE 3 · Cainã Farias (geografia: território, poder, segregação, números do IBGE).
// Relógio: public/p3/words.json. Vitrines: a planta da cidade (14,9-28,7) e os números (48,9-63,6).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, E, FILTRO, approach, arrive, clamp, f, rand, tween} from '../lib';
import {Grain, Kinetic, NameTape, Photo, SERIF, TYPE, TypeTag, useFonts} from '../kit';
import {Alfinete, Contador, Isolinhas, Lampejo, Painel, Selo, TituloConceito, Traco, palavras, tremido} from '../kit2';
import {Caption} from '../Caption';
import {CUES} from './captions';
import words from '../../public/p3/words.json';
import dados from './brasil-data.json';

export const DURACAO_P3 = 70.6;
const W = words as {w: string; s: number; e: number}[];

// ---------------------------------------------------------------- 0-9,2 · o mapa que se desenha
const LINHAS_MAPA = [
  'M 260 180 C 420 260, 520 330, 610 470 S 760 720, 900 860',
  'M 610 470 C 820 430, 1030 470, 1240 400 S 1560 330, 1700 380',
  'M 900 860 C 1100 780, 1300 760, 1500 820',
  'M 1240 400 C 1260 560, 1330 680, 1500 820 S 1640 940, 1760 1000',
  'M 420 700 C 520 660, 560 610, 610 470',
];
const MapaDesenho: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= f(9.25)) return null;
  const cam = tween(frame, 0, f(9.25), 1.0, 1.16, E.camera);
  const entra = arrive(frame, 2, 0.08);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${cam}) rotate(${-1 + 1 * (frame / f(9.25))}deg)`, transformOrigin: '52% 48%', opacity: entra}}>
        <Img src={staticFile('fotos/mapa-antigo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: FILTRO.arquivo}} />
        <AbsoluteFill style={{backgroundImage: `url(${staticFile('papel.png')})`, backgroundSize: 'cover', mixBlendMode: 'overlay', opacity: 0.16}} />
        <AbsoluteFill style={{background: 'rgba(12,8,6,0.38)'}} />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {LINHAS_MAPA.map((d, i) => (
            <Traco key={i} d={d} start={f(0.5) + i * 9} dur={22} cor={C.terracota} w={5} len={1600} />
          ))}
          <Alfinete x={1240} y={400} start={f(7.62)} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,0,0,0.55), rgba(0,0,0,0) 100%)', opacity: 1 - clamp((frame - f(3.2)) / 8)}} />
      <Kinetic words={palavras(W, 0, 3)} size={92} y={540} end={f(3.25)} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 9,2-14,9 · território: poder e disputa
const Territorio: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(9.2) || frame >= f(14.9)) return null;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Photo src="fotos/contraste-aereo.jpg" from={f(9.2)} zoom0={1.04} zoomRate={0.016} filter="atual" />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Traco d="M 1010 -20 C 980 200, 1060 380, 990 560 S 930 900, 1000 1100" start={f(12.3)} dur={16} cor={C.terracota} w={6} len={1300} />
      </svg>
      <TypeTag text="PODER" start={f(13.5)} x={560} y={200} size={46} cps={22} />
      <TypeTag text="DISPUTA" start={f(13.98)} x={1120} y={250} size={46} cps={22} rot={1.2} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 14,9-28,75 · a planta da cidade (vitrine 1)
const rioY = (x: number) => 1010 - (x - 640) * 0.26 + 26 * Math.sin(x / 170);
type Q = {pts: string; cx: number; cy: number; tipo: 'rico' | 'bairro' | 'comum'};
const QUADRAS: Q[] = (() => {
  const out: Q[] = [];
  const CW = 118, CH = 104;
  for (let i = 0; i < 18; i++)
    for (let j = 0; j < 12; j++) {
      const jit = (k: number) => (rand(i * 31 + j * 7 + k) - 0.5) * 22;
      const x0 = -60 + i * CW + jit(1), y0 = -40 + j * CH + jit(2);
      const cx = x0 + CW / 2, cy = y0 + CH / 2;
      const dr = cy - rioY(cx);
      if (Math.abs(dr) < 64) continue; // o rio passa aqui
      const g = 10;
      const pts = [[x0 + g, y0 + g], [x0 + CW - g + jit(3) * 0.3, y0 + g], [x0 + CW - g, y0 + CH - g + jit(4) * 0.3], [x0 + g + jit(5) * 0.3, y0 + CH - g]]
        .map((p) => p.join(',')).join(' ');
      const tipo = cx < 900 && cy < 640 ? 'rico' : cx > 1130 && cx < 1880 && dr < 0 && dr > -250 ? 'bairro' : 'comum';
      out.push({pts, cx, cy, tipo});
    }
  return out;
})();
const RIO = (() => {
  const p: string[] = [];
  for (let x = 560; x <= 2000; x += 24) p.push(`${x === 560 ? 'M' : 'L'} ${x} ${rioY(x).toFixed(1)}`);
  return p.join(' ');
})();
const ESGOTO = 'M 330 250 C 520 360, 700 420, 880 560 S 1180 700, 1330 760 S 1440 820, 1470 858';
const ASFALTO = 'M -60 430 C 200 400, 420 380, 640 400 S 960 470, 1150 500';
const TERRA = 'M 1150 500 C 1260 540, 1330 600, 1400 660 S 1500 720, 1560 760';
// câmera: quadros-chave (s, centro x, centro y, escala)
const CAM: [number, number, number, number][] = [
  [14.9, 960, 540, 1.0], [16.2, 1250, 640, 1.14], [17.5, 1480, 640, 1.16], [18.9, 960, 560, 0.98], [20.5, 780, 470, 1.1],
  [21.9, 1180, 560, 1.3], [24.4, 1180, 560, 1.36], [25.2, 960, 520, 0.94], [28.7, 960, 520, 0.9],
];
const camara = (frame: number) => {
  const t = frame / 30;
  let k = 0;
  while (k < CAM.length - 1 && t >= CAM[k + 1][0]) k++;
  const a = CAM[k], b = CAM[Math.min(k + 1, CAM.length - 1)];
  const p = b === a ? 1 : E.camera(clamp((t - a[0]) / Math.min(1.1, b[0] - a[0])));
  return {x: a[1] + (b[1] - a[1]) * p, y: a[2] + (b[2] - a[2]) * p, s: a[3] + (b[3] - a[3]) * p};
};
const Planta: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(14.9) || frame >= f(28.75)) return null;
  const cam = camara(frame);
  const entra = arrive(frame, f(14.9), 0.1);
  const bairroP = clamp((frame - f(27.67)) / 12);
  const esg = E.produtiva(clamp((frame - f(19.1)) / 30));
  const asf = E.produtiva(clamp((frame - f(20.6)) / 30));
  const flow = (frame % 30) * 2;
  return (
    <AbsoluteFill style={{background: '#16110E', opacity: entra}}>
      <AbsoluteFill style={{transform: `translate(${960 - cam.x * cam.s}px, ${540 - cam.y * cam.s}px) scale(${cam.s})`, transformOrigin: '0 0'}}>
        <svg width={1920} height={1080} style={{overflow: 'visible'}}>
          {QUADRAS.map((q, i) => (
            <polygon key={i} points={q.pts}
              fill={q.tipo === 'bairro' && bairroP > 0 ? C.vermelho : q.tipo === 'rico' ? '#3A2F27' : '#2A211B'}
              fillOpacity={q.tipo === 'bairro' ? 0.55 + 0.35 * bairroP : 0.75 + 0.25 * rand(i)}
              stroke={q.tipo === 'bairro' ? C.terracota : 'none'} strokeWidth={2.5}
              strokeOpacity={q.tipo === 'bairro' ? clamp((frame - f(15.3)) / 20) * 0.9 : 0} />
          ))}
          {QUADRAS.filter((q) => q.tipo === 'rico').map((q, i) => (
            <circle key={`a${i}`} cx={q.cx + (rand(i * 3) - 0.5) * 40} cy={q.cy + (rand(i * 5) - 0.5) * 30} r={9 + rand(i) * 6} fill="#4B5A3E" opacity={0.55} />
          ))}
          <path d={RIO} stroke="#23302F" strokeWidth={90} fill="none" strokeLinejoin="round" />
          {/* esgoto: sai do bairro rico, atravessa o bairro pobre e cai no rio */}
          <path d={ESGOTO} stroke="#7A6A55" strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={1600} strokeDashoffset={1600 * (1 - esg)} opacity={0.9} />
          {esg > 0.98 && <path d={ESGOTO} stroke="#A89878" strokeWidth={4} fill="none" strokeDasharray="10 24" strokeDashoffset={-flow} />}
          {/* asfalto: chega até ali e para */}
          <path d={ASFALTO} stroke="#0C0A09" strokeWidth={40} fill="none" strokeDasharray={1400} strokeDashoffset={1400 * (1 - asf)} opacity={0.5} transform="translate(3 7)" />
          <path d={ASFALTO} stroke="#58524C" strokeWidth={34} fill="none" strokeDasharray={1400} strokeDashoffset={1400 * (1 - asf)} />
          {asf > 0.05 && <path d={ASFALTO} stroke={C.papel} strokeWidth={3} fill="none" strokeDasharray="22 22" opacity={0.8} style={{clipPath: 'none'}}
            strokeDashoffset={0} mask="url(#asfMask)" />}
          <defs>
            <mask id="asfMask">
              <path d={ASFALTO} stroke="#fff" strokeWidth={40} fill="none" strokeDasharray={1400} strokeDashoffset={1400 * (1 - asf)} />
            </mask>
          </defs>
          <Traco d={TERRA} start={f(22.55)} dur={20} cor="#8C6A4A" w={5} len={600} />
          {frame >= f(22.55) && <path d={TERRA} stroke="#16110E" strokeWidth={6} fill="none" strokeDasharray="3 16" />}
          <Traco d={tremido(1350, 620, 150, 0.7)} start={f(23.4)} dur={11} len={1100} />
          <Selo icon="factory" x={1300} y={660} start={f(16.3)} label="INDÚSTRIA" />
          <Selo icon="trash" x={1640} y={600} start={f(17.62)} label="LIXÃO" />
          <Selo icon="bank" x={560} y={215} start={f(26.27)} r={58} label="POLÍTICA" />
          <Selo icon="hand-coins" x={790} y={150} start={f(26.95)} r={58} label="DINHEIRO" />
        </svg>
        <TypeTag text="ESGOTO" start={f(19.3)} x={900} y={640} size={30} cps={22} rot={2} />
        <TypeTag text="ASFALTO" start={f(20.75)} x={110} y={455} size={30} cps={22} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 30,4-36,5 · a cidade dividida + lampejo da história
const Dividida: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(30.35) || frame >= f(34.4)) return null;
  const corte = tween(frame, f(31.2), f(31.75), 1920, 960, E.expressiva);
  const linha = clamp((frame - f(31.2)) / 14);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Photo src="fotos/bairro-rico.jpg" from={f(30.35)} zoom0={1.05} zoomRate={0.014} filter="atual" />
      <AbsoluteFill style={{clipPath: `inset(0 0 0 ${corte}px)`}}>
        <Photo src="fotos/favela-aerea.jpg" from={f(31.2)} zoom0={1.08} zoomRate={0.014} filter="atual" />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: corte - 3, top: 0, width: 6, height: 1080 * linha, background: C.terracota}} />
      <TypeTag text="RENDA" start={f(31.98)} x={corte - 150} y={250} size={42} cps={22} />
      <TypeTag text="ACESSO À TERRA" start={f(33.4)} x={corte - 230} y={330} size={42} cps={26} rot={1.2} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 36,5-48,9 · tríptico "chega primeiro"
const PW = 624, GAP = 24, X0 = (1920 - 3 * PW - 2 * GAP) / 2;
const Primeiro: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(36.45) || frame >= f(48.95)) return null;
  const sai = clamp((frame - f(48.5)) / 13);
  const px = (k: number) => X0 + k * (PW + GAP);
  const um = (k: number, at: number) => {
    if (frame < f(at)) return null;
    const s = approach(frame, f(at), 2.2, 1, 0.3);
    return (
      <div style={{position: 'absolute', left: px(k), width: PW, top: 120, textAlign: 'center', transform: `scale(${s})`, opacity: clamp((frame - f(at)) / 3)}}>
        <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 170, color: C.vermelho, fontVariantNumeric: 'lining-nums', textShadow: '0 6px 24px rgba(0,0,0,.6)'}}>1º</span>
      </div>
    );
  };
  const tag = (k: number, a: string, b: string, tA: number, tB: number) => (
    <>
      <TypeTag text={a} start={f(tA)} end={f(tB) - 6} x={px(k) + 36} y={720} size={34} cps={22} />
      <TypeTag text={b} start={f(tB)} x={px(k) + 36} y={720} size={34} cps={24} />
    </>
  );
  return (
    <AbsoluteFill style={{background: C.fundo, opacity: 1 - sai, transform: `scale(${1 + sai * 0.04})`}}>
      <Painel x={px(0)} w={PW} start={f(36.9)} fotos={[{src: 'fotos/encosta.jpg', at: f(36.9)}, {src: 'obra/chuva-bairro.mp4', at: f(44.6)}]} />
      <Painel x={px(1)} w={PW} start={f(38.64)} fotos={[{src: 'obra/corrego.mp4', at: f(38.64)}, {src: 'obra/enchente-rio.mp4', at: f(42.68)}]} />
      <Painel x={px(2)} w={PW} start={f(40.58)} fotos={[{src: 'obra/lixo-rua.mp4', at: f(40.58)}, {src: 'fotos/industria-casas.jpg', at: f(46.86)}]} />
      {tag(0, 'ENCOSTA', 'DESLIZAMENTO', 37.05, 44.62)}
      {tag(1, 'BEIRA DO RIO', 'ENCHENTE', 38.75, 42.7)}
      {tag(2, 'SEM SANEAMENTO', 'CONTAMINAÇÃO', 40.95, 46.88)}
      <TypeTag text="CENAS: CANAL PRETO, 2021" start={f(39.2)} end={f(48.3)} x={X0} y={50} size={22} cps={30} rot={0} />
      {um(1, 43.38)}
      {um(0, 45.58)}
      {um(2, 47.9)}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 48,9-63,6 · os números (vitrine 2, pedido do Vítor)
const D = dados as {mapa: number[][]; favela: number[]; pessoas: number[][]; dono: number[]};
const ordemFavela = (() => {
  // acende do centro de cada metrópole para fora: ordem pela distância ao ponto favela mais próximo de um "núcleo"
  const idx = [...D.favela];
  return idx.sort((a, b) => rand(a * 1.3) - rand(b * 1.3));
})();
const rankFavela = new Map(ordemFavela.map((v, i) => [v, i]));
const Numeros: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(48.9) || frame >= f(65.5)) return null;
  const t = frame / 30;
  const morph0 = f(58.15);
  const mapaOut = clamp((frame - morph0) / 10);
  const camS = tween(frame, f(60.6), f(63.6), 1, 1.06, E.camera);
  const dots: React.ReactNode[] = [];
  const nM = D.mapa.length;
  if (frame < morph0) {
    for (let i = 0; i < nM; i++) {
      const [x, y] = D.mapa[i];
      const d = Math.hypot(x - 600, y - 540);
      const ap = arrive(frame, f(49.15) + d / 22, 0.25);
      if (ap <= 0) continue;
      const r = rankFavela.get(i);
      const lit = r !== undefined ? clamp((frame - (f(53.45) + (r / ordemFavela.length) * f(3.4))) / 5) : 0;
      dots.push(<circle key={i} cx={x} cy={y} r={3.3 + lit * 2.2} fill={lit > 0 ? C.terracota : C.papel} opacity={ap * (0.32 + 0.68 * lit)} />);
    }
  } else {
    D.pessoas.forEach(([tx, ty], j) => {
      const src = D.mapa[j % nM];
      const st = morph0 + (j % 17);
      const x = approach(frame, st, src[0], tx, 0.14);
      const y = approach(frame, st, src[1], ty, 0.14);
      const k = D.dono[j];
      const fill = frame >= f(58.84) + k * 2 && k < 7;
      const cinza = k >= 7 ? 0.28 + 0.2 * (1 - clamp((frame - f(60.6)) / 40)) : 1;
      const cor = fill ? C.terracota : C.papel;
      dots.push(<circle key={j} cx={x} cy={y} r={fill ? 4.6 : 3.6} fill={cor} opacity={(k >= 7 ? cinza : fill ? 1 : 0.5) * clamp((frame - st + 4) / 6)} />);
    });
  }
  const sai = clamp((frame - f(63.6)) / 10);
  return (
    <AbsoluteFill style={{background: '#120E0C'}}>
      <AbsoluteFill style={{opacity: 1 - sai * 0.85, transform: `scale(${camS})`}}>
        <svg width={1920} height={1080}>{dots}</svg>
        {/* bloco de texto à direita do mapa */}
        <div style={{position: 'absolute', left: 1080, top: 330, opacity: 1 - mapaOut}}>
          <div style={{opacity: arrive(frame, f(54.2), 0.2)}}>
            {frame >= f(54.2) && <Contador ate={16390815} a={f(54.25)} b={f(56.9)} size={132} />}
          </div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 46, color: C.papel, opacity: 0.85 * arrive(frame, f(55.6), 0.15), marginTop: 6, lineHeight: '54px'}}>
            pessoas vivem em favelas<br />e comunidades urbanas
          </div>
          <div style={{fontFamily: TYPE, fontSize: 28, color: C.papel, opacity: 0.7 * arrive(frame, f(57.2), 0.15), marginTop: 26, letterSpacing: '0.08em'}}>
            8,1% DA POPULAÇÃO · 12.348 FAVELAS
          </div>
        </div>
        <TypeTag text="IBGE · CENSO 2022" start={f(50.6)} end={f(58.1)} x={1080} y={210} size={34} cps={22} />
        {/* 7 em cada 10 */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: arrive(frame, f(60.4), 0.14)}}>
          <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: C.terracota, fontVariantNumeric: 'lining-nums'}}>72,9%</span>
          <div style={{fontFamily: TYPE, fontSize: 30, color: C.papel, opacity: 0.8, letterSpacing: '0.1em', marginTop: -6}}>PRETOS OU PARDOS · IBGE, CENSO 2022</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 63,6-70,6 · não é coincidência
const Coincidencia: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(63.55)) return null;
  const foto = frame >= f(65.45);
  const fim = clamp((frame - f(68.9)) / 36);
  return (
    <AbsoluteFill style={{background: foto ? '#000' : 'transparent'}}>
      {foto && (
        <AbsoluteFill style={{opacity: arrive(frame, f(65.45), 0.2)}}>
          <Photo src="fotos/favela-aerea.jpg" from={f(65.45)} zoom0={1.12} zoomRate={0.02} filter="atual" />
          <Isolinhas start={f(66.1)} cx={1000} cy={520} />
        </AbsoluteFill>
      )}
      {!foto && <Kinetic words={palavras(W, 63.6, 65.4)} size={100} y={540} accent={['coincidência.']} end={f(65.2)} />}
      <AbsoluteFill style={{background: '#000', opacity: fim}} />
    </AbsoluteFill>
  );
};

export const Parte3: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <MapaDesenho />
      <Territorio />
      <Planta />
      <TituloConceito l1="SEGREGAÇÃO" l2="SOCIOESPACIAL" t1={28.8} t2={29.38} size={168} desde={28.72} ate={30.4} />
      <Dividida />
      <Lampejo fotos={['fotos/fazenda.jpg', 'fotos/escravizados.jpg', 'fotos/missa-1888.jpg', 'fotos/providencia-1920.jpg']} a={f(34.4)} b={f(36.5)} />
      <Primeiro />
      <Numeros />
      <Coincidencia />
      <NameTape name="Cainã Farias" start={f(5.8)} dur={f(2.9)} x={140} y={560} />
      <Caption cues={CUES} />
      <Grain amount={0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};
