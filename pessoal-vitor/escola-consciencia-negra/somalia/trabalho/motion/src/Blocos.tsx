import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Img, staticFile} from 'remotion';
import geo from './data/africa.json';
import mundo from './data/mundo.json';
import {T} from './theme';
import {approach, prog, cam, s, hash} from './kit';
import {Grao, estrela} from './AfricaPais';

// "Na bandeira, uma estrela de cinco pontas: cada uma é uma terra do povo somali." As pontas acendem uma a uma.
export const Estrela5: React.FC<{pontas?: number[]}> = ({pontas = [2, 2.3, 2.6, 2.9, 3.2]}) => {
  const f = useCurrentFrame();
  const cx = 960, cy = 520, R = 270 * (1 + f * 0.0005), r = R * 0.382;
  const entra = approach(f, 0, 0.85, 1, 0.12);
  const tri = (k: number) => {
    const a = -Math.PI / 2 + k * 2 * Math.PI / 5, b1 = a - Math.PI / 5, b2 = a + Math.PI / 5;
    return `M${cx + R * Math.cos(a)} ${cy + R * Math.sin(a)} L${cx + r * Math.cos(b1)} ${cy + r * Math.sin(b1)} L${cx + r * Math.cos(b2)} ${cy + r * Math.sin(b2)}Z`;
  };
  const centro = [0, 1, 2, 3, 4].map(k => { const a = -Math.PI / 2 + Math.PI / 5 + k * 2 * Math.PI / 5; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(' ');
  return (
    <AbsoluteFill style={{background: T.azul}}>
      <svg width={1920} height={1080} style={{transform: `scale(${entra})`, transformOrigin: '960px 520px'}}>
        <polygon points={centro} fill="#fff" />
        {[0, 1, 2, 3, 4].map(k => {
          const p = prog(f, s(pontas[k]), s(pontas[k]) + 8);
          return <path key={k} d={tri(k)} fill="#fff" fillOpacity={0.28 + 0.72 * p} stroke="#fff" strokeWidth={2} strokeOpacity={0.6} />;
        })}
      </svg>
      <Grao />
    </AbsoluteFill>
  );
};

// Manchetes empilham sobre a África até cobrir; em "Mas ninguém conta" caem uma a uma.
const MANCHETES = ['FOME', 'GUERRA', 'PIRATARIA', 'TERROR', 'MISÉRIA', 'CAOS', 'SECA'];
export const Manchetes: React.FC<{t?: {cai: number}}> = ({t = {cai: 3.9}}) => {
  const f = useCurrentFrame();
  const sx = 0.82, ox = 960 - 960 * sx, oy = 540 - 540 * sx;
  return (
    <AbsoluteFill style={{background: T.bg}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(${ox} ${oy}) scale(${sx})`}>
          <path d={geo.outline} fill={T.terra} stroke={T.papel} strokeWidth={1.6} />
        </g>
      </svg>
      {MANCHETES.map((m, i) => {
        const t0 = 4 + i * 7;
        if (f < t0) return null;
        const sc = approach(f, t0, 1.5, 1, 0.24);
        const cai = Math.max(0, f - s(t.cai) - i * 3);
        const y = 250 + i * 95 + cai * cai * 1.4, rot = (hash(i) - 0.5) * 12 + cai * (i % 2 ? 1.2 : -1.2);
        return (
          <div key={m} style={{position: 'absolute', left: 960 + (hash(i * 3) - 0.5) * 360, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`,
            background: '#EDE6DA', color: '#14110E', padding: '10px 34px 4px', fontFamily: T.serif, fontSize: 92, letterSpacing: '0.04em', lineHeight: 1,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', opacity: Math.min(1, (f - t0) / 2)}}>{m}</div>
        );
      })}
      <Grao />
    </AbsoluteFill>
  );
};

