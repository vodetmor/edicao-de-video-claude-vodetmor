// A composição do editor: base cortada + apresentador recortado pelo rosto + layouts + elementos + legenda.
// Tudo sai de props (roteiro-visual.json, palavras da base, rosto.json); nada é fixo no código.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import type {CalculateMetadataFunction} from 'remotion';
import {relogio} from './ancora';
import {Desenha, altura, type Ctx} from './Elementos';
import {estilo as pegaEstilo} from './estilos';
import {clamp, lerp, mola, tween, E, useQuadroBase} from './kit';
import {DIM, recorte, zona, type Caixa} from './layout';
import {Legendas} from './Legendas';
import {montaMarca} from './marca';
import type {Cena, Entrada, Formato, Layout, Palavra} from './tipos';
import {useFontes} from './Fontes';

export const calcula: CalculateMetadataFunction<Entrada> = ({props}) => {
  const [width, height] = DIM[(props.roteiro.formato ?? '9:16') as Formato];
  const fps = props.base.fps || 30;
  return {width, height, fps, durationInFrames: Math.max(1, Math.round(props.base.duracao * fps))};
};

type Seg = {ini: number; layout: Layout; cena?: Cena; fim: number};

export const EditorVideo: React.FC<Entrada & {mudo?: boolean}> = ({roteiro, palavras, rosto, base, marca: marcaProj, mudo}) => {
  useFontes();
  const f = useQuadroBase(base.fps || 30);
  const fmt = (roteiro.formato ?? '9:16') as Formato;
  const [W, H] = DIM[fmt];
  const u = Math.min(W, H) / 1080;
  const fps = base.fps || 30;
  const dur = Math.round(base.duracao * fps);
  const est = pegaEstilo(roteiro.estilo);
  const m = montaMarca(marcaProj, roteiro.marca);

  const pal: Palavra[] = React.useMemo(
    () => palavras.map((p) => ({...p, f: Math.round(p.s * fps), fe: Math.round(p.e * fps)})),
    [palavras, fps],
  );
  const t = React.useMemo(() => relogio(pal, dur, fps), [pal, dur, fps]);

  // linha do tempo de layouts: o estilo dá a base, cada cena troca enquanto dura
  const segs: Seg[] = React.useMemo(() => {
    const cenas = [...(roteiro.cenas ?? [])].map((c) => ({c, a: t(c.de)})).sort((x, y) => x.a - y.a);
    const out: Seg[] = [{ini: 0, layout: est.base, fim: dur}];
    cenas.forEach(({c, a}, i) => {
      const prox = cenas[i + 1]?.a ?? dur;
      const fim = Math.min(c.ate ? t(c.ate) : prox, prox);
      out[out.length - 1].fim = a;
      out.push({ini: a, layout: c.layout, cena: c, fim});
      if (fim < prox) out.push({ini: fim, layout: est.base, fim: prox});
    });
    return out.filter((s) => s.fim > s.ini || s.ini === 0);
  }, [roteiro.cenas, est.base, t, dur]);

  const k = Math.max(0, segs.findIndex((s, i) => f >= s.ini && (i === segs.length - 1 || f < segs[i + 1].ini)));
  const seg = segs[k];
  const ant = segs[k - 1] ?? seg;
  const p = k === 0 ? 1 : mola(f, seg.ini, 0.26, 1);
  const zA = zona(ant.layout, fmt);
  const zB = zona(seg.layout, fmt);

  // caixa do apresentador (interpolada na troca de layout)
  // layout sem apresentador: a caixa desce para fora do quadro (continuidade espacial), em vez de virar fantasma
  const vazia = (z: Caixa | null, ref: Caixa | null): Caixa & {op: number} =>
    z ? {...z, op: 1} : {...(ref ?? {x: 0, y: 0, w: W, h: H, r: 0}), y: H + 40, op: 1};
  const a = vazia(zA.apresentador, zB.apresentador);
  const b = vazia(zB.apresentador, zA.apresentador);
  const cx: Caixa & {op: number} = {x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p),
    r: lerp(a.r, b.r, p) * u, op: lerp(a.op, b.op, p)};
  const alvo = {tam: lerp(zA.alvo.tam, zB.alvo.tam, p), y: lerp(zA.alvo.y, zB.alvo.y, p)};

  // rosto neste quadro
  const ri = rosto ? Math.min(rosto.n - 1, Math.round((f * rosto.fps) / fps)) : 0;
  const face = rosto ? {cx: rosto.cx[ri], cy: rosto.cy[ri], tam: rosto.tam[ri]} : {cx: 0.5, cy: 0.38, tam: 0.3};

  // punch-in: corte seco a cada frase no layout cheio (alterna, nunca dois iguais seguidos) + zooms pedidos no roteiro
  const inicios = React.useMemo(() => {
    const out: number[] = [];
    pal.forEach((w, i) => {
      if (i === 0 || w.s - pal[i - 1].e > 0.28 || /[.!?]$/.test(pal[i - 1].w)) out.push(w.f);
    });
    return out;
  }, [pal]);
  let zoom = 1;
  const auto = (roteiro.automatico?.zooms ?? est.zooms) && seg.layout === 'cheio' && ant.layout === 'cheio';
  if (auto) {
    const j = inicios.filter((x) => x <= f).length - 1;
    zoom = [1, 1.1, 1, 1.18][((j % 4) + 4) % 4];
  }
  for (const z of roteiro.zooms ?? []) {
    const a0 = t(z.de);
    const a1 = z.ate ? t(z.ate) : a0 + 45;
    if (f >= a0 && f < a1 + 10) zoom *= lerp(1, z.nivel, tween(f, a0, 10, 0, 1, E.camera) * (1 - tween(f, a1, 10, 0, 1, E.camera)));
  }

  const rec = recorte({w: cx.w, h: cx.h}, {w: base.largura, h: base.altura}, face, alvo, zoom);
  const moldura = seg.layout === 'moldura' || ant.layout === 'moldura';

  // elementos da cena atual (e da anterior enquanto sai)
  const camada = (s: Seg, opBase: number) => {
    if (!s.cena?.elementos?.length) return null;
    const z = zona(s.layout, fmt).area;
    if (!z) return null;
    const hs = s.cena.elementos.map((el) => altura(el, z.w, u));
    const gap = 28 * u;
    const total = hs.reduce((x, y) => x + y, 0) + gap * (hs.length - 1);
    // tela só de explicação: o conjunto cresce até ocupar o espaço e fica centrado na vertical
    const cheia = s.layout === 'tela';
    const esc = Math.min(cheia ? 1.4 : 1, z.h / total);
    let y = cheia ? Math.max(0, (z.h / esc - total) / 2) : 0;
    const sobreVideo = s.layout === 'cheio';
    const i0 = segs.indexOf(s);
    const trocou = i0 > 0 && segs[i0 - 1].layout !== s.layout;
    return (
      <div style={{position: 'absolute', left: z.x, top: z.y, width: z.w / esc, transform: `scale(${esc})`, transformOrigin: 'top left', opacity: opBase}}>
        {s.cena.elementos.map((el, i) => {
          const top = y;
          y += hs[i] + gap;
          // na troca de layout, espera o apresentador sair do caminho (~12 quadros) antes de entrar
          const ini = Math.max(el.de ? t(el.de) : s.ini, s.ini + (trocou ? 12 : 0));
          const fim = el.ate ? t(el.ate) : s.fim;
          if (f < ini - 1 || f >= fim) return null;
          const c: Ctx = {f, ini, fim, w: z.w / esc, u, m, t, sobreVideo};
          const op = 1 - tween(f, fim - 6, 6, 0, 1, E.saida);
          return (
            <div key={i} style={{position: 'absolute', top, left: 0, width: z.w / esc, opacity: op}}>
              <Desenha c={c} el={el} />
            </div>
          );
        })}
      </div>
    );
  };

  const zl = p < 0.5 ? zA : zB;
  // a legenda some rápido no meio da troca de layout e reaparece no lugar novo (não passa por cima da moldura andando)
  const opLeg = ant.layout === seg.layout ? 1 : clamp((Math.abs(2 * p - 1) - 0.45) * 3);
  const temVideo = !!base.arquivo;
  return (
    <AbsoluteFill style={{background: m.fundo}}>
      {temVideo && cx.op > 0.01 && (
        <div style={{position: 'absolute', left: cx.x, top: cx.y, width: cx.w, height: cx.h, borderRadius: cx.r, overflow: 'hidden',
          opacity: clamp(cx.op), boxShadow: moldura ? `0 ${18 * u}px ${48 * u}px rgba(20,20,30,.18)` : 'none',
          border: moldura ? `${3 * u * p}px solid ${m.papel}` : 'none', boxSizing: 'border-box'}}>
          <OffthreadVideo src={staticFile(base.arquivo)} muted={mudo} style={{position: 'absolute', left: rec.left, top: rec.top, width: rec.vw, height: rec.vh, maxWidth: 'none'}} />
        </div>
      )}
      {k > 0 && f < seg.ini + 8 && camada(ant, 1)}
      {camada(seg, 1)}
      <div style={{position: 'absolute', inset: 0, opacity: opLeg}}>
      <Legendas f={f} W={W} H={H} fps={fps} pal={pal} estilo={roteiro.legenda?.estilo ?? est.legenda} marca={m}
        zona={zl.legenda} tamanho={roteiro.legenda?.tamanho} />
      </div>
    </AbsoluteFill>
  );
};
