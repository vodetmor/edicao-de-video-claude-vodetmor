import React from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {C, TEXT} from './theme';
import {useFonts} from './Fonts';
import {LAYOUT, nSamples, PLAYBACK, Samples} from './kit';
import {rateAt, srcAt} from './warp';
import {TEXTURES} from './Logo';
import {Opening} from './scenes/Opening';
import {Chapter1} from './scenes/Chapter1';
import {Chapter2} from './scenes/Chapter2';
import {Chapter3} from './scenes/Chapter3';
import {Integr, More, Price} from './scenes/Late';
import {Finale} from './scenes/Finale';
import {WHIP, whipX} from './scenes/Common';
import {Chrome} from './scenes/Chrome';

// Every render tab decodes the logo textures before its first frame; the decoded images are kept alive so
// later <image> elements load them from memory.
const KEEP: HTMLImageElement[] = [];
export const useTextures = () => {
  const [handle] = React.useState(() => delayRender('logo textures', {timeoutInMilliseconds: 60000}));
  React.useEffect(() => {
    Promise.all(
      TEXTURES.map((name) => {
        const img = new Image();
        img.src = staticFile(name);
        KEEP.push(img);
        return img.decode().catch(() => undefined);
      }),
    ).then(() => continueRender(handle));
  }, [handle]);
};

// Chapter 3 -> price: a lateral whip, both stages on one strip, true motion blur along x; the price rows
// ride the strip on springs (follow-through), so they are sampled at the sub-frame time too.
const WHIP_SHUTTER = 0.6;

export const Ad: React.FC = () => {
  useFonts();
  useTextures();
  // the narrated cut plays the original 48 s timeline through a piecewise time map (src/warp.ts, made by warp.py)
  const fo = useCurrentFrame();
  const f = srcAt(fo);
  PLAYBACK.rate = rateAt(fo);
  LAYOUT.vertical = false;
  return <Stage f={f} fo={fo} />;
};

// The 1920x1080 stage at source frame f (fo: output frame, for the chrome's readout). The vertical cut
// (src/Vertical.tsx) frames panels of this same stage.
export const Stage: React.FC<{f: number; fo: number; chrome?: boolean}> = ({f, fo, chrome = true}) => {
  // enough samples to keep them 16 px apart, each smeared along x to close the gap between neighbours
  const disp = Math.abs(whipX(f + (WHIP_SHUTTER * PLAYBACK.rate) / 2) - whipX(f - (WHIP_SHUTTER * PLAYBACK.rate) / 2));
  const n = nSamples(disp, 16, 24);
  const gapX = n > 1 ? (0.55 * disp) / (n - 1) : 0;
  return (
    <AbsoluteFill style={{background: C.black, fontFamily: TEXT}}>
      <Opening f={f} />
      <Chapter1 f={f} />
      <Chapter2 f={f} />
      {f < WHIP.a && <Chapter3 f={f} />}
      {f >= WHIP.a && f <= WHIP.b && (
        <Samples
          f={f}
          n={n}
          shutter={WHIP_SHUTTER}
          gap={{x: gapX}}
          render={(ff) => (
            <>
              <AbsoluteFill style={{transform: `translateX(${whipX(ff)}px)`}}>
                <Chapter3 f={f} />
              </AbsoluteFill>
              <AbsoluteFill style={{transform: `translateX(${whipX(ff) + 1920}px)`}}>
                <Price f={f} ft={ff} />
              </AbsoluteFill>
            </>
          )}
        />
      )}
      {f > WHIP.b && <Price f={f} />}
      <More f={f} />
      <Integr f={f} />
      <Finale f={f} />
      {chrome && <Chrome f={f} fo={fo} />}
    </AbsoluteFill>
  );
};
