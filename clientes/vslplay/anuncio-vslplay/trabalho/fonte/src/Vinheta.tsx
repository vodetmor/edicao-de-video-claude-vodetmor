import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, TEXT} from './theme';
import {useFonts} from './Fonts';
import {useTextures} from './Ad';
import {Opening} from './scenes/Opening';

// The logo animation on its own (7.5 s), for the start or the end of any video: the dot bounces, the play
// triangle snaps, the three ribbons fall onto it as paper flaps, the button is pressed, the dot lands, the
// wordmark writes itself and the dot gives its last hop. Same code as the ad's opening.
export const VINHETA_FRAMES = 225;
export const WINK_STING = 182;

export const Vinheta: React.FC<{transparent?: boolean}> = ({transparent}) => {
  useFonts();
  useTextures();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: transparent ? undefined : C.black, fontFamily: TEXT}}>
      <Opening f={f} sting={{cy: 540, wink: WINK_STING, transparent}} />
    </AbsoluteFill>
  );
};

// the same animation on a transparent background, for editors to lay over their own footage (ProRes 4444)
export const VinhetaAlpha: React.FC = () => <Vinheta transparent />;
