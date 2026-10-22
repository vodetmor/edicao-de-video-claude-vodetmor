// Composição de demonstração (8 s, 30 fps): traseira, vira, liga a tela, abre um site e rola.
// Registro no Root: <Composition id="DemoIPhone" component={DemoIPhone} durationInFrames={240} fps={30} width={1080} height={1350} />
// Precisa de public/exemplo-site.jpg (está nesta pasta).
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {IPhone3D} from './IPhone3D';
import {desenhaBloqueio, poseDemo} from './iphone.js';

const useTextura = (src: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender(`textura ${src}`));
  useEffect(() => {
    new THREE.TextureLoader().load(staticFile(src), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
      continueRender(h);
    }, undefined, () => continueRender(h));
  }, [src, h]);
  return tex;
};

export const DemoIPhone: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const site = useTextura('exemplo-site.jpg');
  const bloqueio = useMemo(() => desenhaBloqueio(), []);
  const p = poseDemo(frame / fps);
  const noSite = p.tela === 'site';
  return (
    <AbsoluteFill style={{backgroundColor: '#f6f5f2'}}>
      {site && (
        <ThreeCanvas width={width} height={height} camera={{fov: 26, position: [0, 0.03, 4.4]}} gl={{antialias: true}}
          style={{opacity: 1 - p.sumir}}>
          <directionalLight position={[2.5, 3, 4]} intensity={1.1} />
          <ambientLight intensity={0.25} />
          <IPhone3D tela={noSite ? site : bloqueio} areaSegura={noSite} barra={noSite ? 'escura' : 'clara'}
            rolagem={p.rolagem} brilho={p.brilho} pos={p.pos} rot={p.rot} />
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};
