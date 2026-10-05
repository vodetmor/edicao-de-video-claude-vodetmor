// PARTE 2 · Maria Eduarda (história: para onde foram, de onde vem o termo, a obra).
// Relógio: public/p2/words.json (a tabela T aponta a palavra-âncora de cada instante; ela mudou falas em relação ao roteiro:
// o nome vem DEPOIS de "a periferia distante do centro"). Vitrines: o CORTE DO TERRENO, o GLOBO até Warren County e a régua 1897 → 1982.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {geoGraticule10, geoInterpolate, geoOrthographic, geoPath} from 'd3-geo';
import {C, E, FILTRO, approach, arrive, clamp, f, rand, tween} from '../lib';
import {Grain, Kinetic, NameTape, Photo, SERIF, TYPE, TypeTag, useFonts} from '../kit';
import {Alfinete, Contador, Painel, Traco, palavras} from '../kit2';
import {Caption} from '../Caption';
import {CUES} from './captions';
import words from '../../public/p2/words.json';
import MUNDO from './mundo.json';
import EUA from './eua.json';

export const DURACAO_P2 = 80.0;
const W = words as {w: string; s: number; e: number}[];

// ---------------------------------------------------------------- relógio (estimado; cada linha diz a palavra-âncora)
const T = {
  abre: 0.74, abreFim: 3.45, //          "Quem não tem chão, fica com o que ninguém quer."
  sobrou: 3.7, encostas: 5.14, rio: 6.0, alagam: 7.3, periferia: 8.52, perfilFim: 10.75, // "E o que sobrou ... distante do centro."
  nome: 11.64, termo: 13.88, //          "Oi, eu sou a Maria Eduarda e vim explicar ... o termo racismo ambiental."
  ano1897: 17.42, rj: 19.76, providencia: 21.74, primeira: 23.84, provFim: 25.0,
  modernizacao: 27.16, derrubados: 30.22, corticoFim: 31.2,
  empurrada: 32.98, margens: 35.08, margensFim: 36.6,
  seculo: 36.82, eua: 38.3, umNome: 40.26, tempoFim: 41.9,
  ano1982: 42.42, warren: 44.64, carolina: 46.16, globoFim: 47.6, comunidade: 49.04, lixo: 53.16, casas: 55.08, warrenFim: 56.75,
  chavis: 59.38, racismo: 62.0, chavisFim: 63.9,
  canal: 64.4, titulo: 68.04, obraFim: 70.2,
  passado: 73.46, passadoFim: 74.9,
  continua: 75.56, mapa: 77.32,
};

// ---------------------------------------------------------------- 0-5,9 · quem não tem chão
const Abre: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= f(T.sobrou)) return null;
  const quebra = f(T.abreFim - 0.9);
  const cai = frame < quebra ? 0 : approach(frame, quebra, 0, 1, 0.12);
  const foto = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 1 - foto}}>
        {/* o "chão": linha que se desenha sob a frase e se parte em "ninguém quer" (a metade direita tomba ladeira abaixo) */}
        <Traco d="M 330 610 L 960 610" start={f(T.abre)} dur={16} cor={C.papel} w={3} len={620} />
        <g transform={`rotate(${cai * 24} 960 610)`} opacity={1 - clamp((frame - quebra - 20) / 10)}>
          <Traco d="M 960 610 L 1590 610" start={f(T.abre) + 8} dur={16} cor={C.papel} w={3} len={620} />
        </g>
      </svg>
      <Kinetic words={palavras(W, 0, 3.5)} size={66} y={540} accent={['chão,']} end={f(T.abreFim)} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- o corte do terreno (perfil da cidade)
