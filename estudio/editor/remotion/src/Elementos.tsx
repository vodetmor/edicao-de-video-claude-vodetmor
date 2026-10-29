// Elementos explicativos. Cada um entra na palavra em que é falado e explica UMA ideia (um verbo de movimento:
// revelar, contar, comparar, transformar, apontar). Desenhados no próprio projeto: nada de print falso nem dado inventado.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {Icone} from './Icone';
import {E, chega, clamp, lerp, mola, prog, tween, vida} from './kit';
import type {Marca} from './marca';
import type {Elemento} from './tipos';

export type Ctx = {f: number; ini: number; fim: number; w: number; u: number; m: Marca; t: (a: string) => number; sobreVideo: boolean};

const cartao = (m: Marca, u: number, sobreVideo: boolean): React.CSSProperties => ({
  background: m.papel,
  borderRadius: m.raio * u,
  border: `${1.5 * u}px solid ${m.linha}`,
  boxShadow: sobreVideo ? `0 ${12 * u}px ${36 * u}px rgba(0,0,0,.22)` : `0 ${8 * u}px ${28 * u}px rgba(20,20,30,.06)`,
});

// estimativa de linhas (para empilhar sem sobrepor)
const linhas = (txt: string, w: number, tam: number, k = 0.53) => Math.max(1, Math.ceil(txt.length / Math.max(1, w / (tam * k))));

export const altura = (el: Elemento, w: number, u: number): number => {
  switch (el.tipo) {
    case 'titulo':
      return linhas(el.texto, w - 100 * u, 80 * u) * 80 * u * 1.1 + (el.apoio ? linhas(el.apoio, w - 100 * u, 42 * u) * 42 * u * 1.3 + 16 * u : 0) + 76 * u;
    case 'lista':
      return el.itens.length * 112 * u;
    case 'numero':
      return 200 * u + (el.rotulo ? 64 * u : 0) + 56 * u;
    case 'passos':
      return 320 * u;
    case 'grafico':
      return 430 * u;
    case 'comparar':
      return 380 * u;
    case 'icone':
      return 210 * u + (el.texto ? 70 * u : 0);
    case 'imagem':
      return (el.altura ?? 420) * u + (el.legenda ? 56 * u : 0);
    case 'cta':
      return 170 * u + (el.apoio ? 70 * u : 0);
  }
};

const Mascara: React.FC<{f: number; ini: number; children: React.ReactNode; atraso?: number}> = ({f, ini, children, atraso = 0}) => {
  const p = chega(f, ini + atraso, 0.16);
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.08em'}}>
      <div style={{transform: `translateY(${(1 - p) * 105}%)`}}>{children}</div>
    </div>
  );
};

const Titulo: React.FC<{c: Ctx; el: Extract<Elemento, {tipo: 'titulo'}>}> = ({c, el}) => {
  const {f, ini, u, m} = c;
  const barra = tween(f, ini, 14, 0, 1, E.expressiva);
  return (
    <div style={{...cartao(m, u, c.sobreVideo), padding: `${36 * u}px ${44 * u}px`, display: 'flex', gap: 28 * u}}>
      <div style={{width: 10 * u, borderRadius: 5 * u, background: m.destaque, transform: `scaleY(${barra})`, transformOrigin: 'top'}} />
      <div style={{flex: 1}}>
        <Mascara f={f} ini={ini}>
          <div style={{fontFamily: m.fonteTitulo, fontWeight: m.pesoTitulo, fontSize: 80 * u, lineHeight: 1.1, letterSpacing: '-0.025em', color: m.tinta}}>{el.texto}</div>
        </Mascara>
        {el.apoio && (
          <div style={{marginTop: 16 * u, opacity: chega(f, ini + 8, 0.14), fontFamily: m.fonteTexto, fontWeight: 500, fontSize: 42 * u, lineHeight: 1.3, color: m.suave}}>{el.apoio}</div>
        )}
      </div>
    </div>
  );
};

