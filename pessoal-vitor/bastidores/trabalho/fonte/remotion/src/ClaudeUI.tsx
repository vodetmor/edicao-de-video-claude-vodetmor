// Interface do app Claude (tema escuro), recriada a partir dos prints do Vítor. Componentes reutilizáveis.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {UI} from './lib';
import {TEXT, SERIF} from './Fonts';

const ico = (d: React.ReactNode, s = 26) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
export const I = {
  plus: ico(<><path d="M12 5v14M5 12h14" /></>),
  box: ico(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M6 4h12M8 11h8" /></>),
  art: ico(<><circle cx="8" cy="8" r="3.2" /><path d="M14 4l6 6-6 6-6-6z" transform="translate(0 4) scale(.8)" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>),
  clock: ico(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  brief: ico(<><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M9 7V5h6v2M3 12h18" /></>),
  search: ico(<><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>),
  x: ico(<><path d="M6 6l12 12M18 6L6 18" /></>),
  branch: ico(<><circle cx="6" cy="5" r="2" /><circle cx="18" cy="5" r="2" /><circle cx="12" cy="19" r="2" /><path d="M6 7v2a3 3 0 003 3h6a3 3 0 003-3V7M12 12v5" /></>),
  send: ico(<><path d="M12 19V5M6 11l6-6 6 6" /></>, 24),
  mic: ico(<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></>),
  chat: ico(<><path d="M4 5h16v11H9l-5 4z" /></>),
  check: ico(<><path d="M5 12.5l4.5 4.5L19 7.5" /></>),
  book: ico(<><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" /><path d="M4 19V5" /></>),
  key: ico(<><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8M16 7l2 2" /></>),
  music: ico(<><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></>),
  film: ico(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></>),
};

export const Sidebar: React.FC<{ativo: 'projetos' | 'artifacts' | 'fixado'; projeto?: boolean}> = ({ativo, projeto = true}) => {
  const item = (icon: React.ReactNode, label: string, on = false, badge?: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 54, padding: '0 16px', borderRadius: 12, color: UI.text, fontSize: 25,
      background: on ? UI.sel : 'transparent'}}>
      <span style={{color: UI.mute, display: 'flex'}}>{icon}</span>{label}
      {badge && <span style={{fontSize: 17, background: UI.field, color: UI.text, padding: '3px 9px', borderRadius: 7}}>{badge}</span>}
    </div>
  );
  return (
    <div style={{width: 340, height: '100%', background: UI.side, padding: '28px 16px', fontFamily: TEXT, borderRight: `1px solid ${UI.line}`}}>
      <div style={{display: 'flex', gap: 26, color: UI.mute, padding: '0 14px 30px'}}>{I.box}{I.chat}</div>
      {item(<span style={{display: 'flex', width: 26, height: 26, borderRadius: 13, background: UI.field, alignItems: 'center', justifyContent: 'center'}}>{ico(<path d="M12 6v12M6 12h12" />, 18)}</span>, 'Novo')}
      {item(I.box, 'Projetos', ativo === 'projetos', 'Beta')}
      {item(I.art, 'Artifacts', ativo === 'artifacts')}
      {item(I.clock, 'Rotinas')}
      {item(I.brief, 'Personalização')}
      <div style={{color: UI.mute, fontSize: 21, padding: '40px 16px 12px'}}>Fixados</div>
      {projeto && item(I.box, 'Edição de Vídeo com IA', ativo === 'fixado')}
      <div style={{position: 'absolute', bottom: 26, left: 32, display: 'flex', alignItems: 'center', gap: 14, color: UI.text, fontSize: 23}}>
        <span style={{width: 40, height: 40, borderRadius: 20, background: UI.field, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16}}>RV</span>
        Vítor <span style={{color: UI.mute}}>· Pro</span>
      </div>
    </div>
  );
};

export const Janela: React.FC<{children: React.ReactNode; w?: number; h?: number; side?: React.ReactNode}> = ({children, w = 1440, h = 1460, side}) => (
  <div style={{position: 'relative', width: w, height: h, background: UI.bg, display: 'flex', overflow: 'hidden', fontFamily: TEXT, color: UI.text}}>
    {side}
    <div style={{position: 'relative', flex: 1, height: '100%'}}>{children}</div>
  </div>
);

// tela "Projetos": título em serifa, busca, botão Novo projeto, cards
export const TelaProjetos: React.FC<{cards: {nome: string; quando: string; o?: number; s?: number}[]; press?: number; hl?: number}> = ({cards, press = 0, hl = 0}) => (
  <div style={{padding: '70px 56px'}}>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 64, color: UI.text}}>Projetos</div>
      <div style={{background: '#F4F2EE', color: '#141414', fontSize: 26, fontWeight: 500, padding: '14px 24px', borderRadius: 12,
        transform: `scale(${1 - 0.06 * press})`, boxShadow: hl ? `0 0 0 ${6 * hl}px rgba(217,119,87,${0.45 * hl})` : 'none'}}>Novo projeto</div>
    </div>
    <div style={{marginTop: 36, height: 74, borderRadius: 14, background: UI.card, border: `1px solid ${UI.line}`, display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 24px', color: UI.faint, fontSize: 26}}>{I.search}Procurar projetos...</div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 30}}>
      {cards.map((c, i) => (
        <div key={i} style={{opacity: c.o ?? 1, transform: `scale(${c.s ?? 1})`, transformOrigin: 'left top', width: 640, borderRadius: 16, background: UI.card,
          border: `1px solid ${UI.line}`, padding: 26}}>
          <div style={{width: 50, height: 50, borderRadius: 10, background: UI.field, display: 'flex', alignItems: 'center', justifyContent: 'center', color: UI.mute}}>{I.box}</div>
          <div style={{fontSize: 30, fontWeight: 600, marginTop: 22}}>{c.nome}</div>
          <div style={{fontSize: 22, color: UI.mute, marginTop: 18}}>{c.quando}</div>
        </div>
      ))}
    </div>
  </div>
);

export const Caret: React.FC<{f: number; on?: boolean}> = ({f, on = true}) => (
  <span style={{display: 'inline-block', width: 3, height: '1.05em', background: UI.text, marginLeft: 2, verticalAlign: '-0.15em',
    opacity: on && Math.floor(f / 15) % 2 === 0 ? 1 : on ? 0.15 : 0}} />
);

// modal "Novo projeto": Nome (digitado), Meta, Contexto (chips que entram)
export const ModalNovo: React.FC<{f: number; nome: string; digitando: boolean; chips: {icon: React.ReactNode; t: string; s: number}[]; criar?: number}> = ({f, nome, digitando, chips, criar = 0}) => (
  <div style={{width: 1000, borderRadius: 26, background: '#1C1C1B', border: `1px solid ${UI.line}`, padding: '44px 48px', boxShadow: '0 40px 120px rgba(0,0,0,0.6)', fontFamily: TEXT}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{fontSize: 44, fontWeight: 600}}>Novo projeto</div><span style={{color: UI.mute}}>{I.x}</span>
    </div>
    <div style={{fontSize: 26, fontWeight: 600, marginTop: 36}}>Nome</div>
    <div style={{marginTop: 14, height: 84, borderRadius: 14, background: UI.field, border: `2px solid ${UI.blue}`, display: 'flex', alignItems: 'center', gap: 18, padding: '0 20px', fontSize: 30}}>
      <span style={{width: 50, height: 50, borderRadius: 10, background: '#2A2A29', display: 'flex', alignItems: 'center', justifyContent: 'center', color: UI.mute}}>{I.box}</span>
      <span style={{color: nome ? UI.text : UI.faint}}>{nome || 'Desempenho da API'}</span>{digitando && <Caret f={f} />}
    </div>
    <div style={{fontSize: 26, fontWeight: 600, marginTop: 34}}>Meta <span style={{color: UI.mute, fontWeight: 400}}>(opcional)</span></div>
    <div style={{marginTop: 14, height: 110, borderRadius: 14, background: UI.field, border: `1px solid ${UI.line}`, padding: 20, fontSize: 25, color: UI.faint}}>Vídeos com motion, legenda e som, feitos com IA</div>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 34}}>
      <div style={{fontSize: 26, fontWeight: 600}}>Contexto <span style={{color: UI.mute, fontWeight: 400}}>(opcional)</span></div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#2A2A29', padding: '10px 18px', borderRadius: 10, fontSize: 24}}>{I.plus}Adicionar</div>
    </div>
    <div style={{marginTop: 16, borderRadius: 14, border: `1px dashed ${UI.line}`, minHeight: 90}}>
      {chips.map((c, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, height: 84, padding: '0 26px', fontSize: 28, borderTop: i ? `1px dashed ${UI.line}` : 'none',
          opacity: Math.min(1, c.s * 1.5), transform: `translateX(${(1 - c.s) * 60}px)`}}>
          <span style={{color: UI.coral, display: 'flex'}}>{c.icon}</span>{c.t}
        </div>
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'flex-end', gap: 18, marginTop: 34}}>
      <div style={{fontSize: 26, padding: '16px 26px', borderRadius: 12, background: '#2A2A29'}}>Cancelar</div>
      <div style={{fontSize: 26, padding: '16px 26px', borderRadius: 12, background: criar ? '#F4F2EE' : '#9B9A97', color: '#141414', transform: `scale(${1 - 0.06 * criar})`}}>Criar projeto</div>
    </div>
  </div>
);

export const LogoClaude: React.FC<{s?: number; style?: React.CSSProperties}> = ({s = 120, style}) => (
  <Img src={staticFile('img/claude.svg')} style={{width: s, height: s, ...style}} />
);
