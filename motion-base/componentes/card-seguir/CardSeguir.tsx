// Card final opcional "Seguir" no TikTok (logo, foto, @, clique no botão). Copiado de pessoal-vitor/bastidores.
// Depende de: kit (spring, clamp, lerp, E, prog, Cursor), Fonts (DISPLAY, TEXT), lib (T.fim, PAPEL, TINTA), public/img/tiktok.svg e avatar.jpg.
// perfil do TikTok: logo com o efeito ciano/vermelho, foto, @ e o botão Seguir
const HANDLE = '@vitormach._'; // igual no TikTok e no Instagram
const LogoTikTok: React.FC<{s: number}> = ({s}) => {
  const m = (cor: string, dx: number, dy: number) => (
    <div style={{position: 'absolute', left: dx, top: dy, width: s, height: s, background: cor, WebkitMaskImage: `url(${staticFile('img/tiktok.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat'}} />
  );
  return <div style={{position: 'relative', width: s, height: s}}>{m('#25F4EE', -s * 0.04, -s * 0.04)}{m('#FE2C55', s * 0.04, s * 0.04)}{m('#111', 0, 0)}</div>;
};
const Final: React.FC = () => {
  const f = useCurrentFrame() - T.fim;
  if (f < 0) return null;
  const s = spring(f, 0, 0.35, 0.8);
  const clique = 30;
  const segue = f >= clique + 3;
  const press = f >= clique && f < clique + 8 ? Math.sin(((f - clique) / 8) * Math.PI) : 0;
  const cx = lerp(980, 640, E.expr(prog(f, 10, 18))), cy = lerp(1500, 1220, E.expr(prog(f, 10, 18)));
  return (
    <AbsoluteFill style={{background: PAPEL, alignItems: 'center', justifyContent: 'center', opacity: clamp(s * 1.5), fontFamily: TEXT}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 60, opacity: spring(f, 4, 0.5, 0.8)}}><LogoTikTok s={64} />
        <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: TINTA, letterSpacing: -1}}>TikTok</span></div>
      <div style={{width: 320, height: 320, borderRadius: 160, overflow: 'hidden', transform: `scale(${0.7 + 0.3 * s})`, boxShadow: '0 20px 60px rgba(0,0,0,0.18)'}}>
        <Img src={staticFile('img/avatar.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: TINTA, marginTop: 36, letterSpacing: -1}}>{HANDLE}</div>
      <div style={{fontSize: 34, color: '#6E6E73', marginTop: 8}}>aulas feitas com IA</div>
      <div style={{marginTop: 50, width: 440, height: 110, borderRadius: 14, background: segue ? '#E3E3E6' : '#FE2C55', color: segue ? TINTA : '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 14, fontSize: 46, fontWeight: 800, transform: `scale(${1 - 0.07 * press + (segue ? 0.04 * spring(f, clique + 3, 0.6, 0.4) * Math.exp(-(f - clique - 3) / 8) : 0)})`}}>
        {segue ? <>Seguindo <span style={{color: '#2FBF8F'}}>✓</span></> : 'Seguir'}
      </div>
      <div style={{fontSize: 34, color: TINTA, marginTop: 50, opacity: spring(f, 44, 0.4, 0.9), fontWeight: 600}}>Próxima aula: você escolhe nos comentários</div>
      {f > 8 && <div style={{position: 'absolute', left: cx, top: cy}}><Cursor x={0} y={0} press={press} scale={1.7} /></div>}
    </AbsoluteFill>
  );
};

const topoFundo = (f: number) => {
  const claro = f < T.faceA || (f >= T.manimClip - 2 && f < T.glsl) || (f >= T.comp && f < T.voz);
  return claro ? PAPEL : '#0B0B0B';
};

// a legenda nunca cobre o rosto: na emenda (1100) com a tela em cima; mais abaixo, no peito, quando o rosto ocupa a tela toda
const legendaY = (f: number) => {
  const {m, desde, antes} = modoEm(f);
  const y = (x: Modo) => (x === 'face' ? 1330 : 960);
  return lerp(y(antes), y(m), E.expr(prog(f, desde, 9)));
};

