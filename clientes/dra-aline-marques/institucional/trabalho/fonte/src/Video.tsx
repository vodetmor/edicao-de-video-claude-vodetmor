import React, {useEffect} from 'react';
import {AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {approach, arrive, clamp, E, entra, lerp, prog, pulse, spring, tween} from './kit';
import {Avatar, Bubble, C, Card, Chip, Dot, FONT, HAND, Icon, Logo, Phone, Photo, Pos, S, Say, Txt, Typing, Ticks, WaHeader, Wordmark} from './ui';

// ---- tempos (segundos) lidos da locução Ana Dias (Groq, palavra a palavra)
const SC = [0, 10.0, 14.4, 24.5, 29.0, 33.0, 46.6, 55.3, 65.8, 71.1, 83.7, 92.3, 103.3, 109.8, 117.0];
const PRE = 5; // a imagem chega 5 quadros antes da fala
type P = {from: number};
const mk = (from: number) => (s: number) => S(s) - from;

const Fonts: React.FC = () => {
  useEffect(() => {
    const h = delayRender('fontes');
    Promise.all([
      document.fonts.load("400 40px Jost"), document.fonts.load("500 40px Jost"), document.fonts.load("600 40px Jost"), document.fonts.load("600 40px Caveat"),
    ]).then(() => continueRender(h)).catch(() => continueRender(h));
  }, []);
  const face = (w: number, f: string, fam = 'Jost') => `@font-face{font-family:'${fam}';font-weight:${w};src:url(${staticFile('fontes/' + f)}) format('woff2');}`;
  return <style>{face(400, 'jost-400.woff2') + face(500, 'jost-500.woff2') + face(600, 'jost-600.woff2') + face(600, 'caveat-600.woff2', 'Caveat')}</style>;
};

// ================================================================= K01 duas da manhã
const MsgPhone: React.FC<{f: number; e: (s: number) => number; show: number; read?: number; y?: number; replied?: boolean}> = ({f, e, show, read, y = 470}) => {
  const rise = approach(f, show, 520, 0, 0.14);
  return (
    <Pos y={y + rise} style={{opacity: clamp(arrive(f, show, 0.2) * 2)}}>
      <Phone w={640} h={960}>
        <WaHeader title="Clínica Dra. Aline" sub="comercial" />
        <div style={{flex: 1, padding: '34px 26px', display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'flex-start'}}>
          <Bubble f={f} at={e(8.1)} out text="Quanto custa a avaliação?" ticks={read !== undefined && f >= read ? 'read' : 'sent'} fs={36} maxW={460} typeOver={36} />
        </div>
        {f >= e(9.9) && read === undefined && null}
      </Phone>
    </Pos>
  );
};

const Clock: React.FC<{f: number; text: string; size: number; y: number; moon?: number}> = ({f, text, size, y, moon = 1}) => (
  <Pos y={y} style={{flexDirection: 'column', alignItems: 'center', ...entra(f, 4, 40, 0.2)}}>
    <div style={{opacity: moon}}><Icon name="moon" size={size * 0.34} color={C.acc} /></div>
    <Txt size={size} weight={600} ls={0.02} lh={1}>{text}</Txt>
  </Pos>
);

const K01: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const igIn = e(2.6), igOut = e(5.7);
  const igA = arrive(f, igIn, 0.16) * (1 - clamp((f - igOut) / 10));
  const clockY = tween(f, igOut, 22, 190, 150, E.cam);
  const clockS = tween(f, igOut, 22, 250, 150, E.cam);
  return (
    <AbsoluteFill>
      <Clock f={f} text="02:00" size={clockS} y={clockY} />
      {igA > 0.01 && (
        <Pos y={560} style={{opacity: clamp(igA * 1.5), transform: `translateY(${(1 - igA) * 80}px) scale(${0.94 + 0.06 * igA})`}}>
          <Card w={800} h={1060} style={{padding: 30, display: 'flex', flexDirection: 'column', gap: 22}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <Logo name="instagram" size={56} />
              <Txt size={34} weight={500} align="left" ls={0}>@dra.aline_marques</Txt>
            </div>
            <div style={{position: 'relative'}}>
              <Photo w={740} h={780} r={34} pos="0% 25%" />
              <div style={{position: 'absolute', right: 26, bottom: 26, width: 92, height: 92, borderRadius: 46, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.line}`}}>
                <Icon name="play" size={44} color={C.ink} />
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{transform: `scale(${1 + 0.45 * pulse(f, e(4.4), 18)})`}}>
                <Icon name="heart" size={64} color={f >= e(4.4) ? C.acc : C.ink} />
              </div>
              <Txt size={32} weight={400} color={C.soft} align="left" ls={0}>gostou do que viu</Txt>
            </div>
          </Card>
        </Pos>
      )}
      <MsgPhone f={f} e={e} show={igOut - 6} y={470} />
    </AbsoluteFill>
  );
};

// ================================================================= K02 ninguém responde
const K02: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const mins = Math.min(272, Math.floor(prog(f, 0, S(4.4)) * 272)) + 120; // 02:00 -> 06:32 (relógio correndo)
  const hh = String(Math.floor(mins / 60)).padStart(2, '0'), mm = String(mins % 60).padStart(2, '0');
  return (
    <AbsoluteFill>
      <Clock f={f + 40} text={`${hh}:${mm}`} size={150} y={150} />
      <Pos y={470}>
        <Phone w={640} h={960}>
          <WaHeader title="Clínica Dra. Aline" sub="comercial" />
          <div style={{flex: 1, padding: '34px 26px', display: 'flex', flexDirection: 'column', gap: 18}}>
            <Bubble f={f + 999} at={0} out text="Quanto custa a avaliação?" ticks="read" fs={36} maxW={460} />
            <div style={{opacity: arrive(f, e(10.1), 0.2), textAlign: 'right'}}>
              <Txt size={26} weight={400} color={C.soft} align="right" ls={0}>visto · sem resposta</Txt>
            </div>
          </div>
        </Phone>
      </Pos>
      <Say f={f} y={1680} lines={[
        {at: e(10.0), text: 'Ninguém responde.', size: 78},
        {at: e(11.7), text: 'Não é descuido.', size: 78},
        {at: e(12.7), text: <>A equipe também <span style={{color: C.acc}}>dorme</span>.</>, size: 78},
      ]} />
    </AbsoluteFill>
  );
};

// ================================================================= K03 quem responde primeiro
const Clinic: React.FC<{f: number; at: number; title: string; status: string; time: string; good?: boolean}> = ({f, at, title, status, time, good}) => (
  <div style={{...entra(f, at, 60, 0.18)}}>
    <Card w={900} h={250} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '0 40px', borderColor: good ? C.acc : C.line, borderWidth: good ? 4 : 2}}>
      <div style={{width: 104, height: 104, borderRadius: 52, background: good ? C.acc : C.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
        <Icon name={good ? 'check' : 'clock'} size={56} color={good ? C.white : C.soft} />
      </div>
      <div style={{flex: 1}}>
        <Txt size={46} align="left" ls={0}>{title}</Txt>
        <Txt size={34} weight={400} color={good ? C.acc : C.soft} align="left" ls={0}>{status}</Txt>
      </div>
      <Txt size={64} weight={500} color={good ? C.acc : C.soft} ls={0}>{time}</Txt>
    </Card>
  </div>
);

const K03: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  return (
    <AbsoluteFill>
      <Pos y={230} style={{flexDirection: 'column', gap: 36, alignItems: 'center'}}>
        <Clinic f={f} at={e(14.5)} title="Clínica da Dra. Aline" status="mensagem esperando resposta" time="08:00" />
        <Clinic f={f} at={e(18.9)} title="Outra clínica" status="respondeu em 2 minutos · fechou" time="02:02" good />
      </Pos>
      <Pos y={880}><div style={{width: 900}}>
        <div style={{...entra(f, e(20.1), 40, 0.2)}}><Txt size={104} align="left" ls={-0.02}>Quem pergunta primeiro</Txt></div>
        {f >= e(21.4) && <div style={{...entra(f, e(21.4), 40, 0.2)}}><Txt size={104} align="left" ls={-0.02} color={C.soft} weight={500}>costuma fechar com</Txt></div>}
        {f >= e(22.8) && <div style={{...entra(f, e(22.8), 40, 0.2)}}><Txt size={104} align="left" ls={-0.02} color={C.acc}>quem responde primeiro.</Txt></div>}
      </div></Pos>
    </AbsoluteFill>
  );
};

// ================================================================= K04 cada vez mais
const K04: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const n = Math.round(tween(f, e(25.0), S(3.3), 1, 38, E.prod));
  const pills = Array.from({length: 9}, (_, i) => i);
  return (
    <AbsoluteFill>
      <Pos y={250} style={{flexDirection: 'column', alignItems: 'center', ...entra(f, e(24.6), 40, 0.2)}}>
        <Txt size={420} weight={600} color={C.acc} ls={-0.03} lh={0.95}>{n}</Txt>
        <Txt size={64} weight={500} color={C.soft} ls={0}>mensagens novas</Txt>
      </Pos>
      <Pos y={880} style={{flexDirection: 'column', alignItems: 'center', gap: 22}}>
        {pills.map((i) => {
          const at = e(25.2) + i * 11;
          if (f < at) return <div key={i} style={{height: 96}} />;
          return (
            <div key={i} style={{...entra(f, at, 30, 0.25), width: 760 - (i % 3) * 40}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 20, background: C.white, border: `2px solid ${C.line}`, borderRadius: 999, padding: '16px 30px', height: 96, boxSizing: 'border-box'}}>
                <Logo name="whatsapp" size={46} />
                <Txt size={32} weight={400} align="left" ls={0} color={C.soft} style={{flex: 1}}>{['Quanto custa?', 'Tem horário amanhã?', 'Como funciona?', 'Aceita cartão?', 'Onde fica?', 'Pode me atender hoje?', 'Quero agendar', 'Fazem retoque?', 'Tem vaga sábado?'][i]}</Txt>
                <Txt size={26} weight={400} color={C.sand} ls={0}>agora</Txt>
              </div>
            </div>
          );
        })}
      </Pos>
      <Pos y={1790}><Txt size={30} weight={400} color={C.sand} ls={0.04}>ilustração</Txt></Pos>
    </AbsoluteFill>
  );
};

// ================================================================= K05 duas peças
const Piece: React.FC<{f: number; at: number; icon: string; title: string; sub: string; y: number}> = ({f, at, icon, title, sub, y}) => (
  <Pos y={y}>
    <div style={entra(f, at, 90, 0.16)}>
      <Card w={880} h={430} style={{display: 'flex', alignItems: 'center', gap: 46, padding: '0 56px'}}>
        <div style={{width: 190, height: 190, borderRadius: 64, background: C.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
          <Icon name={icon} size={116} color={C.acc} />
        </div>
        <div>
          <Txt size={68} align="left" ls={-0.015} lh={1.05}>{title}</Txt>
          <Txt size={38} weight={400} color={C.soft} align="left" ls={0} style={{marginTop: 12}}>{sub}</Txt>
        </div>
      </Card>
    </div>
  </Pos>
);

const K05: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const pl = spring(f, e(31.6), 0.3, 0.6);
  return (
    <AbsoluteFill>
      <Pos y={250}><div style={entra(f, e(29.2), 40, 0.2)}><Txt size={96} ls={-0.02}>Duas peças.</Txt></div></Pos>
      <Piece f={f} at={e(30.7)} icon="chats" title="Robô de atendimento" sub="responde no WhatsApp" y={480} />
      <Pos y={955}><div style={{width: 130, height: 130, borderRadius: 65, background: C.acc, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pl})`}}><Icon name="plus" size={72} color={C.white} /></div></Pos>
      <Piece f={f} at={e(31.2)} icon="kanban" title="Painel da clínica" sub="CRM e administração" y={1120} />
      <Pos y={1640}><div style={entra(f, e(31.9), 40, 0.2)}><Txt size={70} color={C.acc} ls={-0.015}>Trabalham juntas.</Txt></div></Pos>
    </AbsoluteFill>
  );
};

// ================================================================= K06 o robô
const Check: React.FC<{f: number; at: number; text: string}> = ({f, at, text}) => (
  f < at ? <div style={{height: 92}} /> : (
    <div style={{display: 'flex', alignItems: 'center', gap: 24, height: 92, ...entra(f, at, 30, 0.22)}}>
      <div style={{width: 64, height: 64, borderRadius: 32, background: C.acc, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="check" size={40} color={C.white} /></div>
      <Txt size={58} weight={500} align="left" ls={-0.01}>{text}</Txt>
    </div>
  )
);

const K06: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  return (
    <AbsoluteFill>
      <Pos y={185} style={{...entra(f, 2, 70, 0.16)}}>
        <Phone w={640} h={1060}>
          <WaHeader title="Clínica Dra. Aline" sub="atendimento" tag={f >= e(37.3) ? (
            <div style={{display: 'flex', alignItems: 'center', gap: 10, background: C.bg2, borderRadius: 999, padding: '8px 18px', ...entra(f, e(37.3), 20, 0.25)}}>
              <Dot f={f} size={14} /><Txt size={24} weight={600} color={C.acc} ls={0.02}>24 h</Txt>
            </div>
          ) : null} />
          <div style={{flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16}}>
            <Bubble f={f} at={e(33.6)} text="Oi! Queria saber sobre harmonização facial" fs={30} maxW={470} />
            <Typing f={f} at={e(35.0)} until={e(36.0)} out />
            <Bubble f={f} at={e(36.0)} out text="Oi! Aqui a gente começa com uma avaliação, para entender o que faz sentido para o seu rosto." fs={30} maxW={480} tag="ROBÔ" />
            <Bubble f={f} at={e(41.0)} text="Quanto tempo dura?" fs={30} maxW={470} />
            <Typing f={f} at={e(41.8)} until={e(42.6)} out />
            <Bubble f={f} at={e(42.6)} out text="Cada caso é avaliado pela Doutora na consulta. Posso ver um horário para você?" fs={30} maxW={480} tag="ROBÔ" />
            <Bubble f={f} at={e(44.8)} out text="Tenho amanhã às 15h ou sexta às 10h. Qual prefere?" fs={30} maxW={480} tag="ROBÔ" />
          </div>
        </Phone>
      </Pos>
      <Pos x={150} y={1290} style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
        <Check f={f} at={e(39.8)} text="Explica os procedimentos" />
        <Check f={f} at={e(41.7)} text="Tira as dúvidas" />
        <Check f={f} at={e(42.8)} text="Entende o que a pessoa procura" />
        <Check f={f} at={e(44.9)} text="Já oferece um horário" />
      </Pos>
    </AbsoluteFill>
  );
};

// ================================================================= K07 passa a conversa
const K07: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const hand = f >= e(48.4);
  return (
    <AbsoluteFill>
      <Pos y={185}>
        <Phone w={640} h={1060}>
          <WaHeader title="Clínica Dra. Aline" sub={hand ? 'Dra. Aline na conversa' : 'atendimento'} tag={(
            <div style={{display: 'flex', alignItems: 'center', gap: 10, background: hand ? C.acc : C.bg2, borderRadius: 999, padding: '8px 18px'}}>
              <Txt size={24} weight={600} color={hand ? C.white : C.acc} ls={0.02}>{hand ? 'robô off' : 'robô'}</Txt>
            </div>
          )} />
          <div style={{flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16}}>
            <Bubble f={f + 999} at={0} text="Posso fazer uma avaliação com a Doutora?" fs={30} maxW={470} />
            <Bubble f={f + 999} at={0} out text="Claro! Esse assunto é com ela." fs={30} maxW={480} tag="ROBÔ" />
            {f >= e(47.6) && (
              <div style={{...entra(f, e(47.6), 24, 0.22), display: 'flex', justifyContent: 'center'}}>
                <div style={{background: C.bg2, borderRadius: 999, padding: '12px 26px'}}><Txt size={26} weight={500} color={C.soft} ls={0}>passando para a Doutora Aline</Txt></div>
              </div>
            )}
            {f >= e(49.0) && (
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, ...entra(f, e(49.0), 30, 0.2)}}>
                <Avatar size={92} style={{marginBottom: 6}} />
                <div style={{flex: 1, minWidth: 0}}><Bubble f={f + 999} at={0} out text="Olá! Eu assumo daqui. Vamos marcar sua avaliação?" fs={30} maxW={420} tag="DRA. ALINE" /></div>
              </div>
            )}
          </div>
        </Phone>
      </Pos>
      <Say f={f} y={1370} w={920} lines={[
        {at: e(47.4), text: 'Pede a Doutora?', size: 78},
        {at: e(49.6), text: 'Ele passa na hora.', size: 78},
        {at: e(52.8), text: <>Quem manda continua sendo <span style={{color: C.acc}}>a clínica</span>.</>, size: 78},
      ]} />
    </AbsoluteFill>
  );
};

