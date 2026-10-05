// PARTE 7 · Anna Júlia Dias (conclusão) + TELA FINAL. Relógio: public/p7/words.json.
// Fecha os ciclos do filme: o mapa do bairro vermelho volta à cor dos outros, o ano corre para a frente
// (espelho do rebobinar da parte 1) e a chuva com relâmpago da abertura volta em "da próxima vez que chover forte".
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, E, FILTRO, approach, arrive, clamp, f, rand, tween} from '../lib';
import {Grain, Kinetic, NameTape, Photo, Rain, SERIF, TYPE, TypeTag, useFonts, SANS} from '../kit';
import {Contador, TituloConceito, Traco, palavras, tremido} from '../kit2';
import {Caption} from '../Caption';
import {CUES} from './captions';
import {CENTRO, QUADS, rioY} from '../scenes/Riscos';
import words from '../../public/p7/words.json';
import cred from './creditos.json';

const W = words as {w: string; s: number; e: number}[];
const FIM_FALA = 53.2;          // título de novo
const CRED0 = 57.4;             // começa o rolo de créditos
const CRED_DUR = 26;
export const DURACAO_P7 = CRED0 + CRED_DUR;

// ---------------------------------------------------------------- A+B · 0-7,9 · onde alguém nasce (+ nome na pausa)
const Nasce: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= f(7.95)) return null;
  return (
    <AbsoluteFill style={{background: '#000', opacity: arrive(frame, 0, 0.06)}}>
      <Photo src="fotos/crianca-favela.jpg" from={0} zoom0={1.14} zoomRate={-0.012} filter="atual" />
      <AbsoluteFill style={{background: '#000', opacity: clamp((frame - f(7.5)) / 13)}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C · 7,95-12,9 · a pergunta
const Pergunta: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(7.95) || frame >= f(12.95)) return null;
  const ws = palavras(W, 10.1, 12.2);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <TypeTag text="A PERGUNTA QUE A OBRA DEIXA" start={f(8.6)} end={f(12.6)} x={640} y={340} size={34} cps={26} />
      <Kinetic words={ws} size={110} y={560} accent={['construir?']} end={f(12.7)} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- D1 · 12,95-17,9 · o endereço decide
const Endereco: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(12.95) || frame >= f(17.9)) return null;
  const ITENS = [{t: 'ÁGUA LIMPA', at: 15.35}, {t: 'AR PURO', at: 16.1}, {t: 'CASA SEGURA', at: 16.85}];
  const typed = (txt: string, t0: number, cps = 24) => txt.slice(0, Math.max(0, Math.floor(((frame - f(t0)) / 30) * cps) + 1));
  return (
    <AbsoluteFill style={{background: C.fundo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{width: 1400, background: C.papel, padding: '60px 80px 70px', boxSizing: 'border-box', boxShadow: '0 40px 80px rgba(0,0,0,.6)',
        transform: `rotate(-1deg) scale(${tween(frame, f(12.95), f(17.9), 1, 1.06, E.camera)}) translateY(${approach(frame, f(12.95), 60, 0, 0.14) - 60}px)`}}>
        <div style={{fontFamily: TYPE, fontSize: 30, color: C.tinta, opacity: 0.6, letterSpacing: '0.12em'}}>ENDEREÇO</div>
        <div style={{fontFamily: TYPE, fontSize: 44, color: C.tinta, marginTop: 14, height: 56, borderBottom: `2px solid rgba(36,26,21,.3)`}}>
          {frame >= f(13.9) ? typed('Rua __________, nº ___ · Bairro ________', 13.9, 34) : ''}
        </div>
        <div style={{display: 'flex', gap: 60, marginTop: 50}}>
          {ITENS.map((it, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: frame >= f(it.at) ? 1 : 0}}>
              <svg width={54} height={54}>
                <rect x={3} y={3} width={48} height={48} fill="none" stroke={C.tinta} strokeWidth={4} />
                {frame >= f(it.at) + 8 && <text x={27} y={42} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={44} fill={C.vermelho}>?</text>}
              </svg>
              <span style={{fontFamily: TYPE, fontSize: 34, color: C.tinta}}>{typed(it.t, it.at, 26)}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- D2 · 17,9-23,55 · VITRINE: o mapa que se iguala
const REDE = (() => {
  const fonte = {x: 120, y: 80};
  const qs = QUADS.filter((q) => q.cy < rioY(q.cx) + 400).map((q) => ({...q, d: Math.hypot(q.cx - fonte.x, q.cy - fonte.y)})).sort((a, b) => a.d - b.d);
  const segs: {x1: number; y1: number; x2: number; y2: number; d: number; bairro: boolean}[] = [];
  qs.forEach((q, i) => {
    if (i === 0) return;
    let best = qs[0], bd = 1e9;
    for (let j = 0; j < i; j++) { const dd = Math.hypot(qs[j].cx - q.cx, qs[j].cy - q.cy); if (dd < bd) { bd = dd; best = qs[j]; } }
    segs.push({x1: best.cx, y1: best.cy, x2: q.cx, y2: q.cy, d: best.d, bairro: q.bairro});
  });
  return {segs, casas: qs};
})();
const Iguala: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(17.9) || frame >= f(23.55)) return null;
  const inclui = clamp((frame - f(20.85)) / 20);
  const cam = tween(frame, f(17.9), f(22.3), 1.25, 1.0, E.camera);
  const dique = E.produtiva(clamp((frame - f(21.45)) / 24));
  const rio: string[] = [];
  for (let x = -60; x <= 1980; x += 30) rio.push(`${x === -60 ? 'M' : 'L'} ${x} ${rioY(x).toFixed(1)}`);
  const margem: string[] = [];
  for (let x = -60; x <= 1980; x += 30) margem.push(`${x === -60 ? 'M' : 'L'} ${x} ${(rioY(x) - 58).toFixed(1)}`);
  return (
    <AbsoluteFill style={{background: '#16110E', opacity: arrive(frame, f(17.9), 0.25)}}>
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: `${CENTRO.x}px ${CENTRO.y}px`}}>
        <svg width={1920} height={1080}>
          {QUADS.map((q, i) => (
            <polygon key={i} points={q.pts.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={q.bairro ? C.vermelho : '#2A211B'} fillOpacity={q.bairro ? 0.6 * (1 - inclui) + (0.7 + 0.3 * rand(i)) * inclui * 0.001 : 0.7 + 0.3 * rand(i)}
              stroke={q.bairro ? C.terracota : 'none'} strokeWidth={3} strokeOpacity={q.bairro ? 0.8 * (1 - inclui) : 0} />
          ))}
          {QUADS.filter((q) => q.bairro).map((q, i) => (
            <polygon key={`b${i}`} points={q.pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="#2A211B" fillOpacity={(0.7 + 0.3 * rand(i * 7)) * inclui} />
          ))}
          <path d={rio.join(' ')} stroke="#23302F" strokeWidth={96} fill="none" strokeLinejoin="round" />
          <path d={margem.join(' ')} stroke={C.papel} strokeWidth={5} fill="none" strokeDasharray={2400} strokeDashoffset={2400 * (1 - dique)} opacity={0.7} />
          {REDE.segs.map((s, i) => {
            const start = s.bairro ? f(19.2) + (i % 7) * 2 : f(17.9) - 200;
            const p = clamp((frame - start) / 10);
            if (p <= 0) return null;
            return <line key={i} x1={s.x1} y1={s.y1} x2={s.x1 + (s.x2 - s.x1) * p} y2={s.y1 + (s.y2 - s.y1) * p} stroke={C.papel} strokeWidth={2.4} opacity={0.75} />;
          })}
          {REDE.casas.map((q, i) => {
            const start = q.bairro ? f(19.5) + (i % 9) * 2 : -1;
            if (frame < start) return null;
            return <circle key={i} cx={q.cx} cy={q.cy} r={q.bairro ? 7 * arrive(frame, start, 0.3) : 6} fill={q.bairro ? C.terracota : C.papel} />;
          })}
        </svg>
      </AbsoluteFill>
      <TypeTag text="INCLUSÃO" start={f(20.85)} x={120} y={870} size={34} cps={22} />
      <TypeTag text="PROTEÇÃO" start={f(21.43)} x={420} y={870} size={34} cps={22} rot={1} />
      <TypeTag text="JUSTIÇA" start={f(22.25)} x={730} y={870} size={34} cps={22} rot={-2} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- E+F · 23,55-34,75 · Zumbi e Dandara · três séculos depois
const Luta: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(23.55) || frame >= f(34.75)) return null;
  const t = frame / 30;
  const dandara = t >= 24.6, anos = t >= 26.95, marcha = t >= 28.85;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!dandara && <Photo src="fotos/zumbi.jpg" from={f(23.55)} zoom0={1.12} zoomRate={-0.02} filter="arquivo" />}
      {dandara && !marcha && <Photo src="fotos/serra-da-barriga.jpg" from={f(24.6)} zoom0={1.04} zoomRate={0.02} filter={anos ? 'arquivo' : 'atual'} />}
      {marcha && <Photo src="fotos/marcha.jpg" from={f(28.85)} zoom0={1.02} zoomRate={0.02} filter="atual" />}
      {!dandara && <TypeTag text="ZUMBI DOS PALMARES" start={f(23.7)} x={140} y={170} size={42} cps={24} />}
      {dandara && !anos && <TypeTag text="DANDARA · QUILOMBO DOS PALMARES" start={f(24.7)} x={140} y={170} size={42} cps={28} />}
      {anos && !marcha && (
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center'}}>
          <Contador de={1695} ate={2026} a={f(27.0)} b={f(28.7)} size={230} ano />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- G · 34,75-43,55 · da próxima vez que chover forte (volta a abertura)
const Chuva: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(34.75) || frame >= f(43.55)) return null;
  const t = frame / 30;
  const flash = (frame >= f(36.05) && frame < f(36.12)) || (frame >= f(36.25) && frame < f(36.29));
  const alagada = t >= 36.85;
  const tela = tween(frame, f(38.9), f(39.5), 1, 0.62, E.expressiva);
  const volta = tween(frame, f(39.9), f(40.6), 1, 1 / 0.62 * 1.25, E.expressiva);
  const escala = t < 39.9 ? tela : 0.62 * volta;
  const moldura = clamp((frame - f(38.9)) / 10) * (1 - clamp((frame - f(39.9)) / 8));
  const porque = t >= 42.55;
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      {!alagada && (
        <AbsoluteFill style={{filter: `brightness(${flash ? 2.6 : 1})`}}>
          <Photo src="fotos/chuva-cidade.jpg" from={f(34.75)} zoom0={1.1} zoomRate={0.02} filter="atual" />
          <Rain start={f(34.75)} intensity={1.1} opacity={0.55} />
        </AbsoluteFill>
      )}
      {alagada && !porque && (
        <AbsoluteFill style={{transform: `scale(${escala})`, transformOrigin: '50% 46%'}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 34 * moldura / Math.max(0.62, escala), overflow: 'hidden',
            boxShadow: moldura > 0 ? `0 0 0 ${26 * moldura}px #0B0908, 0 40px 90px rgba(0,0,0,${0.7 * moldura})` : undefined}}>
            <Photo src="fotos/rua-alagada-b.jpg" from={f(36.85)} zoom0={1.04} zoomRate={0.015} filter="atual" />
            <Rain start={f(36.85)} intensity={0.8} opacity={0.4} />
          </div>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <Traco d={tremido(980, 600, 190, 0.3)} start={f(40.75)} dur={12} len={1500} w={7} />
          </svg>
        </AbsoluteFill>
      )}
      {alagada && !porque && moldura > 0.02 && <TypeTag text="SUA TELA" start={f(39.2)} end={f(39.85)} x={170} y={120} size={30} cps={24} />}
      {porque && (
        <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 210, color: C.vermelho, transform: `scale(${approach(frame, f(42.55), 1.25, 1, 0.2)})`,
            opacity: arrive(frame, f(42.55), 0.3)}}>
            Por quê?
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- H · 43,55-53,2 · o valor que damos à vida · direito de todos
const Final: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(43.55) || frame >= f(FIM_FALA)) return null;
  const txt = frame >= f(47.3);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!txt && <Photo src="fotos/cidade-amanhecer.jpg" from={f(43.55)} zoom0={1.02} zoomRate={0.018} filter="cor" />}
      {txt && <Kinetic words={palavras(W, 47.3, 52)} size={82} y={540} accent={['todos.']} end={f(52.6)} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- I+J · 53,2-fim · título de novo e créditos documentais
const Bloco: React.FC<{rotulo: string; linhas: string[]; grande?: boolean}> = ({rotulo, linhas, grande}) => (
  <div style={{marginBottom: 90, textAlign: 'center'}}>
    <div style={{fontFamily: TYPE, fontSize: 26, color: C.terracota, letterSpacing: '0.2em', marginBottom: 22}}>{rotulo}</div>
    {linhas.map((l, i) => (
      <div key={i} style={{fontFamily: grande ? SERIF : SANS, fontWeight: grande ? 600 : 400, fontSize: grande ? 58 : 27, lineHeight: grande ? '76px' : '40px',
        color: C.papel, opacity: grande ? 1 : 0.85}}>
        {l}
      </div>
    ))}
  </div>
);
const Creditos: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(CRED0)) return null;
  const c = cred as {nomes: string[]; obra: string; dados: string[]; musica: string[]; efeitos: string[]; imagens: string[]};
  // altura do rolo até o fecho "CONSCIÊNCIA NEGRA" (blocos: rótulo 48 + linhas + 90 de margem)
  const bloco = (n: number, lh: number) => 48 + n * lh + 90;
  const H = bloco(c.nomes.length, 76) + bloco(1, 40) + bloco(c.dados.length, 40) + bloco(c.musica.length, 40) + bloco(c.efeitos.length, 40) + bloco(c.imagens.length, 40) + 300;
  const y = tween(frame, f(CRED0), f(CRED0 + CRED_DUR - 3.5), 1080, 540 - H - 70, (x) => x);
  const fim = clamp((frame - f(CRED0 + CRED_DUR - 1.6)) / 40);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: y}}>
        <Bloco rotulo="UM TRABALHO DE" linhas={c.nomes} grande />
        <Bloco rotulo="BASEADO NA OBRA" linhas={[c.obra]} />
        <Bloco rotulo="DADOS" linhas={c.dados} />
        <Bloco rotulo="MÚSICA" linhas={c.musica} />
        <Bloco rotulo="EFEITOS SONOROS" linhas={c.efeitos} />
        <Bloco rotulo="IMAGENS" linhas={c.imagens} />
        <div style={{height: 300}} />
        <div style={{textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 90, color: C.vermelho, letterSpacing: '0.04em'}}>CONSCIÊNCIA NEGRA</div>
        <div style={{textAlign: 'center', fontFamily: TYPE, fontSize: 28, color: C.papel, opacity: 0.7, letterSpacing: '0.2em', marginTop: 10}}>20 DE NOVEMBRO</div>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fim}} />
    </AbsoluteFill>
  );
};

export const Parte7: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Nasce />
      <Pergunta />
      <Endereco />
      <Iguala />
      <Luta />
      <Chuva />
      <Final />
      <TituloConceito l1="RACISMO" l2="AMBIENTAL" t1={FIM_FALA + 0.4} t2={FIM_FALA + 1.1} size={230} desde={FIM_FALA} ate={CRED0} fundo="#000" />
      <Creditos />
      <NameTape name="Anna Júlia" start={f(5.55)} dur={f(2.0)} x={140} y={560} />
      <Caption cues={CUES} />
      <Grain amount={0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};

export {Img, staticFile, FILTRO};
