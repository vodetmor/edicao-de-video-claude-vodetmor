import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import '@fontsource/inter/800.css';
import {T} from './theme';
// Thumbnail: foto de Tobin Jones (AU-UN IST, CC0), Marka, 2014: a moça e a bandeira somali ao lado.
export const Thumb: React.FC<{v?: number}> = ({v = 1}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={staticFile('midia/mulher-bandeira-marka-2014.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 58%',
      transform: 'scale(1.0)', filter: 'saturate(1.08) contrast(1.06)'}} />
    {/* escurece só o canto do título, para a letra branca ler sobre o céu claro */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 62% 70% at 12% 18%, rgba(10,9,8,0.82), rgba(10,9,8,0) 70%)'}} />
    <div style={{position: 'absolute', left: 84, top: 56, color: '#fff'}}>
      <div style={{fontFamily: T.sans, fontWeight: 800, fontSize: 176, letterSpacing: '-0.035em', lineHeight: 0.9, textShadow: '0 4px 30px rgba(0,0,0,0.45)'}}>SOMÁLIA</div>
      <div style={{fontFamily: T.serif, fontStyle: 'italic', fontSize: 70, lineHeight: 1, marginTop: 14, textShadow: '0 3px 20px rgba(0,0,0,0.6)'}}>a África que ninguém conta</div>
    </div>
  </AbsoluteFill>
);