// ================================================================= K08 painel CRM
const Col: React.FC<{title: string; x: number; w: number}> = ({title, x, w}) => (
  <div style={{position: 'absolute', left: x, top: 150, width: w, bottom: 36, background: C.bg, borderRadius: 34, border: `2px solid ${C.line}`}}>
    <Txt size={30} weight={600} color={C.soft} align="left" ls={0.02} style={{padding: '24px 26px'}}>{title}</Txt>
  </div>
);

const Lead: React.FC<{name: string; tag: string; x: number; y: number; w: number; glow?: number; icon?: boolean}> = ({name, tag, x, y, w, glow = 0, icon = true}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, background: C.white, borderRadius: 28, border: `${2 + 3 * glow}px solid ${glow > 0.1 ? C.acc : C.line}`, padding: '20px 22px', boxSizing: 'border-box'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      <Txt size={32} align="left" ls={0} style={{flex: 1}}>{name}</Txt>
      {icon && <Logo name="whatsapp" size={30} />}
    </div>
    <div style={{display: 'inline-block', marginTop: 10, background: C.bg2, borderRadius: 999, padding: '4px 16px'}}><Txt size={24} weight={500} color={C.acc} ls={0}>{tag}</Txt></div>
  </div>
);

const K08: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const cw = 288, gx = 18, x0 = 30;
  const colX = (i: number) => x0 + i * (cw + gx);
  const drop = approach(f, e(60.6), -120, 0, 0.18);
  const m1 = tween(f, e(64.3), 16, 0, 1, E.expr), m2 = tween(f, e(65.0), 16, 0, 1, E.expr);
  const col = m2 > 0 ? lerp(1, 2, m2) : lerp(0, 1, m1);
  const hl = (a: number, b: number) => clamp((f - e(a)) / 6) * (1 - clamp((f - e(b)) / 6));
  return (
    <AbsoluteFill>
      <Pos y={190}>
        <Card w={1000} h={960} style={{position: 'relative', overflow: 'hidden', borderRadius: 56, ...entra(f, 2, 60, 0.16)}}>
          <div style={{height: 108, display: 'flex', alignItems: 'center', gap: 14, padding: '0 36px', borderBottom: `2px solid ${C.line}`}}>
            {[C.line, C.line, C.line].map((c, i) => <div key={i} style={{width: 20, height: 20, borderRadius: 10, background: c}} />)}
            <Txt size={30} weight={500} color={C.soft} ls={0} style={{marginLeft: 20}}>Painel · Dra. Aline Marques</Txt>
          </div>
          <Col title="NOVO" x={colX(0)} w={cw} />
          <Col title="CONVERSANDO" x={colX(1)} w={cw} />
          <Col title="AGENDADO" x={colX(2)} w={cw} />
          <Lead name="Camila R." tag="Retoque" x={colX(1) + 14} y={230} w={cw - 28} />
          <Lead name="Júlia P." tag="Avaliação" x={colX(2) + 14} y={230} w={cw - 28} />
          <Lead name="Renata M." tag="Dúvida" x={colX(0) + 14} y={400} w={cw - 28} />
          {f >= e(60.6) && (
            <Lead name="Mariana S." tag="Harmonização" x={colX(0) + 14 + (colX(2) - colX(0)) * 0 + (col > 1 ? (col - 0) * 0 : 0) + (colX(1) - colX(0)) * Math.min(col, 1) + (colX(2) - colX(1)) * Math.max(col - 1, 0)}
              y={230 + drop} w={cw - 28} glow={Math.max(hl(62.6, 64.2), hl(63.5, 64.2), hl(64.4, 66.5))} />
          )}
        </Card>
      </Pos>
      <Say f={f} y={1280} lines={[
        {at: e(60.6), text: 'Cada contato fica registrado.', size: 70},
        {at: e(62.6), text: <>Quem <span style={{color: C.acc}}>é</span></>, size: 90},
        {at: e(63.5), text: <>O que <span style={{color: C.acc}}>procurou</span></>, size: 90},
        {at: e(64.4), text: <>Em que <span style={{color: C.acc}}>etapa</span> está</>, size: 90},
      ]} />
    </AbsoluteFill>
  );
};

