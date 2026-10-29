// Painel de revisão: a edição tocando AO VIVO a partir do código (sem render) + notas presas ao quadro exato.
// O usuário pausa, marca o ponto (ou o trecho) e escreve o que quer; o Claude lê projeto/revisao/notas.json
// e corrige só aqueles trechos. Qualquer mudança no projeto recarrega a prévia sozinha.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {EditorVideo} from '../src/EditorVideo';
import {DIM} from '../src/layout';
import type {Entrada, Formato} from '../src/tipos';

type Nota = {id: string; s: number; e: number; quadro: number; texto: string; fala: string; status: 'pendente' | 'corrigido' | 'aprovado'; criada: string};

const tempo = (s: number) => {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(2).padStart(5, '0')}`;
};
const json = (r: Response) => {
  if (!r.ok) throw new Error(r.statusText);
  return r.json();
};

const App: React.FC = () => {
  const [entrada, setEntrada] = React.useState<Entrada | null>(null);
  const [erro, setErro] = React.useState('');
  const [notas, setNotas] = React.useState<Nota[]>([]);
  const [quadro, setQuadro] = React.useState(0);
  const [marca, setMarca] = React.useState<{s: number; e: number} | null>(null);
  const [texto, setTexto] = React.useState('');
  const [versao, setVersao] = React.useState('');
  const [aviso, setAviso] = React.useState('');
  const player = React.useRef<PlayerRef>(null);
  const caixa = React.useRef<HTMLTextAreaElement>(null);

  const carrega = React.useCallback(() => {
    fetch('/entrada.json').then(json).then((e) => { setEntrada(e); setErro(''); }).catch((e) => setErro(String(e)));
    fetch('/notas').then(json).then(setNotas).catch(() => {});
  }, []);
  React.useEffect(carrega, [carrega]);

  // vigia o projeto: mudou roteiro/base/rosto -> recarrega as props; mudou o código -> recarrega a página
  React.useEffect(() => {
    const id = setInterval(() => {
      fetch('/versao').then(json).then((v: {dados: string; codigo: string}) => {
        setVersao((ant) => {
          if (ant && ant.split('|')[1] !== v.codigo) location.reload();
          else if (ant && ant.split('|')[0] !== v.dados) { carrega(); setAviso('prévia atualizada'); setTimeout(() => setAviso(''), 2000); }
          return v.dados + '|' + v.codigo;
        });
      }).catch(() => {});
    }, 1000);
    return () => clearInterval(id);
  }, [carrega]);

  React.useEffect(() => {
    const p = player.current;
    if (!p) return;
    const fn = (e: {detail: {frame: number}}) => setQuadro(e.detail.frame);
    p.addEventListener('frameupdate', fn);
    return () => p.removeEventListener('frameupdate', fn);
  }, [entrada]);

  const fps = entrada?.base.fps ?? 30;
  const t = quadro / fps;

  const salvar = (lista: Nota[]) => {
    setNotas(lista);
    fetch('/notas', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(lista)});
  };
  const fala = (s: number, e: number) =>
    (entrada?.palavras ?? []).filter((w) => w.e >= s - 0.3 && w.s <= e + 0.3).map((w) => w.w).join(' ');

  const novaNota = () => {
    player.current?.pause();
    if (!marca) setMarca({s: t, e: t});
    setTimeout(() => caixa.current?.focus(), 0);
  };
  const grava = () => {
    if (!texto.trim() || !marca) return;
    const s = Math.min(marca.s, marca.e);
    const e = Math.max(marca.s, marca.e);
    salvar([...notas, {id: Date.now().toString(36), s: +s.toFixed(3), e: +e.toFixed(3), quadro: Math.round(s * fps), texto: texto.trim(),
      fala: fala(s, e), status: 'pendente', criada: new Date().toISOString()}].sort((a, b) => a.s - b.s));
    setTexto('');
    setMarca(null);
  };

  React.useEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement).tagName === 'TEXTAREA') {
        if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); grava(); }
        if (ev.key === 'Escape') { setMarca(null); (ev.target as HTMLElement).blur(); }
        return;
      }
      const p = player.current;
      if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); novaNota(); }
      if (ev.key === 'i' || ev.key === 'I') setMarca((m) => ({s: t, e: m ? Math.max(m.e, t) : t}));
      if (ev.key === 'o' || ev.key === 'O') setMarca((m) => ({s: m ? Math.min(m.s, t) : t, e: t}));
      if (ev.key === ' ') { ev.preventDefault(); p?.toggle(); }
      if (ev.key === 'ArrowLeft') p?.seekTo(Math.max(0, quadro - (ev.shiftKey ? fps : 1)));
      if (ev.key === 'ArrowRight') p?.seekTo(quadro + (ev.shiftKey ? fps : 1));
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  if (erro) return <div className="erro">Não consegui ler o projeto: {erro}</div>;
  if (!entrada) return <div className="erro">carregando…</div>;
  const [W, H] = DIM[(entrada.roteiro.formato ?? '9:16') as Formato];
  const dur = Math.max(1, Math.round(entrada.base.duracao * fps));
  const agora = (entrada.palavras ?? []).filter((w) => w.s <= t + 0.05 && w.e >= t - 1.2).map((w) => w.w).join(' ');
  const pend = notas.filter((n) => n.status === 'pendente').length;

  return (
    <div className="tudo">
      <div className="palco">
        <Player ref={player} component={EditorVideo} inputProps={entrada} durationInFrames={dur} fps={fps}
          compositionWidth={W} compositionHeight={H} controls acknowledgeRemotionLicense clickToPlay={false} doubleClickToFullscreen={false}
          style={{height: '100%', aspectRatio: `${W} / ${H}`, maxWidth: '100%', borderRadius: 14, overflow: 'hidden', background: '#000'}} />
      </div>
      <div className="lado">
        <div className="topo">
          <div className="relogio">{tempo(t)} <span>quadro {quadro}</span></div>
          {aviso && <div className="aviso">{aviso}</div>}
        </div>
        <div className="agora">{agora || '…'}</div>
        <div className="botoes">
          <button className="principal" onClick={novaNota}>Nota neste ponto <kbd>N</kbd></button>
          <button onClick={() => setMarca((m) => ({s: t, e: m ? Math.max(m.e, t) : t}))}>Início <kbd>I</kbd></button>
          <button onClick={() => setMarca((m) => ({s: m ? Math.min(m.s, t) : t, e: t}))}>Fim <kbd>O</kbd></button>
        </div>
        {marca && (
          <div className="nova">
            <div className="faixa">{marca.s === marca.e ? `em ${tempo(marca.s)}` : `de ${tempo(Math.min(marca.s, marca.e))} até ${tempo(Math.max(marca.s, marca.e))}`}
              <span> · fala: "{fala(Math.min(marca.s, marca.e), Math.max(marca.s, marca.e)) || '(sem fala)'}"</span></div>
            <textarea ref={caixa} value={texto} onChange={(e) => setTexto(e.target.value)} rows={3}
              placeholder="O que está errado e como deve ficar. Ex.: a legenda cobre o queixo, subir um pouco." />
            <div className="botoes">
              <button className="principal" onClick={grava}>Salvar nota <kbd>Enter</kbd></button>
              <button onClick={() => setMarca(null)}>Cancelar <kbd>Esc</kbd></button>
            </div>
          </div>
        )}
        <div className="titulo-notas">Notas <span>{pend} pendente{pend === 1 ? '' : 's'} de {notas.length}</span></div>
        <div className="notas">
          {notas.length === 0 && <div className="vazio">Sem notas. Pause no ponto exato e aperte N.</div>}
          {notas.map((n) => (
            <div key={n.id} className={`nota ${n.status}`}>
              <button className="chip" onClick={() => player.current?.seekTo(Math.round(n.s * fps))}>
                {tempo(n.s)}{n.e > n.s ? `–${tempo(n.e)}` : ''}
              </button>
              <div className="corpo">
                <div>{n.texto}</div>
                {n.fala && <div className="fala">"{n.fala}"</div>}
              </div>
              <select value={n.status} onChange={(e) => salvar(notas.map((x) => (x.id === n.id ? {...x, status: e.target.value as Nota['status']} : x)))}>
                <option value="pendente">pendente</option>
                <option value="corrigido">corrigido</option>
                <option value="aprovado">aprovado</option>
              </select>
              <button className="x" title="apagar" onClick={() => salvar(notas.filter((x) => x.id !== n.id))}>×</button>
            </div>
          ))}
        </div>
        <div className="rodape">
          Depois diga ao Claude: <b>"aplica as notas da revisão"</b>. Ele corrige só esses trechos e a prévia atualiza aqui.
          <div className="atalhos">Espaço toca/pausa · ← → um quadro · Shift+← → um segundo</div>
        </div>
        <div className="fala-toda">
          {(entrada.palavras ?? []).map((w, i) => (
            <span key={i} className={w.s <= t && t < w.e + 0.05 ? 'ativa' : ''} onClick={() => player.current?.seekTo(Math.round(w.s * fps))}>{w.w} </span>
          ))}
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById('raiz')!).render(<App />);
