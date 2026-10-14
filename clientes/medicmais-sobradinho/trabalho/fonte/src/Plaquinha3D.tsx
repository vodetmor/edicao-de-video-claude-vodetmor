// Cena K18 em 3D real (three.js via @remotion/three): a plaquinha NFC do Google Meu Negócio no balcão,
// o celular chega, encosta ("tim"), a tela de avaliação do Google abre e as estrelas acendem.
// Render precisa de --gl=angle. Texturas em public/tex (texturas/gera.py).
import React, {useLayoutEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {clamp, E, lerp, prog, spring} from './kit';

type V3 = [number, number, number];
const mix3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

const useTex = (src: string) => {
  const [h] = useState(() => delayRender('textura ' + src));
  return useMemo(() => {
    const t = new THREE.TextureLoader().load(
      staticFile(src),
      () => continueRender(h),
      undefined,
      () => continueRender(h),
    );
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
};

const Ambiente: React.FC = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

const Camera: React.FC<{pos: V3; look: V3}> = ({pos, look}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
};

// geometria
const PW = 1.0, PH = 1.25, PD = 0.05; // plaquinha
const FW = 0.62, FH = 1.3, FD = 0.075; // celular
const PLACA_Z = -0.12, PLACA_Y = 0.1 + PH / 2, YAW = -0.22, TILT = -0.09;
// ponto do ícone NFC na face (textura: centro do ícone a 0,676 da altura, de cima)
const NFC_LOCAL_Y = PH / 2 - 0.676 * PH;

export type Marcas = {plaquinha: number; balcao: number; aproxima: number; toca: number; tela: number; abre: number; estrelas: number; len: number};

export const Plaquinha3D: React.FC<{f: number; m: Marcas}> = ({f, m}) => {
  const face = useTex('tex/placa.png');
  const travada = useTex('tex/tela-travada.png');
  const aval = [0, 1, 2, 3, 4, 5].map((n) => useTex(`tex/tela-avaliacao-${n}.png`)); // eslint-disable-line react-hooks/rules-of-hooks
  const geoPlaca = useMemo(() => new RoundedBoxGeometry(PW, PH, PD, 6, 0.07), []);
  const geoFone = useMemo(() => new RoundedBoxGeometry(FW, FH, FD, 8, 0.09), []);
  const geoBase = useMemo(() => new RoundedBoxGeometry(PW * 1.08, 0.1, 0.34, 4, 0.03), []);

  // --- plaquinha: sobe girando e pousa na palavra "plaquinha"
  const pe = spring(f, m.plaquinha - 30, 0.14, 0.8);
  const placaY = lerp(-1.9, PLACA_Y, clamp(pe, 0, 1.2));
  const placaYaw = lerp(-Math.PI * 2 - 0.9, YAW, pe);
  const baseOn = E.expr(prog(f, m.plaquinha - 8, 14));

  // --- celular: entra pela direita, encosta no NFC, depois vem para a câmera de frente
  const toca = m.toca;
  const fora: V3 = [2.3, 0.0, -0.1];
  const encosta: V3 = [0.05, 0.33, PLACA_Z + 0.3];
  const frente: V3 = [0.02, 0.98, 1.25];
  const a1 = E.expr(prog(f, m.aproxima - 12, toca - (m.aproxima - 12)));
  const a2 = E.cam(prog(f, m.tela - 6, 40));
  let fone = mix3(fora, encosta, a1);
  fone = mix3(fone, frente, a2);
  // micro-recuo no toque (o "tim")
  const bump = f >= toca ? Math.sin(clamp((f - toca) / 8) * Math.PI) * 0.03 : 0;
  fone = [fone[0], fone[1], fone[2] + bump];
  const boia = a2 * Math.sin((f - m.tela) * 0.05);
  fone = [fone[0], fone[1] + 0.02 * boia, fone[2]];
  const foneRot: V3 = [
    lerp(lerp(-0.35, -0.1, a1), 0.04 * boia, a2),
    lerp(lerp(-1.0, YAW + 0.05, a1), 0.12 * Math.sin((f - m.tela) * 0.035), a2),
    lerp(lerp(0.5, -0.2, a1), 0, a2),
  ];
  const nEstrelas = clamp(Math.floor((f - m.estrelas) / 5) + 1, 0, 5);
  const tela = f < toca + 4 ? travada : aval[f < m.estrelas ? 0 : nEstrelas];

  // --- câmera
  const c0: V3 = [-0.3, 1.0, 4.6], l0: V3 = [0, 0.66, PLACA_Z];
  const c1: V3 = [1.9, 2.05, 5.0], l1: V3 = [0.1, 0.5, 0];
  const c2: V3 = [1.35, 1.35, 4.7], l2: V3 = [0.14, 0.6, 0.1];
  const c3: V3 = [frente[0], frente[1] + 0.12, frente[2] + 4.4], l3: V3 = [frente[0], frente[1] + 0.14, frente[2]];
  const drift = prog(f, 0, m.len);
  const t1 = E.cam(prog(f, m.balcao - 10, 44));
  const t2 = E.cam(prog(f, m.aproxima - 10, 46));
  const t3 = E.cam(prog(f, m.tela - 6, 44));
  let cam = mix3(c0, c1, t1), look = mix3(l0, l1, t1);
  cam = mix3(cam, c2, t2);
  look = mix3(look, l2, t2);
  cam = mix3(cam, c3, t3);
  look = mix3(look, l3, t3);
  // nunca parado: órbita lenta contínua + aproximação
  cam = [cam[0] + 0.45 * Math.sin(drift * Math.PI * 1.5), cam[1] + 0.1 * Math.sin(drift * Math.PI), cam[2] - 0.35 * drift];

  // --- anéis NFC saindo do ícone no toque
  const nfcWorld = new THREE.Vector3(0, NFC_LOCAL_Y, PD / 2 + 0.01)
    .applyEuler(new THREE.Euler(TILT, YAW, 0))
    .add(new THREE.Vector3(0, PLACA_Y, PLACA_Z));

  return (
    <ThreeCanvas width={1080} height={1920} shadows style={{position: 'absolute', inset: 0}} camera={{fov: 30, near: 0.05, far: 50}}>
      <Camera pos={cam} look={look} />
      <Ambiente />
      <color attach="background" args={['#F4F5F7']} />
      <hemisphereLight args={['#ffffff', '#d9dbe0', 0.9]} />
      <directionalLight
        position={[-2.2, 4.2, 3.0]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-radius={6}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[3, 1.5, 2]} intensity={0.6} />
      {/* balcão: tampo branco, frente logo depois da plaquinha */}
      <mesh position={[0, -0.45, -1.2 + 0.06]} receiveShadow>
        <boxGeometry args={[9, 0.9, 2.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.55} />
      </mesh>
      {/* base de acrílico */}
      <mesh geometry={geoBase} position={[0, 0.05 - (1 - baseOn) * 0.3, PLACA_Z]} rotation={[0, YAW, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#ffffff" roughness={0.08} transmission={0.85} thickness={0.1} ior={1.5} clearcoat={1} transparent opacity={baseOn} />
      </mesh>
      {/* plaquinha */}
      <group position={[0, placaY, PLACA_Z]} rotation={[TILT, placaYaw, 0]}>
        <mesh geometry={geoPlaca} castShadow>
          <meshPhysicalMaterial color="#ffffff" roughness={0.06} transmission={0.8} thickness={0.05} ior={1.5} clearcoat={1} clearcoatRoughness={0.04} />
        </mesh>
        <mesh position={[0, 0, PD / 2 + 0.0015]}>
          <planeGeometry args={[PW - 0.03, PH - 0.03]} />
          <meshBasicMaterial map={face} transparent color="#f3f3f3" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -PD / 2 - 0.0015]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[PW - 0.03, PH - 0.03]} />
          <meshStandardMaterial color="#f1f1f3" roughness={0.5} />
        </mesh>
      </group>
      {/* anéis NFC */}
      {[0, 7, 14].map((d) => {
        const p = prog(f, toca - 3 + d, 22);
        if (p <= 0 || p >= 1) return null;
        return (
          <mesh key={d} position={nfcWorld} rotation={[TILT, YAW, 0]}>
            <ringGeometry args={[0.1 + 0.5 * p, 0.115 + 0.5 * p, 96]} />
            <meshBasicMaterial color="#EB2026" transparent opacity={0.9 * (1 - p)} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* celular */}
      {f >= m.aproxima - 14 && (
        <group position={fone} rotation={foneRot}>
          <mesh geometry={geoFone} castShadow>
            <meshPhysicalMaterial color="#1b1b21" metalness={0.5} roughness={0.28} clearcoat={1} clearcoatRoughness={0.1} />
          </mesh>
          <mesh position={[0, 0, FD / 2 + 0.0015]}>
            <planeGeometry args={[FW - 0.035, FH - 0.035]} />
            <meshBasicMaterial map={tela} transparent toneMapped={false} />
          </mesh>
        </group>
      )}
    </ThreeCanvas>
  );
};
