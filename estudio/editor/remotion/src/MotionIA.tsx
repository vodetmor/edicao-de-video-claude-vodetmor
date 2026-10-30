// Motion único do trecho "não sei editar → saiu em alta qualidade" (vitrine do Jerônimo, 30/10/2026).
// Estrutura da tela dividida de T. Antonie (painel em cima que se monta com a fala, legenda na emenda, pessoa embaixo)
// no universo da colagem de Thiago A. (papel, recorte, fita rotuladora, carimbo, serifa, entrada em stop-motion).
// Tudo preso a palavras: `t` devolve o quadro da palavra.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, mola, tween, E} from './kit';

export type TemaMotion = {papel: string; papel2: string; tema: string; tinta: string; cinza: string};
type Marcas = {janela: number; carimbo: number; claude: number; corte: number; barra: number; cheio: number; fim: number};

const SERIFA = "'Instrument Serif', 'Georgia', serif";
const INTER = "'Inter Variable', 'Inter', sans-serif";

// stop-motion: 3 "fotos" (cresce demais, volta um pouco, assenta), sem interpolação, como recorte colado à mão
const pop = (f: number, ini: number) => (f < ini ? 0 : [1.16, 0.95, 1][Math.min(2, Math.floor((f - ini) / 2))]);
const treme = (f: number, k: number) => ((Math.floor(f / 3) * 7 + k * 13) % 5) - 2; // tremidinha de stop-motion (±2 px)

