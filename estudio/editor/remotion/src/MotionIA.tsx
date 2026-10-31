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

// Versão "estúdio" (31/10/2026, depois do Jerônimo comparar com a vitrine do curso): o mesmo roteiro do painel, mas no
// sistema de produto: fundo escuro, um destaque, rótulo pequeno + título grande, cartões com borda fina, movimento calmo.
// ANTES: o print real do editor vazio + selo "nunca aberto". DEPOIS: o Claude edita (checklist que marca) e a barra chega a 100%.
const ARCH = "'Inter Variable', 'Inter', sans-serif";
const GEIST = "'Geist Variable', 'Inter Variable', sans-serif";
const entra = (f: number, ini: number, dy = 40) => {
  const e = clamp(mola(f, ini, 0.2, 0.9), 0, 1.04);
  return {opacity: clamp((f - ini) / 6), transform: `translateY(${(1 - e) * dy}px)`};
};

export const PainelIAEstudio: React.FC<{f: number; w: number; h: number; tm: TemaMotion; mk: Marcas; logo?: string; programa?: string}> = ({f, w, h, tm, mk, logo, programa}) => {
  const depois = f >= mk.claude;
  const troca = clamp((f - mk.claude + 6) / 8);
  const borda = 'rgba(255,255,255,.10)';
  const itens = [{t: 'Pausas cortadas', em: mk.corte}, {t: 'Luz e cor tratadas', em: mk.barra}, {t: 'Legenda sincronizada', em: mk.cheio - 6}];
  const barra = clamp((f - mk.barra) / Math.max(1, mk.cheio - mk.barra));
  const Rotulo: React.FC<{n: string; t: string}> = ({n, t}) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: GEIST, fontWeight: 700, fontSize: 28, letterSpacing: '0.16em', color: tm.cinza}}>
      <span style={{background: tm.tema, color: '#fff', borderRadius: 8, padding: '4px 10px', letterSpacing: '0.04em'}}>{n}</span>{t}
    </div>
  );
  const Titulo: React.FC<{a: string; b: string}> = ({a, b}) => (
    <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 92, lineHeight: 0.98, letterSpacing: '-0.045em', marginTop: 14}}>
      <div style={{color: tm.tinta}}>{a}</div><div style={{color: tm.tema}}>{b}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, width: w, height: h, overflow: 'hidden', background: tm.papel}}>
      <div style={{position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: `linear-gradient(${borda} 1px, transparent 1px), linear-gradient(90deg, ${borda} 1px, transparent 1px)`,
        backgroundSize: '72px 72px', maskImage: 'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)'}} />
      {!depois || troca < 1 ? (
        <div style={{position: 'absolute', left: 72, right: 72, top: 96, opacity: 1 - troca}}>
          <div style={entra(f, mk.janela - 4)}><Rotulo n="ANTES" t="O BRUTO" /></div>
          <div style={entra(f, mk.janela)}><Titulo a="Nunca abri um" b="editor de vídeo." /></div>
          {programa && (
            <div style={{position: 'relative', marginTop: 40, ...entra(f, mk.janela + 6, 60)}}>
              <div style={{borderRadius: 26, overflow: 'hidden', border: `1.5px solid ${borda}`, boxShadow: '0 30px 60px rgba(0,0,0,.45)'}}>
                <Img src={staticFile(programa)} style={{width: '100%', display: 'block', filter: 'brightness(.85)'}} />
              </div>
              {f >= mk.carimbo && (
                <div style={{position: 'absolute', right: 26, bottom: -28, ...entra(f, mk.carimbo, 24), display: 'flex', alignItems: 'center', gap: 12,
                  background: tm.tema, color: '#fff', borderRadius: 40, padding: '14px 26px', fontFamily: GEIST, fontWeight: 700, fontSize: 32}}>
                  <span style={{width: 12, height: 12, borderRadius: 6, background: '#fff'}} />projeto vazio · nunca aberto
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
      {depois && (
        <div style={{position: 'absolute', left: 72, right: 72, top: 96, opacity: troca}}>
          <div style={entra(f, mk.claude)}><Rotulo n="DEPOIS" t="O CLAUDE EDITA" /></div>
          <div style={entra(f, mk.claude + 3)}><Titulo a="Alta qualidade," b="sem editar." /></div>
          <div style={{marginTop: 40, background: tm.papel2, border: `1.5px solid ${borda}`, borderRadius: 26, padding: '30px 34px', ...entra(f, mk.claude + 6, 60)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: GEIST, fontWeight: 600, fontSize: 30, color: tm.tinta}}>
              {logo && <Img src={staticFile(logo)} style={{width: 40, height: 40}} />}Claude · editando o bruto
            </div>
            {itens.map((it, i) => {
              const ok = clamp((f - it.em) / 6);
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 22, fontFamily: GEIST, fontSize: 34, color: ok > 0 ? tm.tinta : tm.cinza}}>
                  <div style={{width: 40, height: 40, borderRadius: 20, border: `2.5px solid ${ok > 0 ? tm.tema : tm.cinza}`, background: ok > 0 ? tm.tema : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <svg width={22} height={22} viewBox="0 0 10 10"><path d="M1.5 5.2 L4 7.6 L8.6 2.6" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ok} /></svg>
                  </div>{it.t}
                </div>
              );
            })}
            <div style={{marginTop: 30, height: 10, borderRadius: 5, background: 'rgba(255,255,255,.08)'}}>
              <div style={{height: '100%', width: `${barra * 100}%`, borderRadius: 5, background: tm.tema}} />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: GEIST, fontSize: 26, color: tm.cinza, fontVariantNumeric: 'tabular-nums'}}>
              <span>{barra >= 1 ? 'Vídeo pronto' : 'Exportando…'}</span><span>{Math.round(barra * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
