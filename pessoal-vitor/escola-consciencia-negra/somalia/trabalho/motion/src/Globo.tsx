import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {geoOrthographic, geoPath} from 'd3-geo';
import g from './data/globo.json';
import {T} from './theme';
import {prog, cam, s, approach} from './kit';
import {estrela, Grao} from './AfricaPais';

// Globo de satélite (NASA, domínio público) girando e mergulhando até o Chifre da África.
// Projeção ortográfica feita pixel a pixel no canvas; fronteiras por cima com d3-geo na MESMA projeção.
export const DUR_GLOBO = s(10);
const W = 1920, H = 1080;
let TEX: {d: Uint8ClampedArray; w: number; h: number} | null = null;

type Alvo = 'somalia' | 'africa' | 'gira';
const estado = (f: number, alvo: Alvo = 'somalia') => {
  if (alvo === 'gira') return {lon: -30 + f * 0.12, lat: 6, R: 360, cx: W / 2, cy: H / 2, mergulho: 0};
  if (alvo === 'africa') {
    // abertura: gira e aproxima até a África ficar do tamanho da silhueta da cena seguinte
    const gira = prog(f, 0, s(2.8), (t) => t);
    const m = prog(f, s(1.6), s(4.9), cam);
    const lon = interpolate(gira, [0, 1], [-40, -12]) + m * (17 - (-12));
    return {lon, lat: interpolate(m, [0, 1], [8, 2]), R: 330 * Math.pow(800 / 330, m), cx: W / 2, cy: interpolate(m, [0, 1], [H / 2, 520]), mergulho: m};
  }
  const gira = prog(f, 0, s(3.2), (t) => t);            // giro inicial lento
  const mergulho = prog(f, s(2.6), s(7.4), cam);         // vira para o Chifre e desce
  const lon = interpolate(gira, [0, 1], [-38, -8]) + mergulho * (g.somaliaPolo[0] - 2 - (-8));
  const lat = interpolate(mergulho, [0, 1], [8, 4.2]);
  const R = 330 * Math.pow(3500 / 330, Math.pow(mergulho, 1.6));
  const cx = W / 2 + interpolate(mergulho, [0, 1], [0, 300]);
  return {lon, lat, R, cx, cy: H / 2, mergulho};
};