const Lista: React.FC<{c: Ctx; el: Extract<Elemento, {tipo: 'lista'}>}> = ({c, el}) => {
  const {f, ini, u, m, t} = c;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 26 * u}}>
      {el.itens.map((it, i) => {
        const a = it.de ? t(it.de) : ini + i * 8;
        const v = vida(f, a, Infinity, 14 * u);
        const check = mola(f, a + 3, 0.4, 0.62);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26 * u, opacity: v.op, transform: `translateY(${v.y}px)`, height: 86 * u}}>
            <div style={{width: 76 * u, height: 76 * u, borderRadius: 24 * u, background: m.destaque, display: 'grid', placeItems: 'center',
              transform: `scale(${0.6 + 0.4 * check})`, flex: 'none'}}>
              <Icone nome={it.icone ?? el.icone ?? 'check:linha'} tam={42 * u} cor="#FFFFFF" />
            </div>
            <div style={{fontFamily: m.fonteTexto, fontWeight: 600, fontSize: 54 * u, letterSpacing: '-0.01em', color: c.sobreVideo ? '#FFFFFF' : m.tinta,
              textShadow: c.sobreVideo ? '0 2px 8px rgba(0,0,0,.5)' : 'none'}}>{it.texto}</div>
          </div>
        );
      })}
    </div>
  );
};

const Numero: React.FC<{c: Ctx; el: Extract<Elemento, {tipo: 'numero'}>}> = ({c, el}) => {
  const {f, ini, u, m} = c;
  const p = tween(f, ini, 26, 0, 1, E.expressiva);
  const casas = el.casas ?? (Number.isInteger(el.valor) ? 0 : 1);
  const v = (el.valor * p).toLocaleString('pt-BR', {minimumFractionDigits: casas, maximumFractionDigits: casas});
  return (
    <div style={{...cartao(m, u, c.sobreVideo), padding: `${28 * u}px ${48 * u}px`}}>
      <div style={{fontFamily: m.fonteTitulo, fontWeight: 800, fontSize: 190 * u, lineHeight: 1.05, letterSpacing: '-0.04em', color: m.destaque,
        fontVariantNumeric: 'tabular-nums', transform: `scale(${lerp(0.94, 1, chega(f, ini, 0.18))})`, transformOrigin: 'left center'}}>
        {(el.prefixo ?? '') + v + (el.sufixo ?? '')}
      </div>
      {el.rotulo && <div style={{fontFamily: m.fonteTexto, fontWeight: 500, fontSize: 44 * u, color: m.suave, opacity: chega(f, ini + 10, 0.15)}}>{el.rotulo}</div>}
    </div>
  );
};

const Passos: React.FC<{c: Ctx; el: Extract<Elemento, {tipo: 'passos'}>}> = ({c, el}) => {
  const {f, ini, u, m, t, w} = c;
  const n = el.itens.length;
  const passo = w / n;
  const r = 66 * u;
  const chegadas = el.itens.map((it, i) => (it.de ? t(it.de) : ini + i * 12));
  return (
    <div style={{position: 'relative', height: 320 * u, ...cartao(m, u, c.sobreVideo)}}>
      {el.itens.slice(1).map((_, i) => {
        const a = chegadas[i + 1] - 8;
        const p = tween(f, a, 12, 0, 1, E.produtiva);
        const x0 = passo * (i + 0.5) + r;
        const x1 = passo * (i + 1.5) - r;
        return <div key={i} style={{position: 'absolute', top: 40 * u + r - 2 * u, left: x0, width: (x1 - x0) * p, height: 4 * u, borderRadius: 2 * u, background: m.destaque}} />;
      })}
      {el.itens.map((it, i) => {
        const a = chegadas[i];
        const s = mola(f, a, 0.38, 0.65);
        const ativo = f >= a && (i === n - 1 || f < chegadas[i + 1]);
        return (
          <div key={i} style={{position: 'absolute', left: passo * i, width: passo, top: 40 * u, display: 'flex', flexDirection: 'column', alignItems: 'center',
            opacity: clamp(s * 1.5), transform: `scale(${0.7 + 0.3 * s})`}}>
            <div style={{width: 2 * r, height: 2 * r, borderRadius: 999, display: 'grid', placeItems: 'center',
              background: ativo || f >= a ? m.destaque : m.papel, border: `${3 * u}px solid ${m.destaque}`}}>
              {it.icone ? <Icone nome={it.icone} tam={62 * u} cor="#FFFFFF" />
                : <span style={{fontFamily: m.fonteTitulo, fontWeight: 700, fontSize: 56 * u, color: '#FFFFFF'}}>{i + 1}</span>}
            </div>
            <div style={{marginTop: 20 * u, textAlign: 'center', fontFamily: m.fonteTexto, fontWeight: 600, fontSize: 40 * u, lineHeight: 1.15, color: m.tinta, padding: `0 ${8 * u}px`}}>{it.texto}</div>
          </div>
        );
      })}
    </div>
  );
};

