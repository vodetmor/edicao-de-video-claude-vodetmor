// Painel de fórmulas (lado direito): cada pedaço da fórmula entra na palavra em que é falado.
// KaTeX com halo da cor do fundo; resultados ganham moldura no silêncio aberto para eles.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import katex from 'katex';
import {C, HALO, INTER} from './estilo';
import {FIBRA_FIM, FIBRA_INI, GANCHO_FIM} from './Cena3D';
import {entrada, expressiva, janela, P, PAUSA, prog, produtiva} from './tempo';

type Seg = [string, number, string?]; // tex, quadro em que entra, cor
const kx = (t: string) => katex.renderToString(t, {throwOnError: false});

const Eq: React.FC<{f: number; segs: Seg[]; X: number; Y: number; size?: number; op?: number; caixa?: number; corCaixa?: string; cor?: string}> = ({f, segs, X, Y, size = 56, op = 1, caixa = -1, corCaixa = C.tinta, cor = C.tinta}) => {
  if (op <= 0.001 || f < segs[0][1] - 2) return null;
  const moldura = caixa > 0 ? prog(f, caixa, 14, expressiva) : 0;
  return (
    <div style={{position: 'absolute', left: X, top: Y, transform: 'translateY(-50%)', opacity: op, display: 'flex', alignItems: 'center', gap: size * 0.22, fontSize: size, color: cor, textShadow: HALO, whiteSpace: 'nowrap',
      padding: '10px 22px', marginLeft: -22, borderRadius: 18, boxShadow: moldura > 0 ? `inset 0 0 0 ${2.5 * moldura}px ${corCaixa}` : undefined, background: moldura > 0 ? `rgba(11,11,13,${0.9 * moldura})` : undefined}}>
      {segs.map(([t, q, c], i) => {
        const e = prog(f, q - 2, 12, entrada);
        if (e <= 0.001) return <span key={i} style={{opacity: 0}} dangerouslySetInnerHTML={{__html: kx(t)}} />;
        return <span key={i} style={{display: 'inline-block', opacity: e, transform: `translateY(${(1 - e) * 18}px)`, color: c ?? cor}} dangerouslySetInnerHTML={{__html: kx(t)}} />;
      })}
    </div>
  );
};
const Txt: React.FC<{f: number; ini: number; txt: string; X: number; Y: number; size?: number; peso?: number; cor?: string; op?: number}> = ({f, ini, txt, X, Y, size = 40, peso = 600, cor = C.tinta, op = 1}) => {
  const e = prog(f, ini - 2, 12, entrada);
  if (e <= 0.001 || op <= 0.001) return null;
  return <div style={{position: 'absolute', left: X, top: Y, transform: `translateY(-50%) translateY(${(1 - e) * 16}px)`, opacity: e * op, fontFamily: INTER, fontWeight: peso, fontSize: size, letterSpacing: '-0.015em', color: cor, textShadow: HALO, whiteSpace: 'nowrap'}}>{txt}</div>;
};
const Selo: React.FC<{f: number; ini: number; fim: number; txt: string; cor: string; X?: number; Y?: number}> = ({f, ini, fim, txt, cor, X = 80, Y = 72}) => {
  const op = janela(f, ini, fim, 8, 10);
  if (op <= 0.001) return null;
  const e = prog(f, ini, 14, expressiva);
  return <div style={{position: 'absolute', left: X, top: Y, opacity: op, transform: `scale(${0.86 + 0.14 * e})`, transformOrigin: 'left center', background: cor, color: '#0B0B0D', fontFamily: INTER, fontWeight: 800, fontSize: 28, letterSpacing: '0.07em', padding: '10px 20px 9px', borderRadius: 14}}>{txt}</div>;
};

const SEN = '\\operatorname{sen}';
const X0 = 1080, X5 = 1400;