// ================================================================= K09 tudo num lugar só
const Tile: React.FC<{f: number; at: number; icon: string; label: string; join: number}> = ({f, at, icon, label, join}) => (
  <div style={{...entra(f, at, 70, 0.17), width: 440 - 40 * join, height: 400, background: C.white, border: `2px solid ${C.line}`, borderRadius: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
    <Icon name={icon} size={150} color={C.acc} />
    <Txt size={58} ls={-0.01}>{label}</Txt>
  </div>
);

const K09: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const join = tween(f, e(69.7), 20, 0, 1, E.expr);
  return (
    <AbsoluteFill>
      <Pos y={260}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 - 36 * join, position: 'relative'}}>
          <Tile f={f} at={e(65.9)} icon="calcheck2" label="Agenda" join={join} />
          <Tile f={f} at={e(66.8)} icon="users3" label="Pacientes" join={join} />
          <Tile f={f} at={e(67.9)} icon="arrows-clockwise" label="Retornos" join={join} />
          <Tile f={f} at={e(68.7)} icon="bell" label="Lembretes" join={join} />
        </div>
      </Pos>
      {f >= e(69.7) && <Pos y={1260}><div style={entra(f, e(69.7), 60, 0.18)}><Txt size={110} ls={-0.02}>Tudo num <span style={{color: C.acc}}>lugar só.</span></Txt></div></Pos>}
    </AbsoluteFill>
  );
};