// Terreno: morro à esquerda (encosta), planície com o CENTRO, vale do rio, várzea que alaga e, longe, a periferia.
const chao = (x: number) => {
  if (x < 640) return 700 - 330 * Math.exp(-Math.pow((x - 330) / 210, 2)); // morro
  if (x < 1230) return 700;
  if (x < 1430) return 700 + 90 * Math.sin(((x - 1230) / 200) * Math.PI); // leito do rio
  if (x < 1700) return 725; // várzea
  return 700 - 40 * Math.sin(((x - 1700) / 900) * Math.PI);
};
const TERRENO = (() => {
  let d = `M -200 ${chao(-200)}`;
  for (let x = -190; x <= 2700; x += 10) d += ` L ${x} ${chao(x).toFixed(1)}`;
  return d;
})();
const casa = (x: number, y: number, s = 1, k = 0) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -16 0 L -16 -22 L 0 -36 L 16 -22 L 16 0 Z" />
  </g>
);
const CASAS_ENCOSTA = [150, 190, 230, 265, 300, 350, 390, 430, 470, 510].map((x, i) => ({x, y: chao(x), at: T.encostas + i * 0.05}));
const CASAS_RIO = [1210, 1245, 1415, 1450].map((x, i) => ({x, y: chao(x) - 8, at: T.rio + 0.2 + i * 0.07, palafita: true}));
const CASAS_VARZEA = [1500, 1545, 1590, 1635, 1675].map((x, i) => ({x, y: 725, at: T.alagam - 0.4 + i * 0.05}));
const CASAS_PERIF = [2010, 2060, 2110, 2160, 2210, 2270, 2320, 2380].map((x, i) => ({x, y: chao(x), at: T.periferia + 0.5 + i * 0.05}));
const PREDIOS = [[780, 170], [840, 250], [905, 320], [975, 210], [1040, 280], [1105, 150]] as const;

