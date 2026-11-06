import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, OffthreadVideo, continueRender, delayRender, staticFile} from 'remotion';
import {Lottie, LottieAnimationData} from '@remotion/lottie';

// Ponte EffectCraft -> Remotion: à esquerda o Lottie exportado, à direita o ProRes 4444 com alfa.
const Teste: React.FC = () => {
  const [dados, setDados] = useState<LottieAnimationData | null>(null);
  const [h] = useState(() => delayRender('lottie'));
  useEffect(() => {
    fetch(staticFile('craft/cartao.json')).then((r) => r.json()).then((j) => {setDados(j); continueRender(h);});
  }, [h]);
  return (
    <AbsoluteFill style={{background: '#F5F5F7', flexDirection: 'row'}}>
      <div style={{width: 960, height: 1080, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 800, height: 800}}>{dados ? <Lottie animationData={dados} /> : null}</div>
      </div>
      <div style={{width: 960, height: 1080, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <OffthreadVideo src={staticFile('craft/cartao.mov')} transparent style={{width: 800, height: 800}} />
      </div>
    </AbsoluteFill>
  );
};

export const Raiz: React.FC = () => (
  <Composition id="TesteCraft" component={Teste} width={1920} height={1080} fps={30} durationInFrames={75} />
);
