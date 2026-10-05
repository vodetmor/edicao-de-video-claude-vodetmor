// Ponte HyperFrames -> Remotion: carrega um arquivo HTML + CSS + GSAP (do jeito que o HyperFrames escreve)
// e "pilota" a timeline GSAP pelo quadro do Remotion. Assim qualquer técnica/blueprint em HTML roda aqui dentro,
// junto com os blocos React, o áudio e as âncoras de palavra.
// Contrato do <script> do arquivo: recebe gsap, root (o elemento da cena), M (marcas em segundos, já presas às
// palavras), W, H; e devolve uma timeline pausada (return tl).
import React from 'react';
import {continueRender, delayRender, staticFile, useVideoConfig} from 'remotion';
import gsap from 'gsap';
import type {BlocoProps} from '../tipos';

type P = {arquivo: string; marcas?: Record<string, string>};

export const HtmlGsap: React.FC<BlocoProps<P>> = ({f, w, h, t, p}) => {
  const {fps} = useVideoConfig();
  const root = React.useRef<HTMLDivElement>(null);
  const tl = React.useRef<gsap.core.Timeline | null>(null);
  const [src, setSrc] = React.useState<{html: string; css: string; js: string} | null>(null);
  const [handle] = React.useState(() => delayRender(`html ${p.arquivo}`));

  React.useEffect(() => {
    fetch(staticFile(`html/${p.arquivo}`))
      .then((r) => r.text())
      .then((txt) => {
        // $static/ = pasta public do projeto (imagens, fontes, vídeos usados pela cena)
        const base = staticFile('x').slice(0, -1);
        const doc = new DOMParser().parseFromString(txt.split('$static/').join(base), 'text/html');
        const css = Array.from(doc.querySelectorAll('style')).map((s) => s.textContent).join('\n');
        const js = Array.from(doc.querySelectorAll('script')).map((s) => s.textContent).join('\n');
        doc.querySelectorAll('style,script').forEach((n) => n.remove());
        setSrc({html: doc.body.innerHTML, css, js});
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [p.arquivo, handle]);

  React.useLayoutEffect(() => {
    if (!src || !root.current || tl.current) return;
    const M: Record<string, number> = {};
    for (const [k, a] of Object.entries(p.marcas ?? {})) M[k] = t(a) / fps;
    // eslint-disable-next-line no-new-func
    const run = new Function('gsap', 'root', 'M', 'W', 'H', src.js);
    tl.current = run(gsap, root.current, M, w, h) as gsap.core.Timeline;
    tl.current.pause();
    tl.current.seek(f / fps, false);
    document.fonts.ready.then(() => continueRender(handle));
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useLayoutEffect(() => {
    tl.current?.seek(f / fps, false);
  }, [f, fps]);

  return (
    <div ref={root} style={{position: 'absolute', inset: 0, width: w, height: h, ['--w' as any]: `${w}px`, ['--h' as any]: `${h}px`}}>
      {src && (
        <>
          <style>{src.css}</style>
          <div style={{position: 'absolute', inset: 0}} dangerouslySetInnerHTML={{__html: src.html}} />
        </>
      )}
    </div>
  );
};