// ================================================================= K10 do papel para a tela
const Row: React.FC<{f: number; at: number; icon: string; label: string; hand?: boolean}> = ({f, at, icon, label, hand}) => (
  f < at ? <div style={{height: 150}} /> : (
    <div style={{display: 'flex', alignItems: 'center', gap: 28, height: 150, ...entra(f, at, 30, 0.22)}}>
      {!hand && <div style={{width: 96, height: 96, borderRadius: 32, background: C.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={icon} size={58} color={C.acc} /></div>}
      {hand ? <div style={{fontFamily: HAND, fontWeight: 600, fontSize: 86, color: C.ink, lineHeight: 1, transform: 'rotate(-1.2deg)'}}>{label}</div> : <Txt size={56} weight={500} align="left" ls={0} style={{flex: 1}}>{label}</Txt>}
      {!hand && <div style={{background: C.bg2, borderRadius: 999, padding: '8px 22px'}}><Txt size={28} weight={500} color={C.acc} ls={0}>em dia</Txt></div>}
    </div>
  )
);

const K10: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const swap = tween(f, e(79.1), 18, 0, 1, E.expr);
  return (
    <AbsoluteFill>
      <Pos y={190}><div style={entra(f, e(71.3), 40, 0.2)}><Txt size={84} ls={-0.02}>E a administração <span style={{color: C.acc}}>também.</span></Txt></div></Pos>
      {swap < 0.99 && (
        <Pos y={420} style={{transform: `translateX(${-swap * 1100}px) rotate(${-2 + swap * -6}deg)`, opacity: 1 - swap}}>
          <div style={{width: 820, height: 940, background: '#FFFDF7', border: `2px solid ${C.line}`, borderRadius: 24, padding: '54px 64px', boxSizing: 'border-box', position: 'relative', ...entra(f, e(72.0), 60, 0.16)}}>
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{position: 'absolute', left: 36, right: 36, top: 190 + i * 150, height: 2, background: '#E8D9BF'}} />)}
            <div style={{position: 'absolute', left: 110, top: 0, bottom: 0, width: 3, background: '#E7B7B0'}} />
            <div style={{paddingLeft: 60, paddingTop: 20}}>
              <Row f={f} at={e(73.1)} icon="package" label="Compras" hand />
              <Row f={f} at={e(73.6)} icon="package" label="Estoque" hand />
              <Row f={f} at={e(74.5)} icon="receipt2" label="Contas a pagar" hand />
              <Row f={f} at={e(75.6)} icon="dollar" label="Contas a receber" hand />
            </div>
            {f >= e(77.4) && <div style={{position: 'absolute', right: 40, bottom: 30, transform: `rotate(${-30 + 12 * Math.sin((f - e(77.4)) / 5)}deg)`, ...entra(f, e(77.4), 30, 0.2)}}><Icon name="pencil" size={130} color={C.acc} /></div>}
          </div>
        </Pos>
      )}
      {swap > 0.01 && (
        <Pos y={420} style={{transform: `translateX(${(1 - swap) * 1100}px)`, opacity: swap}}>
          <Card w={900} h={820} style={{padding: '40px 48px', boxSizing: 'border-box'}}>
            <Txt size={32} weight={500} color={C.soft} align="left" ls={0.05} style={{marginBottom: 12}}>ADMINISTRAÇÃO</Txt>
            <Row f={f + 999} at={0} icon="package" label="Compras" />
            <Row f={f + 999} at={0} icon="tray" label="Estoque" />
            <Row f={f + 999} at={0} icon="receipt2" label="Contas a pagar" />
            <Row f={f + 999} at={0} icon="dollar" label="Contas a receber" />
          </Card>
        </Pos>
      )}
      <Pos y={1480} style={{gap: 20}}>
        <Chip f={f} at={e(79.9)} icon="list" text="Organizado" fs={40} />
        <Chip f={f} at={e(81.2)} icon="seal" text="Seguro" fs={40} />
        <Chip f={f} at={e(82.8)} icon="mobile" text="Em qualquer lugar" fs={40} />
      </Pos>
      {f >= e(76.4) && f < e(79.2) && <Pos y={1480}><div style={entra(f, e(76.4), 30, 0.2)}><Txt size={64} color={C.soft} weight={500} ls={0}>hoje: papel e caneta</Txt></div></Pos>}
    </AbsoluteFill>
  );
};