const Grafico: React.FC<{c: Ctx; el: Extract<Elemento, {tipo: 'grafico'}>}> = ({c, el}) => {
  const {f, ini, u, m, w} = c;
  const pts = el.pontos ?? [12, 18, 16, 28, 34, 31, 48, 62, 80];
  const gw = w - 88 * u;
  const gh = 250 * u;
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * gw, gh - ((v - min) / (max - min || 1)) * gh * 0.9 - gh * 0.05]);
  const d = xy.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
  const p = tween(f, ini + 4, 30, 0, 1, E.expressiva);
  const L = xy.reduce((acc, [x, y], i) => (i ? acc + Math.hypot(x - xy[i - 1][0], y - xy[i - 1][1]) : 0), 0);
  const ultimo = xy[Math.min(xy.length - 1, Math.floor(p * (xy.length - 1)))];
  return (
    <div style={{...cartao(m, u, c.sobreVideo), padding: `${30 * u}px ${44 * u}px`, height: 430 * u, boxSizing: 'border-box'}}>
      {el.rotulo && <div style={{fontFamily: m.fonteTexto, fontWeight: 600, fontSize: 44 * u, color: m.tinta, marginBottom: 18 * u}}>{el.rotulo}</div>}
      <svg width={gw} height={gh} style={{overflow: 'visible'}}>
        {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={0} x2={gw} y1={gh * k} y2={gh * k} stroke={m.linha} strokeWidth={1.5 * u} />)}
        <path d={d} fill="none" stroke={m.destaque} strokeWidth={7 * u} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
        <circle cx={ultimo[0]} cy={ultimo[1]} r={11 * u * clamp(p * 4)} fill={m.destaque} />
      </svg>
      <div style={{fontFamily: m.fonteTexto, fontSize: 26 * u, color: m.suave, marginTop: 8 * u}}>{el.nota ?? 'ilustrativo'}</div>
    </div>
  );
};

const Comparar: React.FC<{c: Ctx; el: Extract<Elemento, {tipo: 'comparar'}>}> = ({c, el}) => {
  const {f, ini, u, m, t} = c;
  const lado = (it: Extract<Elemento, {tipo: 'comparar'}>['esquerda'], bom: boolean, a: number) => {
    const v = vida(f, a, Infinity, 20 * u);
    return (
      <div style={{flex: 1, ...cartao(m, u, c.sobreVideo), border: `${bom ? 3 : 1.5}px solid ${bom ? m.destaque : m.linha}`, padding: `${30 * u}px`,
        opacity: v.op, transform: `translateY(${v.y}px)`, display: 'flex', flexDirection: 'column', gap: 16 * u}}>
        <Icone nome={it.icone ?? (bom ? 'check-circle' : 'x-circle')} tam={64 * u} cor={bom ? m.destaque : m.suave} />
        <div style={{fontFamily: m.fonteTitulo, fontWeight: 700, fontSize: 54 * u, letterSpacing: '-0.02em', color: bom ? m.tinta : m.suave}}>{it.titulo}</div>
        <div style={{fontFamily: m.fonteTexto, fontWeight: 500, fontSize: 36 * u, lineHeight: 1.3, color: m.suave}}>{it.texto}</div>
      </div>
    );
  };
  return (
    <div style={{display: 'flex', gap: 24 * u, height: 380 * u}}>
      {lado(el.esquerda, false, el.esquerda.de ? t(el.esquerda.de) : ini)}
      {lado(el.direita, true, el.direita.de ? t(el.direita.de) : ini + 14)}
    </div>
  );
};

