// Objetos 3D girando em volta da pessoa recortada. A mesma cena é desenhada duas vezes: atrás da pessoa só os
// objetos do lado de trás da órbita, na frente só os da frente; assim eles passam por trás da cabeça de verdade.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {clamp, mola} from './kit';

type Obj = {forma: 'play' | 'anel' | 'cubo' | 'capsula' | 'esfera'; fase: number; raio: number; alt: number; tam: number; cor: string};

const OBJS: Obj[] = [
  {forma: 'play', fase: 0, raio: 1.9, alt: 0.4, tam: 0.8, cor: '#1A1A1C'},
  {forma: 'anel', fase: 1.25, raio: 2.0, alt: -0.6, tam: 0.75, cor: '#1A1A1C'},
  {forma: 'cubo', fase: 2.5, raio: 1.8, alt: 1.2, tam: 0.6, cor: '#F4F4F2'},
  {forma: 'capsula', fase: 3.75, raio: 2.0, alt: -1.3, tam: 0.6, cor: '#1A1A1C'},
  {forma: 'esfera', fase: 5.0, raio: 1.9, alt: 0.0, tam: 0.55, cor: '#F4F4F2'},
];

const triangulo = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.45, -0.55); s.lineTo(0.62, 0); s.lineTo(-0.45, 0.55); s.closePath();
  return new THREE.ExtrudeGeometry(s, {depth: 0.32, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 6});
})();

const Forma: React.FC<{o: Obj; cor?: string}> = ({o, cor}) => {
  const mat = <meshStandardMaterial color={cor ?? o.cor} roughness={0.28} metalness={o.cor === '#1A1A1C' ? 0.55 : 0.1} />;
  if (o.forma === 'play') return <mesh geometry={triangulo}>{mat}</mesh>;
  if (o.forma === 'anel') return <mesh><torusGeometry args={[0.55, 0.2, 32, 96]} />{mat}</mesh>;
  if (o.forma === 'cubo') return <mesh><boxGeometry args={[0.9, 0.9, 0.9, 4, 4, 4]} />{mat}</mesh>;
  if (o.forma === 'capsula') return <mesh><capsuleGeometry args={[0.32, 0.7, 12, 32]} />{mat}</mesh>;
  return <mesh><sphereGeometry args={[0.55, 48, 48]} />{mat}</mesh>;
};

// cores: paleta do vídeo (tema, tinta, papel); sem ela, preto e osso
export const Orbita: React.FC<{ini: number; lado: 'atras' | 'frente'; centroY?: number; cores?: string[]}> = ({ini, lado, centroY = 0.8, cores}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = (f - ini) / 30;
  const entra = mola(f, ini, 0.12, 0.7);
  return (
    <ThreeCanvas width={width} height={height} style={{position: 'absolute', inset: 0}} camera={{position: [0, 0, 9], fov: 38}}
      gl={{antialias: true, alpha: true}}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 6]} intensity={2.2} />
      <directionalLight position={[-6, -2, -4]} intensity={1.1} />
      {OBJS.map((o, i) => {
        const ang = o.fase + t * 0.9;
        const z = Math.cos(ang);
        if ((lado === 'frente') !== (z > 0)) return null;
        const r = o.raio * (0.4 + 0.6 * entra);
        const s = o.tam * clamp(mola(f, ini + i * 3, 0.16, 0.65), 0, 1.2);
        return (
          <group key={i} position={[Math.sin(ang) * r, o.alt + centroY + Math.sin(t * 1.3 + i) * 0.12, z * r * 0.8]}
            rotation={[t * 0.7 + i, t * 1.1 + i * 2, t * 0.4]} scale={s}>
            <Forma o={o} cor={cores ? cores[i % cores.length] : undefined} />
          </group>
        );
      })}
    </ThreeCanvas>
  );
};