// ================================================================= K11 prova
const K11: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const rows = ['atendimento em andamento', 'pedido registrado', 'cliente respondido', 'atendimento em andamento'];
  return (
    <AbsoluteFill>
      <Pos y={240}><div style={entra(f, e(83.9), 40, 0.2)}><Txt size={110} ls={-0.02}>Isso não é<br />promessa solta.</Txt></div></Pos>
      <Pos y={800}>
        <div style={entra(f, e(86.0), 80, 0.16)}>
          <Card w={900} h={640} style={{padding: '44px 52px', boxSizing: 'border-box'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 20}}>
              <Dot f={f} size={26} />
              <Txt size={50} align="left" ls={-0.01}>Robô no ar</Txt>
              <div style={{flex: 1}} />
              {f >= e(89.3) && <div style={entra(f, e(89.3), 20, 0.25)}><Txt size={40} weight={500} color={C.acc} ls={0}>todos os dias</Txt></div>}
            </div>
            {rows.map((r, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, height: 116, borderTop: `2px solid ${C.line}`, ...entra(f, e(86.6) + i * 12, 24, 0.24)}}>
                <Logo name="whatsapp" size={50} />
                <Txt size={38} weight={400} align="left" color={C.soft} ls={0} style={{flex: 1}}>cliente · {r}</Txt>
                <Icon name="check" size={44} color={C.acc} />
              </div>
            ))}
          </Card>
        </div>
      </Pos>
      <Pos y={1620}><Chip f={f} at={e(91.3)} icon="pin" text="Restaurante em Sobradinho" fs={46} /></Pos>
    </AbsoluteFill>
  );
};