// África e Brasil ligados por uma linha que atravessa o Atlântico (José).
export const Atlantico: React.FC<{t?: {linha: number; brasil: number}}> = ({t = {linha: 2, brasil: 4}}) => {
  const f = useCurrentFrame();
  const z = 1 + f * 0.0005;
  const lp = prog(f, s(t.linha) - 30, s(t.linha) + 20, cam);
  const br = prog(f, s(t.brasil) - 6, s(t.brasil) + 10);
  const pts = mundo.arco as number[][];
  const n = Math.max(2, Math.round(lp * pts.length));
  const d = 'M' + pts.slice(0, n).map(p => p.join(' ')).join('L');
  const so = mundo.somalia as number[], bra = mundo.brasil as number[];
  const lab = (x: number, y: number, txt: string, o: number, dx = 0) => (
    <div style={{position: 'absolute', left: 960 + (x - 960) * z + dx, top: 540 + (y - 540) * z - 50, transform: 'translate(-50%,-100%)', opacity: o,
      fontFamily: T.sans, fontWeight: 600, fontSize: 28, letterSpacing: '0.3em', color: T.papel}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{background: T.bg}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
          {mundo.paises.map((p, i) => {
            const af = p.cont === 'Africa', bra_ = p.iso === 'BRA', som = p.iso === 'SOM';
            const fill = som ? T.azul : af ? T.terraLuz : bra_ ? interpolate(br, [0, 1], [0, 1]) > 0.5 ? '#5A4E40' : T.terra : T.terra;
            return <path key={i} d={p.d} fill={fill} stroke={T.bg} strokeWidth={0.8} opacity={af || bra_ || som ? 1 : 0.55} />;
          })}
          <path d={d} fill="none" stroke={T.papel} strokeWidth={2.6} strokeLinecap="round" />
          <circle cx={so[0]} cy={so[1]} r={7} fill={T.papel} />
          {lp > 0.98 && <circle cx={bra[0]} cy={bra[1]} r={7 * approach(f, s(t.linha) + 20, 0, 1, 0.2)} fill={T.papel} />}
        </g>
      </svg>
      {lab(so[0], so[1], 'SOMÁLIA', prog(f, 0, 12))}
      {lab(bra[0], bra[1], 'BRASIL', br)}
      <Grao />
    </AbsoluteFill>
  );
};

// Final (v2, Vítor 19/11): estrela + título, créditos que sobem como no cinema (grupo, música, imagens com licença, mapas,
// fontes dos dados) e, enquanto a música termina, uma frase só em tela escura.
const GRUPO = ['Anna Augusta', 'Daniel Bertelli', 'José Carvalho', 'Luísa Brasil', 'Maria Eduarda', 'Urley Luca', 'Vítor Machado', 'Yago Rocha'];
export const FRASE = ['Um povo não é', 'a ferida que deixaram nele.'];
const CRED: [string, string[]][] = [
  ['PESQUISA, ROTEIRO E NARRAÇÃO', ['o grupo']],
  ['EDIÇÃO E MOTION', ['Vítor Machado']],
  ['MÚSICA', ['“Pearls”, Sade (Love Deluxe, 1992)']],
  ['DISCURSO', ['Martin Luther King Jr., “I Have a Dream”, Washington, 1963', 'Fotos da Marcha sobre Washington: Arquivos Nacionais dos EUA e USMC (domínio público)']],
  ['IMAGENS E VÍDEOS', ['Voice of America (domínio público)', 'AMISOM Public Information (CC0)', 'DFID, UK Department for International Development (CC BY 2.0)',
    'USAID (CC BY-NC 2.0) · Feed My Starving Children (CC BY 2.0)', 'Gerard van de Bruinhorst (CC BY-SA 4.0) · CharlesFred (CC BY-NC-SA 2.0)',
    'Sabir Rustamov, Waqtishow, fdgsfg435 e SOMALIA (CC BY 3.0)', 'Forças Armadas dos EUA, Radio al-Andalus e Shahada News Agency (domínio público)',
    'Pexels: That Malawian Guy, Thirty Story, Najim Kurfi, Khanh Hoang Minh,', 'Monstera Production, Roman Odintsov, Mka Visuals e Gulied Maarso']],
  ['MAPAS', ['NASA Blue Marble · Natural Earth · Bandeiras: flagcdn', 'E. G. Ravenstein, possessões europeias na África (1884)']],
  ['FONTES DOS DADOS', ['ONU · Banco Mundial · FAO/FSNAU e FEWS NET (fome de 2011)', 'BBC News · Al Jazeera · Encyclopaedia Britannica', 'Minority Rights Group International']],
];
// Ordem do fim (v3): estrela + título -> "I have a dream" (bloco Sonho por cima) -> frase -> créditos rolando.
export const Final: React.FC<{creditos?: number; frase?: number; mlk?: number; total?: number}> = ({creditos = 20, frase = 14, mlk = 3, total = 32}) => {
  const f = useCurrentFrame();
  const e = approach(f, 0, 0.3, 1, 0.08);
  const tit = prog(f, s(1.4), s(2.4)) * (1 - prog(f, s(mlk) - 10, s(mlk)));
  const rolo = interpolate(f, [s(creditos), s(total) - 6], [1080, -2300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fimFrase = 1 - prog(f, s(creditos) - 22, s(creditos) - 2);
  const fr = prog(f, s(frase) + 8, s(frase) + 40) * fimFrase;
  const fr2 = prog(f, s(frase) + 40, s(frase) + 72) * fimFrase;
  const apaga = 1 - prog(f, s(total) - 20, s(total));
  return (
    <AbsoluteFill style={{background: T.bg}}>
      <AbsoluteFill style={{opacity: tit}}>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <path d={estrela(960, 420, 150 * e * (1 + f * 0.0004))} fill={T.papel} />
        </svg>
        <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', transform: `translateY(${(1 - tit) * 14}px)`}}>
          <div style={{fontFamily: T.serif, fontSize: 104, color: T.papel, lineHeight: 1}}>Somália</div>
          <div style={{fontFamily: T.serif, fontStyle: 'italic', fontSize: 52, color: T.papel, opacity: 0.78, marginTop: 10}}>a África que ninguém conta</div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 430, width: '100%', textAlign: 'center', fontFamily: T.serif, fontSize: 92, lineHeight: 1.15, color: T.papel}}>
        <div style={{opacity: fr, transform: `translateY(${(1 - fr) * 12}px)`}}>{FRASE[0]}</div>
        <div style={{opacity: fr2, transform: `translateY(${(1 - fr2) * 12}px)`, fontStyle: 'italic'}}>{FRASE[1]}</div>
      </div>
      {f >= s(creditos) - 2 && (
        <div style={{position: 'absolute', top: rolo, width: '100%', textAlign: 'center', opacity: apaga}}>
          <svg width={60} height={60} style={{display: 'block', margin: '0 auto'}}><path d={estrela(30, 30, 28)} fill={T.papel} /></svg>
          <div style={{fontFamily: T.sans, fontWeight: 600, fontSize: 24, letterSpacing: '0.34em', color: T.azul, marginTop: 40}}>UM TRABALHO DE</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 460px)', justifyContent: 'center', rowGap: 18, marginTop: 30}}>
            {GRUPO.map(n => <div key={n} style={{fontFamily: T.serif, fontSize: 60, color: T.papel}}>{n}</div>)}
          </div>
          {CRED.map(([t, l]) => (
            <div key={t} style={{marginTop: 96}}>
              <div style={{fontFamily: T.sans, fontWeight: 600, fontSize: 22, letterSpacing: '0.32em', color: T.azul}}>{t}</div>
              {l.map(x => <div key={x} style={{fontFamily: T.sans, fontWeight: 500, fontSize: 30, lineHeight: 1.55, color: T.papel, marginTop: 6}}>{x}</div>)}
            </div>
          ))}
          <div style={{fontFamily: T.serif, fontStyle: 'italic', fontSize: 40, color: T.papelMeio, marginTop: 110}}>Consciência Negra · 2026</div>
        </div>
      )}
      <Grao />
    </AbsoluteFill>
  );
};

