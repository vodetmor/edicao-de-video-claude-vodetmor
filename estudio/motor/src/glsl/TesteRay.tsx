import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Shader} from './Shader';
export const FRAG_RAY = `#version 300 es
precision highp float; in vec2 vUv; out vec4 o; uniform float t; uniform vec2 res;
mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdRB(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float sdTor(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
float obj(vec3 p){p.y-=0.15; p.xz*=r2(t*0.6); p.xy*=r2(0.35);
  float a=sdTor(p,vec2(0.62,0.2)); vec3 q=p; q.xy*=r2(1.5708); float b=sdTor(q-vec3(0.62,0,0),vec2(0.62,0.2));
  return min(a,b);}
float map(vec3 p){return min(obj(p), p.y+0.75);}
vec3 nor(vec3 p){vec2 e=vec2(1e-3,0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
float sh(vec3 ro,vec3 rd){float r=1.,h,d=0.02;for(int i=0;i<48;i++){h=map(ro+rd*d);r=min(r,10.*h/d);d+=clamp(h,0.01,0.25);if(h<1e-4||d>6.)break;}return clamp(r,0.,1.);}
float ao(vec3 p,vec3 n){float s=0.,w=1.;for(int i=1;i<6;i++){float h=0.06*float(i);s+=(h-map(p+n*h))*w;w*=0.7;}return clamp(1.-2.5*s,0.,1.);}
vec3 env(vec3 d){float y=d.y*0.5+0.5;vec3 c=mix(vec3(0.92,0.92,0.93),vec3(1.0),y);
  c+=vec3(2.5)*smoothstep(0.96,0.995,dot(d,normalize(vec3(-0.6,0.7,0.4)))); // softbox
  c*=mix(0.35,1.,smoothstep(-0.2,0.15,d.y)); return c;}
void main(){vec2 uv=(vUv-0.5)*res/res.y;
  vec3 ro=vec3(0.,0.55,3.2), ta=vec3(0.,0.05,0.); vec3 f=normalize(ta-ro),r=normalize(cross(f,vec3(0,1,0))),u=cross(r,f);
  vec3 rd=normalize(f*1.9+r*uv.x+u*uv.y);
  float d=0.;bool hit=false;for(int i=0;i<120;i++){float h=map(ro+rd*d);if(h<1e-4){hit=true;break;}d+=h;if(d>12.)break;}
  vec3 bg=vec3(0.955,0.955,0.965); vec3 c=bg;
  if(hit){vec3 p=ro+rd*d,n=nor(p);vec3 L=normalize(vec3(-0.6,0.9,0.5));float s=sh(p+n*0.002,L),a=ao(p,n);
    if(obj(p)<0.002){ vec3 rf=reflect(rd,n); float fr=0.04+0.96*pow(1.-max(dot(n,-rd),0.),5.);
      vec3 base=vec3(0.0,0.44,0.89); // azul único
      vec3 dif=base*(0.25+0.75*max(dot(n,L),0.)*s)*a;
      vec3 spec=env(rf)*mix(0.08,1.,fr)*mix(0.4,1.,s);
      c=dif*0.9+spec*0.55;
    } else { float k=max(dot(n,L),0.)*s; c=bg*(0.78+0.22*k)*mix(0.55,1.,a); c=mix(c,bg,smoothstep(3.,9.,d)); }
  }
  c=pow(c,vec3(1./1.0)); o=vec4(c,1.);}`;
export const TesteRay: React.FC = () => <AbsoluteFill style={{background:'#f4f4f6'}}><Shader frag={FRAG_RAY} /></AbsoluteFill>;