// ================================================================= K12 caminho
const Step: React.FC<{f: number; at: number; n: number; text: string; extra?: React.ReactNode}> = ({f, at, n, text, extra}) => (
  f < at ? <div style={{height: 210}} /> : (
    <div style={{display: 'flex', alignItems: 'center', gap: 36, height: 210, ...entra(f, at, 50, 0.2)}}>
      <div style={{width: 120, height: 120, borderRadius: 60, background: C.acc, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}><Txt size={72} color={C.white} ls={0}>{n}</Txt></div>
      <div style={{flex: 1}}>
        <Txt size={64} align="left" ls={-0.015} lh={1.05}>{text}</Txt>
        {extra}
      </div>
    </div>
  )
);

const K12: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  const sw = (c: string, d = 0) => <div style={{width: 64, height: 64, borderRadius: 22, background: c, border: `2px solid ${C.line}`, transform: `scale(${arrive(f, e(96.9) + d, 0.25)})`}} />;
  return (
    <AbsoluteFill>
      <Pos y={230}><div style={entra(f, e(92.5), 40, 0.2)}><Txt size={100} ls={-0.02}>O caminho é <span style={{color: C.acc}}>simples.</span></Txt></div></Pos>
      <Pos x={110} y={520} style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: 900}}>
        <Step f={f} at={e(94.0)} n={1} text="Entende a rotina da clínica" />
        <Step f={f} at={e(96.0)} n={2} text="Monta com a cara da Doutora Aline" extra={<div style={{display: 'flex', gap: 14, marginTop: 14}}>{sw(C.bg, 0)}{sw(C.sand, 4)}{sw(C.ink, 8)}{sw(C.acc, 12)}</div>} />
        <Step f={f} at={e(98.2)} n={3} text="Mostra funcionando" />
        <Step f={f} at={e(100.2)} n={4} text="Ajusta cada detalhe com vocês" />
      </Pos>
    </AbsoluteFill>
  );
};

