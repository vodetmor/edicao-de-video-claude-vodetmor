import React from 'react';
import {Composition} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {Vinheta} from './Vinheta';
import {T} from './tempo';

// Final com motion blur de câmera (obturador 180°, 8 amostras); "blur: false" para quadros-chave rápidos.
const ComBlur: React.FC<{vertical: boolean; blur: boolean}> = ({vertical, blur}) =>
  blur ? (
    <CameraMotionBlur shutterAngle={180} samples={8}>
      <Vinheta vertical={vertical} />
    </CameraMotionBlur>
  ) : (
    <Vinheta vertical={vertical} />
  );

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Vinheta169" component={ComBlur} durationInFrames={T.fim} fps={30} width={1920} height={1080} defaultProps={{vertical: false, blur: true}} />
    <Composition id="Vinheta916" component={ComBlur} durationInFrames={T.fim} fps={30} width={1080} height={1920} defaultProps={{vertical: true, blur: true}} />
  </>
);