const Perfil: React.FC = () => {
  const frame = useCurrentFrame();
  const vez1 = frame >= f(T.sobrou) && frame < f(T.perfilFim);
  const vez2 = frame >= f(T.corticoFim) && frame < f(T.margensFim);
  if (!vez1 && !vez2) return null;
  const s0 = vez1 ? f(T.sobrou) : f(T.corticoFim);
  // câmera: 1ª vez abre em "periferia" para mostrar a distância; 2ª vez já começa aberta
  const zoom = vez1 ? tween(frame, f(T.periferia), f(T.periferia + 1.4), 1, 0.74, E.camera) : 0.74;
  const agua = vez1 ? arrive(frame, f(T.rio), 0.1) : 1;
  const cheia = vez1 ? arrive(frame, f(T.alagam), 0.06) : 1;
  const dist = vez1 ? arrive(frame, f(T.periferia + 0.9), 0.08) : 1;
  const nasce = (at: number) => (vez2 ? 1 : frame < f(at) ? 0 : arrive(frame, f(at), 0.28));
  const todas = [...CASAS_ENCOSTA, ...CASAS_RIO, ...CASAS_VARZEA, ...CASAS_PERIF];
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '18% 62%'}}>
        <svg width={2600} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {/* água do rio e cheia da várzea (hachura em papel, nada de azul) */}
          <defs>
            <pattern id="hach" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1={0} y1={0} x2={0} y2={14} stroke={C.papel} strokeWidth={2} opacity={0.5} />
            </pattern>
          </defs>
          <path d={`M 1230 700 ${Array.from({length: 21}, (_, i) => `L ${1230 + i * 10} ${chao(1230 + i * 10)}`).join(' ')} Z`}
            fill="url(#hach)" opacity={agua} transform={`translate(0 ${(1 - agua) * 60})`} />
          <rect x={1430} y={725 - 38 * cheia} width={270} height={38 * cheia} fill="url(#hach)" opacity={cheia * 0.9} />
          {cheia > 0.05 && <line x1={1430} x2={1700} y1={725 - 38 * cheia} y2={725 - 38 * cheia} stroke={C.papel} strokeWidth={2} opacity={0.7 * cheia} />}
          {/* terreno */}
          <Traco d={TERRENO} start={s0} dur={vez2 ? 1 : 26} cor={C.papel} w={4} len={3400} />
          {/* centro: prédios em papel */}
          <g fill="none" stroke={C.papel} strokeWidth={3}>
            {PREDIOS.map(([x, h], i) => {
              const p = vez2 ? 1 : arrive(frame, s0 + 10 + i * 2, 0.16);
              return <rect key={i} x={x - 28} y={700 - h * p} width={56} height={h * p} />;
            })}
          </g>
          {/* casas das margens em terracota */}
          <g fill={C.terracota}>
            {todas.map((c, i) => {
              const p = nasce(c.at);
              if (p <= 0) return null;
              return (
                <g key={i} opacity={p}>
                  {'palafita' in c && <path d={`M ${c.x - 10} ${c.y} L ${c.x - 10} ${c.y + 34} M ${c.x + 10} ${c.y} L ${c.x + 10} ${c.y + 34}`} stroke={C.terracota} strokeWidth={3} />}
                  {casa(c.x, c.y - (1 - p) * 40, 1.05, i)}
                </g>
              );
            })}
          </g>
          {/* distância do centro até a periferia */}
          {dist > 0 && (
            <g stroke={C.papel} strokeWidth={2.5} opacity={dist} fill="none">
              <path d={`M 1150 800 L ${1150 + (2200 - 1150) * dist} 800`} strokeDasharray="10 10" />
              <path d="M 1150 786 L 1150 814" />
              {dist > 0.95 && <path d="M 2200 786 L 2200 814" />}
            </g>
          )}
          {vez2 && <Empurra />}
        </svg>
        <TypeTag text="CENTRO" start={s0 + 16} x={860} y={780} size={30} cps={20} rot={0.8} />
        {vez1 && <TypeTag text="ENCOSTAS" start={f(T.encostas)} x={200} y={200} size={34} cps={22} />}
        {vez1 && <TypeTag text="BEIRAS DE RIO" start={f(T.rio)} x={1180} y={560} size={34} cps={22} rot={1} />}
        {vez1 && <TypeTag text="ÁREAS QUE ALAGAM" start={f(T.alagam)} x={1420} y={860} size={34} cps={22} rot={-1.6} />}
        <TypeTag text="PERIFERIA" start={vez2 ? s0 : f(T.periferia + 0.4)} x={2050} y={500} size={40} cps={22} />
        {dist > 0.9 && <TypeTag text="LONGE DO CENTRO" start={vez2 ? s0 : f(T.periferia + 1.3)} x={1500} y={830} size={30} cps={24} rot={0.6} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 2ª vez (26,3-30,9): pontos = pessoas saindo do centro, empurradas para o morro e para o rio (cor muda quando chegam)
const Empurra: React.FC = () => {
  const frame = useCurrentFrame();
  const N = 36;
  const destinos = [...CASAS_ENCOSTA, ...CASAS_RIO, ...CASAS_VARZEA, ...CASAS_PERIF];
  return (
    <g>
      {Array.from({length: N}, (_, i) => {
        const x0 = 790 + rand(i * 3) * 330, y0 = 688 - rand(i * 7) * 10;
        const d = destinos[i % destinos.length];
        const t0 = f(T.empurrada) + i * 0.7;
        const p = frame < t0 ? 0 : E.expressiva(clamp((frame - t0) / 26));
        const x = x0 + (d.x + (rand(i) - 0.5) * 20 - x0) * p;
        const y = y0 + (d.y - 44 - y0) * p - Math.sin(Math.PI * p) * 120;
        return <circle key={i} cx={x} cy={y} r={8} fill={p > 0.98 ? C.terracota : C.papel} opacity={0.95} />;
      })}
      {/* setas de empurrão saindo do centro */}
      {[[-1, 760], [1, 1140]].map(([dir, x], k) => {
        const p = arrive(frame, f(T.empurrada) - 4 + k * 3, 0.14);
        return <path key={k} d={`M ${x} 620 L ${x + dir * 170 * p} 620 M ${x + dir * 170 * p} 620 l ${-dir * 22} -14 M ${x + dir * 170 * p} 620 l ${-dir * 22} 14`} stroke={C.vermelho} strokeWidth={6} fill="none" strokeLinecap="round" opacity={p} />;
      })}
      {/* "para as margens": as bordas do quadro acendem */}
      {frame >= f(T.margens) && <rect x={-40} y={-40} width={2680} height={1160} fill="none" stroke={C.vermelho} strokeWidth={36 * arrive(frame, f(T.margens), 0.12)} opacity={0.8} />}
    </g>
  );
};

// ---------------------------------------------------------------- 10,75-17,3 · "Oi, eu sou a Maria Eduarda" (encosta real)
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.perfilFim) || frame >= f(T.ano1897 - 0.1)) return null;
  const sai = clamp((frame - f(T.ano1897 - 0.6)) / 14);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: arrive(frame, f(T.perfilFim), 0.1) * (1 - sai)}}>
        <Photo src="fotos/encosta.jpg" from={f(T.perfilFim)} zoom0={1.14} zoomRate={-0.014} filter="atual" />
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.32)'}} />
      </AbsoluteFill>
      <TypeTag text="DE ONDE VEM O TERMO" start={f(T.termo)} end={f(T.ano1897 - 0.6)} x={140} y={170} size={34} cps={22} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 41,9-47,6 · o GLOBO: do Brasil a Warren County (pedido do Vítor)
