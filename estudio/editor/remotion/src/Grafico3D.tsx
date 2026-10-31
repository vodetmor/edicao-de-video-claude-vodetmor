// Gráfico de colunas 3D (Vítor 31/10: "algo realmente útil em 3D, tipo um gráfico 3D", no lugar de objetos soltos).
// Colunas com cantos arredondados sobem em mola, a câmera gira devagar em volta, valor em cima e rótulo embaixo
// desenhados em canvas e presos à coluna (giram junto).
import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {clamp, mola, useQuadroBase} from './kit';

export type Coluna = {rotulo: string; valor: number; texto: string; cor: string};

const colunaGeo = (() => {
  const r = 0.12, l = 1;
  const s = new THREE.Shape();
  s.moveTo(-l / 2 + r, -l / 2);
  s.lineTo(l / 2 - r, -l / 2); s.quadraticCurveTo(l / 2, -l / 2, l / 2, -l / 2 + r);
  s.lineTo(l / 2, l / 2 - r); s.quadraticCurveTo(l / 2, l / 2, l / 2 - r, l / 2);
  s.lineTo(-l / 2 + r, l / 2); s.quadraticCurveTo(-l / 2, l / 2, -l / 2, l / 2 - r);
  s.lineTo(-l / 2, -l / 2 + r); s.quadraticCurveTo(-l / 2, -l / 2, -l / 2 + r, -l / 2);
  // perfil quadrado extrudado para cima: altura 1, escala em y dá o valor
  const g = new THREE.ExtrudeGeometry(s, {depth: 1, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 10});
  g.rotateX(-Math.PI / 2);
  return g;
})();

const placa = (texto: string, cor: string, peso: number, tam: number, larg = 512) => {
  const c = document.createElement('canvas');
  c.width = larg; c.height = 160;
  const x = c.getContext('2d')!;
  x.font = `${peso} ${tam}px 'Inter Variable', Inter, sans-serif`;
  x.fillStyle = cor;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(texto, larg / 2, 80);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const Grafico3D: React.FC<{ini: number; colunas: Coluna[]; titulo?: string; nota?: string; fpsBase?: number; altura?: number}> = ({ini, colunas, titulo, nota, fpsBase = 30, altura = 0.5}) => {
  const f = useQuadroBase(fpsBase);
  const {width, height} = useVideoConfig();
  const h = Math.round(height * altura);
  const max = Math.max(...colunas.map((c) => c.valor));
  const placas = useMemo(() => colunas.map((c) => ({v: placa(c.texto, '#FFFFFF', 800, 104), r: placa(c.rotulo, 'rgba(255,255,255,.85)', 600, 50, 640)})), [colunas]);
  const tit = useMemo(() => (titulo ? placa(titulo, '#FFFFFF', 700, 56, 900) : null), [titulo]);
  const nt = useMemo(() => (nota ? placa(nota, 'rgba(255,255,255,.55)', 500, 36, 900) : null), [nota]);
  const t = (f - ini) / 30;
  const giro = -0.5 + clamp(mola(f, ini, 0.06, 0.9)) * 0.38 + Math.sin(t * 0.5) * 0.06; // entra de lado e assenta, depois respira
  const n = colunas.length;
  const passo = 1.5;
  return (
    <ThreeCanvas width={width} height={h} style={{position: 'absolute', left: 0, top: 0}} camera={{position: [0, 2.6, 9.4], fov: 32}}
      gl={{antialias: true, alpha: true}} onCreated={({camera}) => camera.lookAt(0, 1.45, 0)}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 5]} intensity={2.0} />
      <directionalLight position={[-5, 2, -2]} intensity={0.7} />
      <group rotation={[0, giro, 0]} position={[0, 0, 0]}>
        {/* chão: placa fina com grade leve */}
        <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[n * passo + 1.4, 2.6]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.08} />
        </mesh>
        {colunas.map((c, i) => {
          const x = (i - (n - 1) / 2) * passo;
          const e = clamp(mola(f, ini + 6 + i * 8, 0.14, 0.72), 0, 1.08);
          const alt = Math.max(0.04, (c.valor / max) * 2.6 * e);
          const op = clamp((f - ini - 14 - i * 8) / 8);
          return (
            <group key={i} position={[x, 0, 0]}>
              <mesh geometry={colunaGeo} scale={[1, alt, 1]}>
                <meshStandardMaterial color={c.cor} roughness={0.32} metalness={0.15} />
              </mesh>
              <mesh position={[0, alt + 0.42, 0.5]}>
                <planeGeometry args={[1.6, 0.5]} />
                <meshBasicMaterial map={placas[i].v} transparent opacity={op} depthWrite={false} />
              </mesh>
              <mesh position={[0, -0.32, 0.75]} rotation={[-0.5, 0, 0]}>
                <planeGeometry args={[2.0, 0.5]} />
                <meshBasicMaterial map={placas[i].r} transparent opacity={clamp((f - ini - 4) / 8)} depthWrite={false} />
              </mesh>
            </group>
          );
        })}
      </group>
      {tit && (
        <mesh position={[0, 3.55, 0]}>
          <planeGeometry args={[4.2, 0.75]} />
          <meshBasicMaterial map={tit} transparent opacity={clamp((f - ini) / 8)} depthWrite={false} />
        </mesh>
      )}
      {nt && (
        <mesh position={[0, -0.95, 0.9]}>
          <planeGeometry args={[4.2, 0.75]} />
          <meshBasicMaterial map={nt} transparent opacity={clamp((f - ini - 20) / 8)} depthWrite={false} />
        </mesh>
      )}
    </ThreeCanvas>
  );
};
