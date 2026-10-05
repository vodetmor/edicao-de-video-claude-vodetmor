import React from 'react';
import {Composition} from 'remotion';
import {Ad} from './Ad';
import {DURATION, FPS} from './timeline';
import {Vertical, VerticalSrc} from './Vertical';
import {OUT_DURATION} from './warp';
import {Vinheta, VinhetaAlpha, VINHETA_FRAMES} from './Vinheta';
import {C2, C2_FRAMES} from './criativos/C2';
import {C3, C3_FRAMES} from './criativos/C3';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Anuncio" component={Ad} durationInFrames={OUT_DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="Vertical" component={Vertical} durationInFrames={OUT_DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="VerticalSrc" component={VerticalSrc} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="Vinheta" component={Vinheta} durationInFrames={VINHETA_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="VinhetaAlpha" component={VinhetaAlpha} durationInFrames={VINHETA_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="C3" component={C3} durationInFrames={C3_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="C2" component={C2} durationInFrames={C2_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