export const Painel: React.FC = () => {
  const f = useCurrentFrame();
  if (f < GANCHO_FIM || (f >= FIBRA_INI && f < FIBRA_FIM - 6)) return null;
  const a2 = janela(f, P(58), P(99), 1, 14);              // ato 2
  const a3 = janela(f, P(99), P(156), 10, 14);            // ato 3
  const a4 = janela(f, P(156), FIBRA_INI + 4, 10, 10);    // ato 4
  const a5 = f >= FIBRA_FIM - 6 ? janela(f, FIBRA_FIM - 6, PAUSA(273).de + 4, 10, 14) : 0; // ato 5
  // a lei de Snell sobe e encolhe quando vira ferramenta do ato 3
  const sobe = prog(f, P(99), 20, expressiva);
  const snellOp = f < P(156) ? Math.max(a2 * (f < P(75) - 2 ? 0 : 1), a3) : a3;
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: INTER}}>
      {/* ---------------- ato 2 */}
      <Eq f={f} op={a2} X={X0} Y={210} size={64} segs={[['n', P(61)], ['=', P(62)], ['\\dfrac{c}{v}', P(64)]]} />
      <Eq f={f} op={a2} X={X0} Y={350} size={40} cor={C.cinza} segs={[['n_{\\text{água}} = \\dfrac{300\\,000}{225\\,000} = \\dfrac{4}{3}', P(66) + 8]]} />
      <Eq f={f} op={snellOp} X={X0} Y={505 - 315 * sobe} size={62 - 14 * sobe} caixa={f < P(99) ? PAUSA(88).de : -1}
        segs={[['n_1', P(75)], [`${SEN}\\,\\theta_1`, P(77), C.th1], ['=', P(81)], ['n_2', P(83)], [`${SEN}\\,\\theta_2`, P(85), C.th2]]} />
      {/* ---------------- ato 3 */}
      <Eq f={f} op={a3} X={X0} Y={310} size={42} cor={C.cinza} segs={[[`${SEN}\\,53^\\circ = 0{,}8`, P(117)]]} />
      <Eq f={f} op={a3} X={X0} Y={420} size={56} segs={[['1', P(125)], ['\\cdot\\, 0{,}8', P(127)], ['=', P(130)], ['\\tfrac{4}{3}', P(132)], [`\\cdot\\, ${SEN}\\,\\theta_2`, P(134), C.th2]]} />
      <Eq f={f} op={a3} X={X0} Y={530} size={56} segs={[[`${SEN}\\,\\theta_2`, P(139), C.th2], ['= 0{,}6', P(144)]]} />
      <Eq f={f} op={a3} X={X0} Y={650} size={64} cor={C.th2} caixa={PAUSA(150).de - 4} corCaixa={C.th2} segs={[['\\theta_2 \\approx 37^\\circ', P(147)]]} />
      <Txt f={f} ini={P(151) + 4} txt="entrou no meio de n maior: aproxima da normal" X={X0} Y={760} size={34} peso={500} cor={C.cinza} op={a3} />
      {/* ---------------- ato 4 */}
      <Eq f={f} op={a4} X={X0} Y={250} size={62} segs={[[`${SEN}\\,L`, P(178), C.lim], ['=', P(181)], ['\\dfrac{n_{\\text{menor}}}{n_{\\text{maior}}}', P(183)]]} />
      <Eq f={f} op={a4} X={X0} Y={390} size={50} segs={[['= \\dfrac{1}{4/3}', P(186) + 6], ['= 0{,}75', P(188)]]} />
      <Eq f={f} op={a4} X={X0} Y={510} size={64} cor={C.lim} caixa={PAUSA(198).de - 4} corCaixa={C.lim} segs={[['L \\approx 49^\\circ', P(193)]]} />
      <Txt f={f} ini={P(205)} txt="passou de L: reflexão total" X={X0} Y={615} size={36} peso={600} op={a4} />
      <Txt f={f} ini={P(212)} txt="só indo de n maior para n menor" X={X0} Y={700} size={36} peso={700} cor={C.th1} op={a4} />
      {/* ---------------- ato 5 */}
      <Txt f={f} ini={P(235)} txt="n muda com a cor" X={X5} Y={250} size={46} peso={700} op={a5} />
      <Eq f={f} op={a5} X={X5} Y={360} size={46} segs={[['\\bullet', P(244), C.verm], ['n_{\\text{vermelho}} = 1{,}51', P(246)]]} />
      <Eq f={f} op={a5} X={X5} Y={450} size={46} segs={[['\\bullet', P(252), C.viol], ['n_{\\text{violeta}} = 1{,}53', P(253)]]} />
      <Txt f={f} ini={P(259)} txt="violeta: freia mais" X={X5} Y={560} size={36} peso={600} cor={C.viol} op={a5} />
      <Txt f={f} ini={P(263)} txt="e desvia mais" X={X5} Y={612} size={36} peso={600} cor={C.viol} op={a5} />
      <Dispersao f={f} op={a5} />
      {/* ---------------- selos */}
      <Selo f={f} ini={P(89)} fim={P(99) - 2} txt="PEGADINHA" cor={C.lim} />
      <Selo f={f} ini={P(99)} fim={P(156) - 2} txt="CAI NA PROVA" cor={C.th1} />
      <Selo f={f} ini={P(156)} fim={P(209) - 2} txt="CAI NA PROVA" cor={C.th1} />
      <Selo f={f} ini={P(209)} fim={P(222)} txt="SEGREDO" cor={C.th2} />
    </div>
  );
};

// palavra-título do ato 5, com a régua do espectro embaixo (sem degradê: 7 blocos chapados)
const ESP = ['#FF3B30', '#FF9500', '#FFD60A', '#34C759', '#00C7BE', '#3D7BFF', '#A55BFF'];
const Dispersao: React.FC<{f: number; op: number}> = ({f, op}) => {
  const e = prog(f, P(273) - 3, 16, entrada);
  if (e <= 0.001 || op <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: X5, top: 720, transform: 'translateY(-50%)', opacity: op}}>
      <div style={{overflow: 'hidden', paddingBottom: 8}}>
        <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 76, letterSpacing: '-0.03em', color: C.tinta, transform: `translateY(${(1 - e) * 100}%)`, textShadow: HALO}}>dispersão</div>
      </div>
      <div style={{display: 'flex', gap: 4, marginTop: 6}}>
        {ESP.map((c, i) => <div key={c} style={{width: 46, height: 8, borderRadius: 4, background: c, transform: `scaleX(${prog(f, P(273) + i * 2, 10, entrada)})`, transformOrigin: 'left'}} />)}
      </div>
    </div>
  );
};
