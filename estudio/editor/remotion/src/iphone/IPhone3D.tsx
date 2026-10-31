// Celular 3D estilo iPhone para Remotion (@remotion/three). O modelo está em iphone.js (three.js puro).
// Uso: dentro de <ThreeCanvas>, <IPhone3D tela={textura} rolagem={0.3} cor="natural" pos={[0, 0, 0]} rot={[0, 0.2, 0]} />.
// Render com --gl=angle. Textura carregada depois do primeiro quadro: invalide o canvas (ver Renovador em tres.tsx da Luiza).
import React, {useEffect, useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {ambienteEstudio, criarIPhone, type Barra, type CorIPhone} from './iphone.js';

export type V3 = [number, number, number];
export type IPhone3DProps = {
  /** Imagem, canvas ou vídeo da tela. Sem tela = apagada. */
  tela?: THREE.Texture | null;
  /** Altura/largura da imagem; se faltar, lê da própria imagem. */
  razao?: number;
  /** true: a imagem começa abaixo da barra de status (print de site no Safari). */
  areaSegura?: boolean;
  /** 0 = topo da imagem, 1 = fim (só rola se a imagem for mais alta que a tela). */
  rolagem?: number;
  /** 0 = tela apagada, 1 = normal. */
  brilho?: number;
  cor?: CorIPhone;
  barra?: Barra;
  hora?: string;
  pos?: V3;
  rot?: V3;
  escala?: number;
};

export const IPhone3D: React.FC<IPhone3DProps> = ({
  tela = null, razao, areaSegura = false, rolagem = 0, brilho = 1, cor = 'natural', barra = 'clara', hora = '9:41',
  pos = [0, 0, 0], rot = [0, 0, 0], escala = 1,
}) => {
  const {gl} = useThree();
  const cel = useMemo(() => criarIPhone(), []);
  useEffect(() => () => cel.dispose(), [cel]);
  useMemo(() => cel.setAmbiente(ambienteEstudio(gl)), [cel, gl]);
  useMemo(() => cel.setCor(cor), [cel, cor]);
  useMemo(() => cel.setBarra(barra, hora), [cel, barra, hora]);
  // a cada quadro (Remotion re-renderiza por frame): tela, rolagem e brilho
  cel.setTela(tela, {razao, areaSegura}).setRolagem(rolagem).setBrilho(brilho);
  return <primitive object={cel.objeto} position={pos} rotation={rot} scale={escala} />;
};