// ================================================================= K13 menos / mais
const Less: React.FC<{f: number; at: number; icon: string; text: string; strike?: boolean; color?: string; size?: number; sub?: string}> = ({f, at, icon, text, strike, color = C.soft, size = 100, sub}) => (
  f < at ? <div style={{height: 300}} /> : (
    <div style={{display: 'flex', alignItems: 'center', gap: 34, height: 300, ...entra(f, at, 40, 0.2)}}>
      <Icon name={icon} size={110} color={strike ? C.sand : C.acc} />
      <div style={{position: 'relative'}}>
        <Txt size={size} align="left" ls={-0.02} color={color} lh={1.02} style={strike && f >= at + 16 ? {textDecoration: 'line-through', textDecorationColor: C.acc, textDecorationThickness: 7} : undefined}>{text}</Txt>
      </div>
    </div>
  )
);

const K13: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  return (
    <AbsoluteFill>
      <Pos x={100} y={420} style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: 900}}>
        <Less f={f} at={e(103.4)} icon="notebook" text="Menos papel." strike />
        <Less f={f} at={e(104.5)} icon="chats" text="Menos mensagem sem resposta." strike size={86} />
        <Less f={f} at={e(106.5)} icon="heart" text="Mais tempo para cuidar de quem escolheu a clínica." color={C.ink} size={86} />
      </Pos>
    </AbsoluteFill>
  );
};