export const PainelIA: React.FC<{f: number; w: number; h: number; tm: TemaMotion; mk: Marcas; logo?: string; programa?: string}> = ({f, w, h, tm, mk, logo, programa}) => {
  // 1 · a janela do programa de edição cai no papel; 2 · carimbo NUNCA ABERTO
  const sJan = pop(f, mk.janela);
  const saiJan = tween(f, mk.claude - 6, 10, 0, 1, E.saida);
  const sCar = f < mk.carimbo ? 0 : [1.9, 0.92, 1][Math.min(2, Math.floor((f - mk.carimbo) / 2))];
  // 3 · Claude entra; 4 · a linha de corte passa pelos clipes e eles se juntam; 5 · barra de qualidade enche
  const sCl = pop(f, mk.claude);
  const corte = clamp((f - mk.corte) / 14);
  const junta = mola(f, mk.corte + 14, 0.25, 0.85);
  const barra = clamp((f - mk.barra) / Math.max(1, mk.cheio - mk.barra));
  const check = clamp((f - mk.cheio - 2) / 8);
  const clipes = [0.16, 0.09, 0.2, 0.07, 0.18, 0.12]; // larguras (fração), com "pausas" entre eles que o corte remove
  const pausa = 0.035 * (1 - junta);
  return (
    <div style={{position: 'absolute', inset: 0, width: w, height: h, overflow: 'hidden', background: tm.papel}}>
      {/* quadriculado de caderno bem leve (a referência usa papel quadriculado) */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.35, backgroundImage: `linear-gradient(${tm.papel2} 1.5px, transparent 1.5px), linear-gradient(90deg, ${tm.papel2} 1.5px, transparent 1.5px)`,
        backgroundSize: '54px 54px'}} />

      {programa && f >= mk.janela && saiJan < 1 && (
        // print REAL de um programa de edição (projeto vazio), impresso e colado no papel: borda branca e sombra curta
        <div style={{position: 'absolute', left: w * 0.06, top: h * 0.17, width: w * 0.88,
          transform: `translate(${treme(f, 1)}px, ${-saiJan * h * 0.9}px) rotate(-2.5deg) scale(${sJan})`, background: tm.papel,
          padding: 12, boxShadow: '0 14px 0 rgba(0,0,0,.18)'}}>
          <Img src={staticFile(programa)} style={{width: '100%', display: 'block', filter: 'contrast(1.05)'}} />
        </div>
      )}
      {!programa && f >= mk.janela && saiJan < 1 && (
        <div style={{position: 'absolute', left: w * 0.12, top: h * 0.16, width: w * 0.76, height: h * 0.56,
          transform: `translate(${treme(f, 1)}px, ${-saiJan * h * 0.9}px) rotate(-3deg) scale(${sJan})`, background: tm.papel2,
          boxShadow: `0 14px 0 rgba(0,0,0,.16)`, border: `6px solid ${tm.tinta}`}}>
          <div style={{height: 62, background: tm.tinta, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px'}}>
            {[0, 1, 2].map((i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: tm.papel2}} />)}
            <div style={{marginLeft: 18, fontFamily: INTER, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: tm.papel}}>PROGRAMA DE EDIÇÃO</div>
          </div>
          {/* trilhas da linha do tempo, vazias e cheias de "botões" que ele nunca apertou */}
          {[0, 1, 2].map((r) => (
            <div key={r} style={{position: 'absolute', left: 30, right: 30, top: 110 + r * 92, height: 64, display: 'flex', gap: 10}}>
              {[0.3, 0.12, 0.22, 0.18].map((x, i) => (
                <div key={i} style={{flex: x, background: r === 1 ? tm.tema : tm.cinza, opacity: r === 1 ? 0.85 : 0.35}} />
              ))}
            </div>
          ))}
        </div>
      )}
      {f >= mk.carimbo && saiJan < 1 && (
        <div style={{position: 'absolute', left: w * 0.5, top: h * 0.36, transform: `translate(-50%, ${-saiJan * h * 0.9}px) rotate(-11deg) scale(${sCar})`,
          border: `10px solid ${tm.tema}`, padding: '10px 30px', fontFamily: INTER, fontWeight: 900, fontSize: 92, letterSpacing: '0.04em',
          color: tm.tema, background: 'rgba(225,221,214,.9)', whiteSpace: 'nowrap'}}>NUNCA ABERTO</div>
      )}

      {f >= mk.claude && (
        <>
          {logo && (
            <div style={{position: 'absolute', left: w / 2 - 100, top: h * 0.07, width: 200, height: 200, transform: `scale(${sCl}) rotate(${(f - mk.claude) * 0.8}deg)`}}>
              <Img src={staticFile(logo)} style={{width: '100%', height: '100%'}} />
            </div>
          )}
          {/* clipes da gravação: a linha de corte passa e as pausas somem */}
          <div style={{position: 'absolute', left: w * 0.07, width: w * 0.86, top: h * 0.37, height: 150}}>
            {(() => {
              let x = 0;
              return clipes.map((c, i) => {
                const left = x;
                x += c + pausa;
                const sC = pop(f, mk.claude + 4 + i * 2);
                return (
                  <div key={i} style={{position: 'absolute', left: `${(left / (1 + pausa * 6)) * 100}%`, width: `${(c / (1 + pausa * 6)) * 100}%`, top: 0, bottom: 0,
                    transform: `rotate(${(i % 2 ? 1.5 : -1.5)}deg) scale(${sC}) translateY(${treme(f, i)}px)`, background: i % 2 ? tm.tinta : tm.tema,
                    boxShadow: `0 8px 0 rgba(0,0,0,.15)`, borderRight: `4px solid ${tm.papel}`}} />
                );
              });
            })()}
            <svg style={{position: 'absolute', left: -20, top: -40, width: w * 0.86 + 40, height: 200, overflow: 'visible'}} viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 10 C 15 6, 25 14, 40 10 S 70 6, 100 11" fill="none" stroke={tm.tinta} strokeWidth={0.8} strokeDasharray="2 1.4"
                pathLength={1} style={{strokeDasharray: `${corte} 1`}} />
            </svg>
          </div>
          {/* barra de qualidade (a barra de progresso da referência), com check à mão no fim */}
          {f >= mk.barra && (
            <div style={{position: 'absolute', left: w * 0.1, width: w * 0.8, top: h * 0.68, transform: `scale(${pop(f, mk.barra)})`}}>
              <div style={{display: 'inline-block', background: tm.tinta, color: tm.papel, fontFamily: INTER, fontWeight: 700, fontSize: 34,
                letterSpacing: '0.1em', padding: '6px 14px', transform: 'rotate(-2deg)'}}>QUALIDADE</div>
              <div style={{marginTop: 18, height: 46, border: `5px solid ${tm.tinta}`, background: tm.papel2, position: 'relative'}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${barra * 100}%`, background: tm.tema}} />
                <div style={{position: 'absolute', right: 14, top: -64, fontFamily: SERIFA, fontSize: 86, color: tm.tinta, fontVariantNumeric: 'tabular-nums'}}>
                  {Math.round(barra * 100)}%
                </div>
              </div>
              <svg style={{position: 'absolute', right: -70, top: 40, width: 90, height: 90, overflow: 'visible'}} viewBox="0 0 10 10">
                <path d="M1 5.5 L4 8.5 L9.5 1.5" fill="none" stroke={tm.tema} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                  pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
};