const NC: [number, number] = [-78.16, 36.4], RIO: [number, number] = [-43.2, -22.9];
const GRAT = geoGraticule10();
const Globo: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.tempoFim) || frame >= f(T.globoFim)) return null;
  const gira = E.expressiva(clamp((frame - f(T.ano1982 - 0.2)) / (f(T.warren - 0.2) - f(T.ano1982 - 0.2))));
  const lon = -48 + (NC[0] + 48) * gira, lat = -14 + (NC[1] + 14) * gira;
  const giro = (frame - f(T.tempoFim)) * 0.04; // deriva lenta, para o globo nunca parar
  const zoom = tween(frame, f(T.carolina - 0.3), f(T.globoFim), 1, 3.4, E.entrada);
  const sc = 400 * approach(frame, f(T.tempoFim), 0.86, 1, 0.08) * zoom;
  const proj = geoOrthographic().rotate([-lon - giro, -lat]).scale(sc).translate([960, 540]).clipAngle(90);
  const path = geoPath(proj);
  const arcoP = clamp((frame - f(T.ano1982)) / (f(T.warren) - f(T.ano1982)));
  const ip = geoInterpolate(RIO, NC);
  const arco = {type: 'LineString' as const, coordinates: Array.from({length: 41}, (_, i) => ip((i / 40) * arcoP))};
  const pin = proj(NC) ?? [960, 540];
  const sai = clamp((frame - f(T.globoFim - 0.35)) / 10);
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <svg width={1920} height={1080} style={{opacity: arrive(frame, f(T.tempoFim), 0.12) * (1 - sai)}}>
        <circle cx={960} cy={540} r={sc} fill="#1d1813" stroke={C.papel} strokeWidth={2} opacity={0.9} />
        <path d={path(GRAT) ?? ''} fill="none" stroke={C.papel} strokeWidth={1} opacity={0.12} />
        <path d={path(MUNDO.land as never) ?? ''} fill={C.papel} fillOpacity={0.14} stroke={C.papel} strokeWidth={1.4} strokeOpacity={0.55} />
        <path d={path(MUNDO.br as never) ?? ''} fill={C.terracota} fillOpacity={0.55 * (1 - gira * 0.6)} stroke={C.terracota} strokeWidth={1.5} />
        <path d={path(MUNDO.us as never) ?? ''} fill={C.vermelho} fillOpacity={0.6 * gira} stroke={C.terracota} strokeWidth={1.5} strokeOpacity={gira} />
        {arcoP > 0 && <path d={path(arco) ?? ''} fill="none" stroke={C.terracota} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 12" />}
        <Alfinete x={pin[0]} y={pin[1]} start={f(T.warren)} />
      </svg>
      <div style={{position: 'absolute', left: 140, top: 120, opacity: arrive(frame, f(T.ano1982), 0.2) * (1 - sai)}}>
        <Contador de={1897} ate={1982} a={f(T.ano1982)} b={f(T.ano1982 + 0.6)} size={150} ano cor={C.papel} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 17,3-25 · 1897, Morro da Providência
const Providencia: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.ano1897 - 0.1) || frame >= f(T.provFim)) return null;
  const ano = arrive(frame, f(T.rj), 0.1); // o ano encolhe para o canto
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: arrive(frame, f(T.ano1897 - 0.1), 0.12)}}>
        <Photo src="fotos/providencia-1920.jpg" from={f(T.ano1897 - 0.1)} zoom0={1.05} zoomRate={0.02} x0={-20} dx={-6} filter="arquivo" />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 960 - (960 - 150) * ano, top: 540 - (540 - 110) * ano, transform: `translate(${-50 * (1 - ano)}%, ${-50 * (1 - ano)}%) scale(${1.6 - 0.9 * ano})`, transformOrigin: '0 0', textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
        <Contador de={1888} ate={1897} a={f(T.ano1897)} b={f(T.ano1897 + 0.7)} size={170} ano />
      </div>
      <TypeTag text="RIO DE JANEIRO" start={f(T.rj + 0.5)} x={160} y={330} size={36} cps={22} />
      <TypeTag text="MORRO DA PROVIDÊNCIA" start={f(T.providencia)} x={160} y={400} size={36} cps={22} rot={0.6} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Alfinete x={1180} y={420} start={f(T.primeira)} />
      </svg>
      <TypeTag text="A PRIMEIRA FAVELA DO PAÍS" start={f(T.primeira + 0.3)} x={1030} y={450} size={32} cps={26} rot={1.2} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 20,7-26,3 · "modernização": os cortiços derrubados