// "I have a dream" (Martin Luther King Jr., Washington, 28/08/1963): fotos P&B da Marcha + tradução sincronizada com a voz
const SONHO: [number, string][] = [[0.12, 'Eu tenho um sonho'], [3.74, 'de que meus quatro filhos pequenos'], [7.98, 'um dia vão viver numa nação'],
  [9.96, 'onde não serão julgados pela cor da pele,'], [13.08, 'mas pelo conteúdo do seu caráter.']];
export const Sonho: React.FC<{voz?: number; dur?: number}> = ({voz = 0.6, dur = 18}) => {
  const f = useCurrentFrame(); const t = f / 30 - voz;
  const a = prog(f, 0, 24) * (1 - prog(f, s(dur) - 18, s(dur)));
  const troca = s(voz + 8.2);
  const foto = (src: string, ini: number, fim: number, ox: string) => {
    const k = prog(f, ini, ini + 24) * (fim > 0 ? 1 - prog(f, fim - 24, fim) : 1);
    return <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: ox,
      opacity: k, transform: `scale(${1.04 + 0.06 * (f - ini) / s(dur)})`, filter: 'grayscale(1) contrast(1.08) brightness(0.7)'}} />;
  };
  const atual = [...SONHO].reverse().find(([t0]) => t >= t0 - 0.05);
  const ini = atual ? s(voz + atual[0]) : 0;
  const k = atual ? prog(f, ini - 2, ini + 8) : 0;
  return (
    <AbsoluteFill style={{background: '#0B0A09', opacity: a}}>
      {foto('midia/mlk/martin-luther-king-jr-addresses-a-crowd-.jpg', 0, troca + 12, '50% 40%')}
      {foto('midia/mlk/martin-luther-king-march-on-washington-j.jpg', troca - 14, 0, '50% 22%')}
      <div style={{position: 'absolute', left: 96, top: 84, fontFamily: T.sans, fontWeight: 600, fontSize: 22, letterSpacing: '0.3em', color: '#fff', opacity: 0.85 * prog(f, 10, 34)}}>
        MARTIN LUTHER KING JR. · WASHINGTON, 28 DE AGOSTO DE 1963
      </div>
      {atual && t < 16.2 && (
        <div style={{position: 'absolute', left: '6%', width: '88%', bottom: 150, textAlign: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: 64, lineHeight: 1.15,
          color: '#fff', opacity: k, transform: `translateY(${(1 - k) * 10}px)`, textShadow: '0 2px 18px rgba(0,0,0,0.8)'}}>{atual[1]}</div>
      )}
    </AbsoluteFill>
  );
};
