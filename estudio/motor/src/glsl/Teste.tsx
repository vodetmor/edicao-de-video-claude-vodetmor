import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Shader} from './Shader';
const FRAG = `#version 300 es
precision highp float; in vec2 vUv; out vec4 o; uniform float t; uniform vec2 res;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
void main(){vec2 p=(vUv-.5)*res/res.y*3.;float v=fbm(p+vec2(t*.3,0.)+fbm(p+t*.2));
vec3 c=mix(vec3(.96,.96,.97),vec3(0.,.44,.89),smoothstep(.45,.75,v));o=vec4(c,1.);}`;
export const Teste: React.FC = () => <AbsoluteFill style={{background: '#fff'}}><Shader frag={FRAG} /><div style={{position:'absolute',top:400,left:100,font:'700 120px Inter',color:'#111'}}>GLSL + React</div></AbsoluteFill>;