export const Globo: React.FC<{frase?: string; alvo?: Alvo}> = ({frase = 'Pense na África.', alvo = 'somalia'}) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => (TEX ? null : delayRender('textura')));
  const [pronto, setPronto] = useState(!!TEX);
  useEffect(() => {
    if (TEX) return;
    const img = new Image();
    img.src = staticFile('terra-nasa-3840.jpg');
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d')!; x.drawImage(img, 0, 0);
      TEX = {d: x.getImageData(0, 0, img.width, img.height).data, w: img.width, h: img.height};
      setPronto(true);
      if (h !== null) setTimeout(() => continueRender(h), 0);
    };
  }, []);
  const st = estado(f, alvo);
  const soma = alvo === 'somalia';
  useLayoutEffect(() => {
    if (!TEX || !ref.current) return;
    const ctx = ref.current.getContext('2d')!;
    const out = ctx.createImageData(W, H); const o = out.data;
    const {lon, lat, R, cx, cy} = st;
    const l0 = lon * Math.PI / 180, p0 = lat * Math.PI / 180, sp = Math.sin(p0), cp = Math.cos(p0);
    const {d, w, h: th} = TEX;
    const blur = st.mergulho; // tom: dessatura um pouco e esquenta (identidade escura)
    const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(H, Math.ceil(cy + R));
    for (let py = y0; py < y1; py++) {
      const y = -(py - cy) / R; const yy = y * y;
      if (yy > 1) continue;
      const half = Math.sqrt(1 - yy) * R;
      const xa = Math.max(0, Math.floor(cx - half)), xb = Math.min(W, Math.ceil(cx + half));
      for (let px = xa; px < xb; px++) {
        const x = (px - cx) / R; const rho2 = x * x + yy; if (rho2 > 1) continue;
        const rho = Math.sqrt(rho2), z = Math.sqrt(1 - rho2);
        // inversa ortográfica
        const phi = rho === 0 ? p0 : Math.asin(z * sp + y * cp);
        const lam = l0 + Math.atan2(x, z * cp - y * sp);
        let u = ((lam / (2 * Math.PI)) + 0.5) % 1; if (u < 0) u += 1;
        const v = 0.5 - phi / Math.PI;
        const ti = ((Math.min(th - 1, (v * th) | 0) * w) + ((u * w) | 0)) * 4;
        // luz: escurece na borda (limbo) e um lado mais escuro
        const luz = (0.35 + 0.65 * Math.pow(z, 0.55)) * (0.82 + 0.18 * (x * -0.5 + y * 0.4 + 0.5));
        let r = d[ti], gg = d[ti + 1], b = d[ti + 2];
        const lum = 0.3 * r + 0.59 * gg + 0.11 * b;
        const sat = 0.72;
        r = (lum + (r - lum) * sat) * 1.04; gg = (lum + (gg - lum) * sat) * 0.99; b = (lum + (b - lum) * sat) * 0.9;
        if (b > r + 8 && b > gg) { r = r * 0.55 + 14; gg = gg * 0.62 + 16; b = b * 0.42 + 16; } // mar: tira o azul-marinho
        const k = (px + py * W) * 4;
        o[k] = r * luz; o[k + 1] = gg * luz; o[k + 2] = b * luz; o[k + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  }, [f, pronto]);
  const proj = geoOrthographic().rotate([-st.lon, -st.lat]).scale(st.R).translate([st.cx, st.cy]).clipAngle(90);
  const path = geoPath(proj);
  const lw = 1;
  const somIn = soma ? prog(f, s(5.2), s(6.4)) : 0;
  const somFill = prog(f, s(6.6), s(7.4));
  const pol = proj(g.somaliaPolo as [number, number]);
  const est = f >= s(7.1) ? approach(f, s(7.1), 0, 1, 0.16) : 0;
  const texto = alvo === 'gira' ? 0 : prog(f, s(0.6), s(1.4)) * (1 - prog(f, s(2.4), s(3.0)));
  const nome = soma ? prog(f, s(7.6), s(8.6)) : 0;
  const fundo = soma ? 1 - 0.55 * prog(f, s(6.4), s(7.6)) : 1 - 0.75 * (alvo === 'africa' ? prog(f, s(4.0), s(5.0)) : 0); // satélite escurece quando a Somália ganha a bandeira
  return (
    <AbsoluteFill style={{background: T.bg}}>
      <canvas ref={ref} width={W} height={H} style={{position: 'absolute', filter: `brightness(${fundo}) blur(${soma ? prog(f, s(6.2), s(7.6)) * 3 : 0}px)`}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <path d={path({type: 'Sphere'}) || ''} fill="none" stroke={T.papel} strokeOpacity={0.18} strokeWidth={1.2} />
        <path d={path(g.fronteiras as any) || ''} fill="none" stroke={T.papel} strokeOpacity={0.22 + 0.2 * st.mergulho} strokeWidth={lw} />
        {somIn > 0 && (
          <>
            <clipPath id="som"><path d={path(g.somalia as any) || ''} /></clipPath>
            <g clipPath="url(#som)" opacity={somFill}>
              <rect width={W} height={H} fill={T.azul} />
              {pol && <path d={estrela(pol[0], pol[1], 105 * est)} fill="#fff" />}
            </g>
            <path d={path(g.somalia as any) || ''} fill="none" stroke={T.papel} strokeWidth={2.4} pathLength={1} strokeDasharray={`${somIn} 1`} />
          </>
        )}
      </svg>
      <div style={{position: 'absolute', width: '100%', top: 860, textAlign: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: 64, color: T.papel, opacity: texto}}>{frase}</div>
      {nome > 0 && (
        <div style={{position: 'absolute', left: 230, top: 420, opacity: nome, transform: `translateY(${(1 - nome) * 16}px)`}}>
          <div style={{fontFamily: T.sans, fontWeight: 600, fontSize: 30, letterSpacing: '0.32em', color: T.azul, marginBottom: 14}}>CHIFRE DA ÁFRICA</div>
          <div style={{fontFamily: T.serif, fontSize: 150, lineHeight: 0.95, color: T.papel}}>Somália</div>
          <div style={{fontFamily: T.serif, fontStyle: 'italic', fontSize: 40, color: T.papelMeio, marginTop: 18}}>de frente para o oceano Índico</div>
        </div>
      )}
      <Grao />
    </AbsoluteFill>
  );
};