// ================================================================= K14 fecho
const K14: React.FC<P> = ({from}) => {
  const f = useCurrentFrame();
  const e = mk(from);
  return (
    <AbsoluteFill>
      <Pos y={250}><div style={entra(f, 2, 70, 0.14)}><Photo w={720} h={1000} r={120} pos="0% 28%" /></div></Pos>
      <Pos y={1310}><div style={entra(f, e(110.0), 40, 0.2)}><Txt size={96} ls={-0.02}>Dra. Aline Marques</Txt></div></Pos>
      {f >= e(112.0) && <Pos y={1470}><div style={entra(f, e(112.0), 30, 0.2)}><Txt size={58} weight={400} color={C.soft} ls={0}>Beleza com estratégia...</Txt></div></Pos>}
      {f >= e(113.3) && <Pos y={1560}><div style={entra(f, e(113.3), 30, 0.2)}><Txt size={66} color={C.acc} ls={-0.01}>agora também no atendimento.</Txt></div></Pos>}
    </AbsoluteFill>
  );
};

const SCENES: {id: string; C: React.FC<P>}[] = [
  {id: 'K01', C: K01}, {id: 'K02', C: K02}, {id: 'K03', C: K03}, {id: 'K04', C: K04}, {id: 'K05', C: K05}, {id: 'K06', C: K06}, {id: 'K07', C: K07},
  {id: 'K08', C: K08}, {id: 'K09', C: K09}, {id: 'K10', C: K10}, {id: 'K11', C: K11}, {id: 'K12', C: K12}, {id: 'K13', C: K13}, {id: 'K14', C: K14},
];

export const TOTAL = S(SC[SC.length - 1]);

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: C.bg, fontFamily: FONT}}>
    <Fonts />
    {SCENES.map((s, i) => {
      const from = i === 0 ? 0 : S(SC[i]) - PRE;
      const to = i === SCENES.length - 1 ? TOTAL : S(SC[i + 1]) - PRE;
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.id}>
          <s.C from={from} />
        </Sequence>
      );
    })}
    <Sequence from={0} durationInFrames={S(SC[13]) - PRE}><Wordmark /></Sequence>
  </AbsoluteFill>
);
