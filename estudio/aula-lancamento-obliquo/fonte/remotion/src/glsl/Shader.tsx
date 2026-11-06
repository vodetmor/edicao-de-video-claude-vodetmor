// Camada GLSL do motor: um <canvas> WebGL2 que desenha um fragment shader por quadro.
// O shader é função pura do tempo (uniform t) e dos uniforms passados, então render e preview são idênticos.
import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export type Uniforms = Record<string, number | number[]>;
const VERT = `#version 300 es
in vec2 p; out vec2 vUv; void main(){ vUv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`;

type Ctx = {gl: WebGL2RenderingContext; prog: WebGLProgram; loc: Map<string, WebGLUniformLocation | null>};
const cache = new WeakMap<HTMLCanvasElement, Ctx>();

const compila = (gl: WebGL2RenderingContext, tipo: number, src: string) => {
  const s = gl.createShader(tipo)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('GLSL: ' + gl.getShaderInfoLog(s) + '\n' + src.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n'));
  return s;
};

const prepara = (cv: HTMLCanvasElement, frag: string): Ctx => {
  const gl = cv.getContext('webgl2', {preserveDrawingBuffer: true, premultipliedAlpha: true, antialias: false})!;
  if (!gl) throw new Error('WebGL2 indisponível: renderize com chromiumOptions.gl = "angle" ou "swangle"');
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compila(gl, gl.VERTEX_SHADER, VERT));
  const src = frag.startsWith('#version') ? frag : `#version 300 es\nprecision highp float;\nin vec2 vUv; out vec4 fragColor; uniform float t; uniform vec2 res;\n${frag}`;
  gl.attachShader(prog, compila(gl, gl.FRAGMENT_SHADER, src));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('GLSL link: ' + gl.getProgramInfoLog(prog));
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  return {gl, prog, loc: new Map()};
};

export const Shader: React.FC<{frag: string; u?: Uniforms; t?: number; style?: React.CSSProperties; escala?: number}> = ({frag, u = {}, t, style, escala = 1}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const W = Math.round(width * escala), H = Math.round(height * escala);
  useLayoutEffect(() => {
    const cv = ref.current!;
    let c = cache.get(cv);
    if (!c) { c = prepara(cv, frag); cache.set(cv, c); }
    const {gl, prog, loc} = c;
    gl.viewport(0, 0, W, H);
    gl.useProgram(prog);
    const set = (k: string, v: number | number[]) => {
      if (!loc.has(k)) loc.set(k, gl.getUniformLocation(prog, k));
      const l = loc.get(k);
      if (!l) return;
      if (typeof v === 'number') gl.uniform1f(l, v);
      else if (v.length === 2) gl.uniform2fv(l, v);
      else if (v.length === 3) gl.uniform3fv(l, v);
      else if (v.length === 4) gl.uniform4fv(l, v);
      else gl.uniform1fv(l, v);
    };
    set('t', t ?? frame / fps);
    set('res', [W, H]);
    for (const [k, v] of Object.entries(u)) set(k, v);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', ...style}} />;
};
