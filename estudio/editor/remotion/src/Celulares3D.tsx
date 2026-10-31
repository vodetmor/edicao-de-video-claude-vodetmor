// Versão 3D da vitrine (Jerônimo 31/10: "devia mostrar algo que se usa 3D em vídeos", não formas soltas):
// celulares 3D (motion-base/componentes/iphone-3d) entram girando de costas para frente ao lado da pessoa,
// cada tela mostrando uma das versões editadas. Um fica atrás da pessoa, outro na frente (duas camadas).
import React, {useEffect, useState} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {continueRender, delayRender, staticFile, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {IPhone3D, type V3} from './iphone/IPhone3D';
import {clamp, mola, useQuadroBase} from './kit';

const useTexturas = (srcs: string[]) => {
  const chave = srcs.join('|');
  const [tex, setTex] = useState<(THREE.Texture | null)[]>(() => srcs.map(() => null));
  const [h] = useState(() => delayRender(`telas ${chave}`));
  useEffect(() => {
    Promise.all(srcs.map((src) => new Promise<THREE.Texture | null>((ok) => new THREE.TextureLoader().load(staticFile(src), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      ok(t);
    }, undefined, () => ok(null))))).then((ts) => {
      setTex(ts);
      continueRender(h);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, h]);
  return tex;
};

export type Cel = {tela: string; x: number; y: number; giro: number; atraso: number; inclina?: number; escala?: number}; // x/y em unidades da cena (quadro inteiro ≈ 2,07 × 3,69)

export const Celulares3D: React.FC<{ini: number; cels: Cel[]; lado: 'atras' | 'frente'; fpsBase?: number}> = ({ini, cels, lado, fpsBase = 30}) => {
  const f = useQuadroBase(fpsBase);
  const {width, height} = useVideoConfig();
  // texturas carregadas ANTES de montar o canvas: textura que chega depois do primeiro quadro sai preta
  const telas = useTexturas(cels.map((c) => c.tela));
  const meus = cels.map((c, i) => ({c, tela: telas[i]})).filter((_, i) => (lado === 'frente') === (i % 2 === 0));
  if (telas.some((t) => !t)) return null;
  return (
    <ThreeCanvas width={width} height={height} style={{position: 'absolute', inset: 0}} camera={{position: [0, 0, 8], fov: 26}}
      gl={{antialias: true, alpha: true}}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <directionalLight position={[-4, 1, -3]} intensity={0.8} />
      {meus.map(({c, tela}) => <Um key={c.tela} c={c} tela={tela} f={f} ini={ini} />)}
    </ThreeCanvas>
  );
};

const Um: React.FC<{c: Cel; tela: THREE.Texture | null; f: number; ini: number}> = ({c, tela, f, ini}) => {
  const a = ini + c.atraso;
  const e = clamp(mola(f, a, 0.11, 0.78), 0, 1.06); // entra de costas e vira (mola amortecida: sem tremido)
  const t = (f - a) / 30;
  const flut = Math.sin(t * 1.4 + c.x) * 0.06;
  const pos: V3 = [c.x + (1 - e) * Math.sign(c.x) * 0.9, c.y + flut - (1 - e) * 0.6, 0];
  const rot: V3 = [0.08 + (c.inclina ?? 0) + Math.sin(t * 0.9) * 0.03, c.giro + (1 - e) * Math.PI * Math.sign(c.x) + Math.sin(t * 0.7) * 0.06, Math.sign(c.x) * -0.05];
  if (f < a - 1) return null;
  return <IPhone3D tela={tela} brilho={clamp((f - a - 10) / 8)} barra="clara" pos={pos} rot={rot} escala={clamp(e * 1.2, 0, 1) * (c.escala ?? 0.8)} />;
};