const Corticos: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.provFim) || frame >= f(T.corticoFim)) return null;
  const tiras = 4;
  const q = arrive(frame, f(T.modernizacao) + 8, 0.2);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Photo src="fotos/corticos-demolicao.jpg" from={f(T.provFim)} zoom0={1.08} zoomRate={0.015} filter="arquivo" />
      {/* a foto do cortiço se parte em tiras que despencam em "derrubados" */}
      {Array.from({length: tiras}, (_, i) => {
        const t0 = f(T.derrubados) + [0, 3, 1, 4][i];
        const t = Math.max(0, frame - t0) / 30;
        const dy = 0.5 * 5200 * t * t, rot = (i % 2 ? 1 : -1) * 40 * t * t * (1 + i * 0.3);
        if (dy > 1300) return null;
        return (
          <div key={i} style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - ((i + 1) * 100) / tiras}% 0 ${(i * 100) / tiras}%)`,
            transform: `translateY(${dy}px) rotate(${rot}deg)`, transformOrigin: `${((i + 0.5) * 100) / tiras}% 100%`}}>
            <Photo src="fotos/cortico-rio.jpg" from={f(T.provFim)} zoom0={1.04} zoomRate={0.012} filter="arquivo" />
          </div>
        );
      })}
      {frame >= f(T.modernizacao) && frame < f(T.derrubados) && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: `rgba(0,0,0,${0.45 * arrive(frame, f(T.modernizacao), 0.15)})`}}>
          <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 150, color: C.papel, opacity: arrive(frame, f(T.modernizacao), 0.2), letterSpacing: '-0.01em', textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>
            <span style={{color: C.terracota, display: 'inline-block', transform: `translateY(${(1 - q) * -60}px)`, opacity: q}}>“</span>
            modernização
            <span style={{color: C.terracota, display: 'inline-block', transform: `translateY(${(1 - q) * -60}px)`, opacity: q}}>”</span>
          </div>
        </AbsoluteFill>
      )}
      <TypeTag text="CORTIÇOS DO CENTRO · RIO" start={f(T.provFim + 0.3)} x={150} y={130} size={32} cps={24} end={f(T.modernizacao - 0.1)} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 30,9-35,1 · quase um século depois: régua 1897 → 1982
const Linha: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.margensFim) || frame >= f(T.tempoFim)) return null;
  const px = 34; // px por ano
  const ano = tween(frame, f(T.seculo + 0.3), f(T.eua + 0.9), 1897, 1982, E.expressiva);
  const off = 960 - (ano - 1880) * px;
  const marca = (a: number, cor: string, lbl: string, at: number) => (
    <g key={a} opacity={arrive(frame, f(at), 0.2)}>
      <circle cx={(a - 1880) * px} cy={540} r={16} fill={cor} />
      <text x={(a - 1880) * px} y={610} fill={C.papel} fontFamily={TYPE} fontSize={30} textAnchor="middle">{lbl}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <svg width={1920} height={1080}>
        <g transform={`translate(${off} 0)`}>
          <line x1={0} x2={(2000 - 1880) * px} y1={540} y2={540} stroke={C.papel} strokeWidth={3} opacity={0.6} />
          {Array.from({length: 121}, (_, i) => (
            <line key={i} x1={i * px} x2={i * px} y1={540 - (i % 10 === 0 ? 26 : 10)} y2={540 + (i % 10 === 0 ? 26 : 10)} stroke={C.papel} strokeWidth={i % 10 === 0 ? 3 : 1.5} opacity={0.5} />
          ))}
          {Array.from({length: 13}, (_, i) => (
            <text key={i} x={i * 10 * px} y={490} fill={C.papel} opacity={0.35} fontFamily={TYPE} fontSize={26} textAnchor="middle">{1880 + i * 10}</text>
          ))}
          {marca(1897, C.papel, 'BRASIL', T.margensFim)}
          {marca(1982, frame >= f(T.umNome) ? C.vermelho : C.papel, 'EUA', T.eua)}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center'}}>
        <Contador de={1897} ate={1982} a={f(T.seculo + 0.3)} b={f(T.eua + 0.9)} size={190} ano cor={frame >= f(T.umNome) ? C.terracota : C.papel} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 35,1-43,3 · Warren County, 1982
const Warren: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.globoFim) || frame >= f(T.warrenFim)) return null;
  const split = frame >= f(T.lixo - 0.3);
  const corte = split ? tween(frame, f(T.lixo - 0.3), f(T.lixo + 0.2), 1920, 1040, E.expressiva) : 1920;
  const d0 = f(T.lixo);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{clipPath: `inset(0 ${1920 - corte}px 0 0)`}}>
        <AbsoluteFill style={{transform: `translateX(${-(1920 - corte) / 2}px)`}}>
          <AbsoluteFill style={{background: C.fundo}} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform={`translate(${480 - EUA.pin[0] * 0.2} 170) scale(${approach(frame, f(T.globoFim), 1.9, 1.15, 0.09) + 0.004 * ((frame - f(T.globoFim)) / 30)})`} style={{transformOrigin: `${EUA.pin[0]}px ${EUA.pin[1]}px`}}>
              <path d={EUA.d} fill="none" stroke={C.papel} strokeWidth={2.5} opacity={0.85 * arrive(frame, f(T.globoFim), 0.18)} />
              <circle cx={EUA.pin[0]} cy={EUA.pin[1]} r={14} fill={C.vermelho} />
              <circle cx={EUA.pin[0]} cy={EUA.pin[1]} r={14 + 60 * (((frame - f(T.globoFim)) / 40) % 1)} fill="none" stroke={C.vermelho} strokeWidth={3} opacity={1 - (((frame - f(T.globoFim)) / 40) % 1)} />
            </g>
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      {split && (
        <div style={{position: 'absolute', left: corte, top: 0, width: 1920 - corte, height: 1080, background: C.fundo, overflow: 'hidden'}}>
          <svg width={880} height={1080}>
            <g fill="none" stroke={C.papel} strokeWidth={3}>
              {/* casas */}
              {[0, 1, 2].map((i) => {
                const p = arrive(frame, d0 + i * 3, 0.2);
                return <path key={i} d={`M ${90 + i * 120} 640 L ${90 + i * 120} 560 L ${140 + i * 120} 510 L ${190 + i * 120} 560 L ${190 + i * 120} 640`} opacity={p} transform={`translate(0 ${(1 - p) * 30})`} />;
              })}
              <line x1={40} x2={840} y1={640} y2={640} opacity={0.6} />
            </g>
            {/* depósito: monte + tambores */}
            <path d={`M 500 640 Q 660 ${640 - 190 * arrive(frame, d0 + 10, 0.1)} 820 640 Z`} fill="url(#hachW)" stroke={C.terracota} strokeWidth={3} />
            <defs>
              <pattern id="hachW" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
                <line x1={0} y1={0} x2={0} y2={12} stroke={C.terracota} strokeWidth={2} opacity={0.6} />
              </pattern>
            </defs>
            {[0, 1, 2, 3].map((i) => {
              const p = arrive(frame, d0 + 16 + i * 3, 0.24);
              return <rect key={i} x={560 + i * 52} y={596 - (1 - p) * 200} width={38} height={44} rx={4} fill={C.vermelho} opacity={p} />;
            })}
            {/* "ao lado de suas casas": cota com a distância curta */}
            {frame >= f(T.casas) && (
              <g stroke={C.papel} strokeWidth={2.5} opacity={arrive(frame, f(T.casas), 0.18)}>
                <path d="M 330 700 L 540 700 M 330 686 L 330 714 M 540 686 L 540 714" />
              </g>
            )}
          </svg>
          <TypeTag text="LIXO TÓXICO" start={d0 + 20} x={500} y={700} size={30} cps={22} rot={-1.4} />
          <TypeTag text="AO LADO DAS CASAS" start={f(T.casas + 0.2)} x={200} y={740} size={30} cps={24} rot={0.8} />
        </div>
      )}
      {split && <div style={{position: 'absolute', left: corte - 3, top: 0, width: 6, height: 1080, background: C.terracota}} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 43,3-49,1 · Benjamin Chavis cria a expressão
const Chavis: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.warrenFim) || frame >= f(T.chavisFim)) return null;
  const verb = arrive(frame, f(T.racismo), 0.16);
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Painel x={0} w={760} start={f(T.warrenFim)} fotos={[{src: 'fotos/benjamin-chavis.jpg', at: f(T.warrenFim), filtro: 'arquivo'}]} />
      <TypeTag text="REV. BENJAMIN CHAVIS" start={f(T.warrenFim + 0.4)} x={60} y={760} size={32} cps={24} />
      {/* verbete de dicionário: o nome nasce aqui */}
      <div style={{position: 'absolute', left: 860, top: 360, width: 960}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 120, lineHeight: '120px', color: C.terracota, opacity: verb,
          transform: `translateY(${(1 - verb) * 40}px)`, filter: `blur(${(1 - verb) * 8}px)`, letterSpacing: '-0.01em'}}>
          racismo<br />ambiental
        </div>
        <div style={{height: 2, background: C.papel, opacity: 0.35, width: `${arrive(frame, f(T.racismo) + 10, 0.1) * 100}%`, margin: '34px 0 26px'}} />
        <div style={{fontFamily: TYPE, fontSize: 30, lineHeight: '46px', color: C.papel, opacity: 0.85 * arrive(frame, f(T.chavis), 0.14)}}>
          expressão criada em 1982 pelo<br />reverendo Benjamin Chavis
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 49,1-53,9 · a obra (cartão datilografado, sem logo)
const Obra: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.chavisFim) || frame >= f(T.obraFim)) return null;
  const titulo = ['Racismo', 'Ambiental:', 'Entenda', 'essa', 'Luta'];
  const cam = tween(frame, f(T.chavisFim), f(T.obraFim), 1, 1.05, E.camera);
  return (
    <AbsoluteFill style={{background: C.fundo, transform: `scale(${cam})`}}>
      <div style={{position: 'absolute', left: 360, top: 250, width: 1200, height: 520, background: C.papel, boxShadow: '0 40px 80px rgba(0,0,0,.6)',
        transform: `rotate(0.6deg) translateY(${approach(frame, f(T.chavisFim), 70, 0, 0.12)}px)`, padding: '80px 100px', boxSizing: 'border-box'}}>
        <div style={{fontFamily: TYPE, fontSize: 34, color: C.tinta, letterSpacing: '0.12em'}}>
          {'CANAL PRETO · 2021'.slice(0, Math.round(clamp((frame - f(T.canal)) / 26) * 18))}
        </div>
        <div style={{height: 3, background: C.vermelho, width: `${arrive(frame, f(T.canal) + 20, 0.1) * 100}%`, margin: '28px 0 40px'}} />
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 92, lineHeight: '100px', color: C.tinta}}>
          {titulo.map((w, i) => {
            const p = arrive(frame, f(T.titulo) + i * 5, 0.2);
            return <span key={i} style={{display: 'inline-block', marginRight: 26, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, color: i < 2 ? C.vermelho : C.tinta}}>{w}</span>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 53,9-57,4 · não ficou no passado (1920 → hoje)
const Passado: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.obraFim) || frame >= f(T.passadoFim)) return null;
  const wipe = tween(frame, f(T.passado - 0.5), f(T.passado + 0.4), 0, 1, E.expressiva);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Photo src="fotos/favela-aerea.jpg" from={f(T.obraFim)} zoom0={1.1} zoomRate={0.02} filter="cor" />
      <AbsoluteFill style={{clipPath: `inset(0 0 0 ${wipe * 100}%)`}}>
        <Photo src="fotos/providencia-1920.jpg" from={f(T.obraFim)} zoom0={1.1} zoomRate={0.02} filter="arquivo" />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.72) 100%)'}} />
      {wipe > 0 && wipe < 1 && <div style={{position: 'absolute', left: `${wipe * 100}%`, top: 0, width: 5, height: 1080, background: C.papel, opacity: 0.9}} />}
      <TypeTag text="1920" start={f(T.obraFim + 0.3)} x={1600} y={120} size={34} cps={20} end={f(T.passado - 0.4)} />
      <TypeTag text="HOJE" start={f(T.passado + 0.3)} x={130} y={120} size={34} cps={20} rot={1} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 57,4-61,8 · escrita no mapa (passa a bola para o Cainã)
const LINHAS = [
  'M 300 200 C 460 300, 560 380, 640 520 S 800 760, 940 880',
  'M 640 520 C 860 470, 1060 520, 1280 440 S 1580 360, 1720 420',
  'M 940 880 C 1140 800, 1340 790, 1540 850',
  'M 1280 440 C 1300 600, 1360 710, 1540 850',
];
const Mapa: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(T.passadoFim)) return null;
  const fim = clamp((frame - f(DURACAO_P2 - 0.7)) / 18);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: arrive(frame, f(T.passadoFim), 0.1) * 0.8, transform: `scale(${1 + 0.012 * ((frame - f(T.passadoFim)) / 30)})`}}>
        <Img src={staticFile('fotos/mapa-antigo-b.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: FILTRO.arquivo}} />
        <AbsoluteFill style={{background: 'rgba(12,8,6,0.5)'}} />
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {LINHAS.map((d, i) => <Traco key={i} d={d} start={f(T.mapa) + i * 6} dur={22} cor={C.terracota} w={5} len={1600} />)}
      </svg>
      <Kinetic words={palavras(W, 75.3, 79)} size={72} y={540} accent={['mapa']} />
      <AbsoluteFill style={{background: '#000', opacity: fim}} />
    </AbsoluteFill>
  );
};

export const Parte2: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Abre />
      <Perfil />
      <Intro />
      <Providencia />
      <Corticos />
      <Linha />
      <Globo />
      <Warren />
      <TypeTag text="WARREN COUNTY" start={f(T.warren + 0.15)} end={f(T.lixo - 0.4)} x={130} y={640} size={40} cps={20} />
      <TypeTag text="CAROLINA DO NORTE · EUA" start={f(T.carolina)} end={f(T.lixo - 0.4)} x={130} y={712} size={32} cps={26} rot={0.8} />
      <Chavis />
      <Obra />
      <Passado />
      <Mapa />
      <NameTape name="Maria Eduarda" start={f(T.nome - 0.1)} dur={f(2.6)} x={140} y={560} />
      <Caption cues={CUES} />
      <Grain amount={0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};
