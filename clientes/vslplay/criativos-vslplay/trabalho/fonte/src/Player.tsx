// Faithful replica of the VSLPLAY player (cdn.vslplay.com/player.js + its CSS), rendered at REM = 22 px.
import React from 'react';
import {Freeze, OffthreadVideo, staticFile} from 'remotion';
import {ICONS} from './playerIcons';
import {C, DISPLAY, REM, TEXT} from './theme';
import {clamp, DirBlur, lerp} from './kit';

export const r = (rem: number) => rem * REM;

export const Icon: React.FC<{name: string; size: number; color?: string; style?: React.CSSProperties}> = ({name, size, color = '#F5F5F5', style}) => {
  const ic = ICONS[name];
  return (
    <svg
      viewBox={ic.vb}
      width={size}
      height={size}
      fill={ic.rootFill === 'none' ? 'none' : color}
      stroke={ic.stroke ? color : undefined}
      strokeWidth={ic.stroke ? ic.sw ?? 2 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{display: 'block', color, ...style}}
      dangerouslySetInnerHTML={{__html: ic.inner}}
    />
  );
};

// The presenter clip (free Mixkit footage, keyed over a studio gray) at an exact clip time.
// the vertical cut's ground layer only needs the stage's colors, so it skips the video decode
export const NoVideo = React.createContext(false);
export const Presenter: React.FC<{t: number}> = ({t}) => {
  const noVideo = React.useContext(NoVideo);
  if (noVideo) return <div style={{width: '100%', height: '100%', background: '#6E6E6E'}} />;
  const fr = Math.max(0, Math.min(476, Math.round(t * 30)));
  return (
    <Freeze frame={fr}>
      <OffthreadVideo src={staticFile('presenter.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </Freeze>
  );
};

export type ControlItems = {
  play: number;
  seek: number;
  current: number;
  duration: number;
  volume: number;
  volumeBar: number;
  speed: number;
  fullscreen: number;
};
export const ALL_ON: ControlItems = {play: 1, seek: 1, current: 1, duration: 1, volume: 1, volumeBar: 1, speed: 1, fullscreen: 1};

export type PlayerState = {
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  primary: string;
  primaryWipe?: {color: string; p: number}; // a new primary color wiping in from the left
  videoT: number; // presenter clip time, seconds
  dim?: number; // 0..1 black veil over the video
  smart?: {box: number; content: number; ping: number; collapse: number};
  keep?: {show: number; lift: number; blur?: number; pressA?: number};
  cover?: {show: number; settle: number};
  bigPlay?: number;
  controls?: {
    show: number;
    paused: boolean;
    time: string;
    dur: string;
    seek: number;
    fake: number;
    items?: ControlItems;
    flash?: Partial<ControlItems>; // 0..1: a control lights up in the primary color on the frame it is toggled
    knob?: number;
    marker?: {at: number; show: number; squash: number};
  };
  cta?: {show: number; grow: number; text?: string; press?: number};
  shadow?: number;
};

const btnW = r(0.375) * 2 + r(1.25);

const ControlsBar: React.FC<{st: PlayerState}> = ({st}) => {
  const c = st.controls!;
  const it = c.items ?? ALL_ON;
  const show = c.show;
  const narrow = st.w < 620; // [data-vertical]: the volume range hides
  const vb = narrow ? 0 : it.volumeBar;
  const du = st.w < 480 ? 0 : it.duration;
  const collapse = (v: number, full: number) => full * clamp(v);
  // a toggled control lights up for two frames (a pill in the primary color behind it), so the eye finds each
  // change as the bar ping-pongs (v4 critique)
  const lit = (k: keyof ControlItems): React.CSSProperties => {
    const v = c.flash?.[k] ?? 0;
    if (v <= 0) return {};
    const [R, G, B] = [1, 3, 5].map((i) => parseInt(st.primary.slice(i, i + 2), 16));
    return {background: `rgba(${R},${G},${B},${v})`, borderRadius: 8};
  };
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 200, pointerEvents: 'none'}}>
      {/* legibility veil of the real controls-container:before, kept very light */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 150,
          background: 'linear-gradient(to top, rgba(0,0,0,.42), rgba(0,0,0,0))',
          opacity: show,
        }}
      />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 11, transform: `translateY(${(1 - show) * 36}px)`, opacity: clamp(show * 1.5)}}>
        {/* seek range: 5 px track, white 30%, filled white */}
        <div style={{position: 'relative', height: collapse(it.seek, r(1)), margin: `0 ${r(1)}px`, opacity: it.seek, ...lit('seek')}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 7, marginTop: -3.5, borderRadius: 4, background: 'rgba(255,255,255,.3)'}} />
          <div style={{position: 'absolute', left: 0, width: `${c.seek * 100}%`, top: '50%', height: 7, marginTop: -3.5, borderRadius: 4, background: '#FFFFFF'}} />
          {(c.knob ?? 0) > 0 && (
            <div
              style={{
                position: 'absolute',
                left: `${c.seek * 100}%`,
                top: '50%',
                width: 18,
                height: 18,
                marginLeft: -9,
                marginTop: -9,
                borderRadius: 9,
                background: '#F5F5F5',
                transform: `scale(${c.knob})`,
              }}
            />
          )}
          {c.marker && c.marker.show > 0 && (
            <div
              style={{
                position: 'absolute',
                left: `${c.marker.at * 100}%`,
                top: '50%',
                width: 18,
                height: 18,
                marginLeft: -9,
                marginTop: -9,
                transform: `scale(${c.marker.show * (1 + 0.5 * c.marker.squash)}, ${c.marker.show * (1 - 0.45 * c.marker.squash)}) rotate(45deg)`,
              }}
            >
              <div style={{width: '100%', height: '100%', background: st.primary, borderRadius: 3, boxShadow: '0 0 0 2.5px #fff'}} />
            </div>
          )}
        </div>
        {/* buttons row */}
        <div style={{display: 'flex', alignItems: 'center', height: r(3.5), padding: `${r(0.5)}px ${r(0.875)}px`, boxSizing: 'border-box', gap: r(0.5), fontFamily: TEXT, letterSpacing: '.025em'}}>
          <div style={{width: collapse(it.play, btnW), marginRight: it.play < 1 ? -r(0.5) * (1 - it.play) : 0, opacity: it.play, overflow: 'hidden', display: 'flex', justifyContent: 'center'}}>
            <Icon name={c.paused ? 'play' : 'pause'} size={r(1.25)} />
          </div>
          <div style={{display: 'flex', alignItems: 'center', fontSize: r(0.875) * 1.12, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
            <span style={{opacity: it.current, maxWidth: collapse(it.current, 90), overflow: 'hidden', display: 'inline-block'}}>{c.time}</span>
            <span style={{opacity: Math.min(it.current, du), maxWidth: collapse(Math.min(it.current, du), 40), overflow: 'hidden', display: 'inline-block', textAlign: 'center'}}>
              &nbsp;/&nbsp;
            </span>
            <span style={{opacity: du, maxWidth: collapse(du, 90), overflow: 'hidden', display: 'inline-block'}}>{c.dur}</span>
          </div>
          <div style={{flex: 1}} />
          <div style={{width: collapse(it.volume, btnW), opacity: it.volume, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignSelf: 'stretch', alignItems: 'center', ...lit('volume')}}>
            <Icon name="speaker" size={r(1.25)} />
          </div>
          <div style={{width: collapse(vb, r(4)), marginLeft: vb < 1 ? -r(0.5) * (1 - vb) : 0, opacity: vb, overflow: 'hidden', position: 'relative', height: 30, ...lit('volumeBar')}}>
            <div style={{position: 'absolute', left: 0, width: r(4), top: 11.5, height: 7, borderRadius: 4, background: 'rgba(255,255,255,.3)'}} />
            <div style={{position: 'absolute', left: 0, width: r(4) * 0.7, top: 11.5, height: 7, borderRadius: 4, background: '#FFFFFF'}} />
          </div>
          <div style={{width: collapse(it.speed, btnW), marginLeft: it.speed < 1 ? -r(0.5) * (1 - it.speed) : 0, opacity: it.speed, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignSelf: 'stretch', alignItems: 'center', ...lit('speed')}}>
            <Icon name="gear" size={r(1.25)} />
          </div>
          <div style={{width: collapse(it.fullscreen, btnW), marginLeft: it.fullscreen < 1 ? -r(0.5) * (1 - it.fullscreen) : 0, opacity: it.fullscreen, overflow: 'hidden', display: 'flex', justifyContent: 'center'}}>
            <Icon name="fullscreen" size={r(1.25)} />
          </div>
        </div>
      </div>
      {/* fake progress: 8 px (11 px at this scale) in the primary color, at the very bottom */}
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 11, width: `${c.fake * 100}%`, background: st.primary, opacity: clamp(show * 2)}}>
        {st.primaryWipe && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${st.primaryWipe.p * 100}%`, background: st.primaryWipe.color}} />}
      </div>
    </div>
  );
};

// part: 'box' draws only the video box, 'cta' only the button under it (the feature camera cuts them differently)
export const Player: React.FC<{st: PlayerState; children?: React.ReactNode; overlay?: React.ReactNode; part?: 'box' | 'cta'}> = ({st, children, overlay, part}) => {
  const radius = st.radius ?? 12;
  const sm = st.smart;
  const kp = st.keep;
  const cv = st.cover;
  const boxW = Math.min(st.w * 0.8, r(25));
  const boxH = Math.min(st.h * 0.8, r(11));
  const pw = st.primaryWipe;
  const sh = st.shadow ?? 1;
  return (
    <>
      {part !== 'cta' && (
      <div
        style={{
          position: 'absolute',
          left: st.x,
          top: st.y,
          width: st.w,
          height: st.h,
          borderRadius: radius,
          overflow: 'hidden',
          background: C.player,
          boxShadow: sh > 0 ? `0 ${22 * sh}px ${46 * sh}px rgba(0,0,0,${0.1 * sh}), 0 2px 5px rgba(0,0,0,${0.06 * sh})` : undefined,
          color: '#fff',
          fontFamily: TEXT,
          isolation: 'isolate',
        }}
      >
        <div style={{position: 'absolute', inset: 0}}>
          <Presenter t={st.videoT} />
        </div>
        {(st.dim ?? 0) > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${st.dim})`}} />}

        {/* thumbnail shown on pause: the frozen frame darkened with a persuasive line (a user-uploaded image in the real product) */}
        {cv && cv.show > 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: cv.show}}>
            <div style={{position: 'absolute', inset: 0, background: 'rgba(10,10,12,.62)'}} />
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: st.h * 0.1,
                textAlign: 'center',
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontStretch: '64%',
                fontSize: st.h * 0.2,
                lineHeight: 0.9,
                letterSpacing: '-0.005em',
                color: '#fff',
                transform: `translateY(${(1 - cv.settle) * 18}px) scale(${1 + 0.04 * (1 - cv.settle)})`,
              }}
            >
              FALTA POUCO.
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: st.h * 0.2,
                textAlign: 'center',
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontStretch: '64%',
                fontSize: st.h * 0.075,
                letterSpacing: '0.04em',
                color: st.primary,
                transform: `translateY(${(1 - cv.settle) * -12}px)`,
              }}
            >
              ASSISTA ATÉ O FINAL
            </div>
          </div>
        )}

        {/* Smart AutoPlay (box mode): #000 60% veil, rounded box in the smart color, SpeakerSlash, pill + "Clique para ouvir", ping */}
        {sm && sm.box > 0 && (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.6 * (1 - sm.collapse)})`}}>
            {sm.ping > 0 && sm.ping < 1 && sm.collapse <= 0 && (
              <div
                style={{
                  position: 'absolute',
                  width: boxW,
                  height: boxH,
                  borderRadius: r(0.375),
                  background: st.primary,
                  opacity: 0.5 * (1 - sm.ping),
                  transform: `scale(${1 + sm.ping})`,
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                width: boxW,
                height: boxH,
                borderRadius: r(0.375),
                background: st.primary,
                display: 'flex',
                alignItems: 'center',
                padding: `${r(1)}px ${r(1.5)}px`,
                gap: r(2),
                boxSizing: 'border-box',
                transform: `scale(${1 - 0.14 * sm.collapse})`,
                opacity: (1 - sm.collapse) * sm.box,
              }}
            >
              <div style={{width: '33.33%', height: '75%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 * sm.content, transform: `translateY(${(1 - sm.content) * 14}px)`}}>
                <Icon name="speakerSlash" size={boxH * 0.62} color="#fff" />
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: r(0.5),
                  textAlign: 'center',
                  color: '#fff',
                  opacity: sm.content,
                  transform: `translateY(${(1 - sm.content) * 18}px)`,
                }}
              >
                <span style={{background: 'rgba(0,0,0,.1)', borderRadius: 999, padding: `0 ${r(0.5)}px`, fontSize: r(0.875), fontWeight: 600, lineHeight: `${r(1.25)}px`}}>
                  Seu vídeo já começou
                </span>
                <span style={{fontSize: r(1.5), fontWeight: 700, lineHeight: `${r(2)}px`}}>Clique para ouvir</span>
              </div>
            </div>
          </div>
        )}

        {(st.bigPlay ?? 0) > 0 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: r(3) * 1.3,
              height: r(3) * 1.3,
              borderRadius: '50%',
              background: st.primary,
              transform: `translate(-50%,-50%) scale(${st.bigPlay})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {pw && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pw.p * 100}%`, background: pw.color}} />}
            <Icon name="play" size={r(1.25) * 1.3} color="#fff" style={{marginLeft: 3, position: 'relative'}} />
          </div>
        )}

        {st.controls && st.controls.show > 0 && <ControlsBar st={st} />}

        {/* Keep watching: full cover in the primary color */}
        {kp && kp.show > 0 && (
          <DirBlur y={kp.blur ?? 0} style={{position: 'absolute', inset: 0, transform: `translateY(${-kp.lift * st.h * 1.04}px)`}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: st.primary,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: r(3),
                opacity: kp.show,
              }}
            >
              <p style={{margin: 0, fontSize: r(1.25) * 1.1, fontWeight: 700, lineHeight: 1.4, textAlign: 'center'}}>Você já começou a assistir esse vídeo</p>
              <div style={{display: 'flex', gap: r(3), alignItems: 'center'}}>
                {[
                  {icon: 'playCircle', label: ['Continuar', 'assistindo'], press: kp.pressA ?? 0},
                  {icon: 'refresh', label: ['Assistir do início'], press: 0},
                ].map((b, i) => (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: r(1), transform: `scale(${1 - 0.07 * b.press})`}}>
                    <div
                      style={{
                        width: r(2.5),
                        height: r(2.5),
                        borderRadius: '50%',
                        boxShadow: 'inset 0 0 0 2.75px #fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `rgba(255,255,255,${0.22 * b.press})`,
                      }}
                    >
                      <Icon name={b.icon} size={r(1.5)} color="#fff" />
                    </div>
                    <span style={{fontSize: r(1) * 1.08, fontWeight: 700, lineHeight: 1.3, textAlign: 'center'}}>
                      {b.label.map((l, j) => (
                        <div key={j}>{l}</div>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DirBlur>
        )}
        {children}
      </div>
      )}

      {/* CTA below the video, in the player's button container (.vslplay-button) */}
      {part !== 'box' && st.cta && st.cta.show > 0 && (
        <div style={{position: 'absolute', left: st.x, width: st.w, top: st.y + st.h + r(0.9), display: 'flex', justifyContent: 'center', height: r(3)}}>
          <div
            style={{
              height: r(3),
              padding: `0 ${r(2.2)}px`,
              borderRadius: r(0.375),
              background: st.primary,
              color: '#fff',
              fontFamily: TEXT,
              fontWeight: 700,
              fontSize: 25,
              letterSpacing: '.03em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              transformOrigin: '50% 0%',
              transform: `scale(${lerp(0.12, 1, st.cta.grow) * (1 - 0.05 * (st.cta.press ?? 0))})`,
              opacity: st.cta.show,
              whiteSpace: 'nowrap',
            }}
          >
            {pw && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pw.p * 100}%`, background: pw.color}} />}
            <span style={{position: 'relative', opacity: clamp(st.cta.grow * 1.6 - 0.6), color: (pw && pw.p > 0.5 ? pw.color : st.primary) === C.sun ? C.ink : '#fff'}}>
              {st.cta.text ?? 'COMPRAR AGORA'}
            </span>
          </div>
        </div>
      )}
      {overlay}
    </>
  );
};