const IconeEl: React.FC<{c: Ctx; el: Extract<Elemento, {tipo: 'icone'}>}> = ({c, el}) => {
  const {f, ini, u, m} = c;
  const s = mola(f, ini, 0.32, 0.62);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * u}}>
      <div style={{width: 190 * u, height: 190 * u, borderRadius: 56 * u, background: m.destaque, display: 'grid', placeItems: 'center',
        transform: `scale(${0.75 + 0.25 * s})`, opacity: clamp(s * 2)}}>
        <Icone nome={el.icone} tam={110 * u} cor="#FFFFFF" />
      </div>
      {el.texto && <Mascara f={f} ini={ini} atraso={5}>
        <div style={{fontFamily: m.fonteTitulo, fontWeight: 700, fontSize: 46 * u, color: c.sobreVideo ? '#FFFFFF' : m.tinta, textAlign: 'center',
          textShadow: c.sobreVideo ? '0 2px 8px rgba(0,0,0,.5)' : 'none'}}>{el.texto}</div>
      </Mascara>}
    </div>
  );
};

const Imagem: React.FC<{c: Ctx; el: Extract<Elemento, {tipo: 'imagem'}>}> = ({c, el}) => {
  const {f, ini, u, m} = c;
  const h = (el.altura ?? 420) * u;
  const s = chega(f, ini, 0.16);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * u, opacity: clamp(s * 1.6), transform: `scale(${0.95 + 0.05 * s})`}}>
      <Img src={staticFile(el.arquivo)} style={{height: h, maxWidth: '100%', objectFit: 'contain', borderRadius: m.raio * u * 0.6}} />
      {el.legenda && <div style={{fontFamily: m.fonteTexto, fontWeight: 500, fontSize: 30 * u, color: m.suave}}>{el.legenda}</div>}
    </div>
  );
};

const Cta: React.FC<{c: Ctx; el: Extract<Elemento, {tipo: 'cta'}>}> = ({c, el}) => {
  const {f, ini, u, m} = c;
  const s = mola(f, ini, 0.3, 0.6);
  const toque = 1 - 0.05 * Math.sin(Math.PI * prog(f, ini + 22, 8)); // um "aperto" curto depois de pousar
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * u}}>
      <div style={{background: m.destaque, color: '#FFFFFF', borderRadius: 999, padding: `${34 * u}px ${72 * u}px`, fontFamily: m.fonteTitulo,
        fontWeight: 700, fontSize: 60 * u, letterSpacing: '-0.01em', transform: `scale(${(0.8 + 0.2 * s) * toque})`, opacity: clamp(s * 2),
        display: 'flex', alignItems: 'center', gap: 18 * u}}>
        {el.texto}
        <Icone nome="arrow-right:linha" tam={44 * u} cor="#FFFFFF" />
      </div>
      {el.apoio && <div style={{fontFamily: m.fonteTexto, fontWeight: 500, fontSize: 40 * u, color: c.sobreVideo ? '#FFFFFF' : m.suave, opacity: chega(f, ini + 10, 0.15)}}>{el.apoio}</div>}
    </div>
  );
};

export const Desenha: React.FC<{c: Ctx; el: Elemento}> = ({c, el}) => {
  switch (el.tipo) {
    case 'titulo': return <Titulo c={c} el={el} />;
    case 'lista': return <Lista c={c} el={el} />;
    case 'numero': return <Numero c={c} el={el} />;
    case 'passos': return <Passos c={c} el={el} />;
    case 'grafico': return <Grafico c={c} el={el} />;
    case 'comparar': return <Comparar c={c} el={el} />;
    case 'icone': return <IconeEl c={c} el={el} />;
    case 'imagem': return <Imagem c={c} el={el} />;
    case 'cta': return <Cta c={c} el={el} />;
  }
};
