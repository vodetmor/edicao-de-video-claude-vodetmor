import React from 'react';
import {C} from './theme';
import {Player, PlayerState} from './Player';
import {Cam, camCss, camPt, PLAYER_SHADOW, Rect, WIN} from './scenes/Common';

// The player seen through the feature camera, in three layers that share the camera:
// 1) the video box, cut to the part of it inside `win` with rounded corners, its shadow redrawn on that rect;
// 2) what sits around the player (CTA, tooltips, the diamond), cut to `win` so it never reaches the text column;
// 3) the hand (cursor, click rings), never cut: it may come in from outside the frame.
// At rest (scale 1) nothing is cut and the player draws exactly as before.
export const CamStage: React.FC<{
  cam: Cam;
  st: PlayerState;
  win?: Rect;
  radius?: number; // screen radius of the visible rect; defaults to the player's own radius at this scale
  around?: React.ReactNode;
  hand?: React.ReactNode;
}> = ({cam, st, win = WIN, radius, around, hand}) => {
  const tf = camCss(cam);
  const p0 = camPt(cam, st.x, st.y);
  const p1 = camPt(cam, st.x + st.w, st.y + st.h);
  const zoomed = cam.s > 1.001;
  const vis: Rect = {l: Math.max(p0.x, win.l), t: Math.max(p0.y, win.t), r: Math.min(p1.x, win.r), b: Math.min(p1.y, win.b)};
  const rad = radius ?? (st.radius ?? 12) * cam.s;
  const sh = st.shadow ?? 1;
  const clip = (q: Rect, rr: number) => `inset(${q.t}px ${1920 - q.r}px ${1080 - q.b}px ${q.l}px round ${rr}px)`;
  const world = (children: React.ReactNode) => <div style={{position: 'absolute', inset: 0, transform: tf, transformOrigin: '0 0'}}>{children}</div>;
  return (
    <>
      {zoomed ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: vis.l,
              top: vis.t,
              width: Math.max(0, vis.r - vis.l),
              height: Math.max(0, vis.b - vis.t),
              borderRadius: rad,
              background: C.player,
              boxShadow: sh > 0 ? PLAYER_SHADOW : undefined,
            }}
          />
          <div style={{position: 'absolute', inset: 0, clipPath: clip(vis, rad)}}>{world(<Player st={{...st, shadow: 0}} part="box" />)}</div>
          <div style={{position: 'absolute', inset: 0, clipPath: clip(win, 0)}}>
            {world(
              <>
                <Player st={st} part="cta" />
                {around}
              </>,
            )}
          </div>
        </>
      ) : (
        world(
          <>
            <Player st={st} />
            {around}
          </>,
        )
      )}
      {hand && world(hand)}
    </>
  );
};
