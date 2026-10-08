# Apps "Craft" do storytold: os "Adobe em Rust" (avaliado 08/10/2026)

Origem: print de post do X enviado pelo Vítor (Kevin @KevinPicchi, 06/10/2026: "this guy re-created all the
adobe apps with opus-5.5, ported them to rust, and opensourced them"). Thread "Apps Craft".

## Veredito geral: é verdade, e não é vaporware
- Os 7 repositórios existem e são públicos em github.com/storytold, da equipe ArtCraft (getartcraft.com,
  Brandon Thomas / storyteller.ai). Licença MIT ou Apache-2.0 (dupla). Rust puro, sem FFmpeg dentro.
- Feitos em ~1 semana (primeiros commits 30/09 e 01/10/2026) por agentes: a maioria dos commits tem
  "Co-Authored-By: Claude Opus 5.5". 100 mil a 300 mil linhas de Rust por app. Releases com binários
  assinados para Windows/macOS/Linux/web e SHA256SUMS.
- "Portaram para Rust" é impreciso: não é porte do código da Adobe, é reimplementação "clean-room" do zero
  que imita painéis, atalhos e comandos.
- Os próprios READMEs são honestos: "lista de recursos" 70–99%, mas "pronto para trabalho real" 30–70%.
  Não abrem arquivos `.aep` / `.prproj`; sem plug-ins de terceiros; macOS é a plataforma mais testada.
- Segurança: li os build.rs (só embutem créditos/fontes/ícone), o que dispara processos (abrir pasta,
  `curl` para baixar modelos opcionais de IA do Google/GitHub só quando o usuário pede) e o acesso à rede
  (só download opcional de modelos Whisper/MobileSAM/MediaPipe). Nada suspeito. Os binários oficiais
  conferem com o SHA256SUMS. Risco normal de projeto novo: bugs e crashes, não malware.

## Por repositório
| App | Imita | Versão 08/10 | Commits | O que é útil para nós | Veredito |
|---|---|---|---|---|---|
| **effectcraft** | After Effects | 0.6.0 | 840 | 306 efeitos do AE, 3D com câmera/luz/sombra, partículas, tracking, keying, roto; script JS no modelo do AE (`app.project`, `addText`, `setValueAtTime`, expressões `wiggle`/`loopOut`); render sem tela; exporta ProRes 4444 com alfa, WebM com alfa e **Lottie**; servidor MCP | **Usar** como fornecedor de peças para o motor. Testado e funcionando. |
| **filmcraft** | Premiere | 0.4.0 | 650 | Montagem por comandos/JSONL, legendas (SRT/VTT, queimar no vídeo), Lumetri, medidor de loudness EBU R128, ducking, export H.264/ProRes/DNxHR; **exporta a timeline em FCPXML, XML do Premiere, OTIO, EDL, AAF**; MCP | **Usar** para entregar timeline editável ao Vítor e para conferência. Não substitui ffmpeg + Remotion no render. |
| **vectorcraft** | Illustrator | 0.6.0 | 1070 | `convert` abre `.ai` (compatível com PDF), EPS, PDF, SVG e exporta SVG limpo | **Usar** para logo real de cliente que chega em `.ai`/`.pdf`/`.eps`. Testado. |
| **photocraft** | Photoshop | 0.5.0 | 523 | Abre/salva PSD de verdade sem tela; útil se cliente mandar PSD de arte | Guardar para quando chegar PSD. Não testado. |
| **lightcraft** | Lightroom | 0.4.0 | 657 | Revelação de foto RAW/JPEG por comando, MCP | Pouco uso para vídeo. Não testado. |
| **printcraft** (PdfCraft) | Acrobat | 0.4.0 | 370 | Organizar/assinar/preencher PDF por CLI/MCP | Sem uso para vídeo (nossos PDFs já saem do Python). |
| **designcraft** | InDesign | 0.4.0 | 398 | Diagramação, IDML, EPUB, PDF, MCP | Sem uso para vídeo. |

## Testes feitos na nuvem (CPU, 08/10/2026)
- EffectCraft: compilado do código (13 min) e também baixado da release (30 s). `script cartao.jsx` cria um
  cartão squircle com mola (expressão clássica de overshoot do AE) + título Inter subindo. Quadro em 30–80 ms;
  MP4 1080p de 3 s em 10 s; ProRes 4444 `yuva444p12le`. MCP headless: `initialize`, `tools/list` (22 ferramentas),
  `comp.new`, `layer.newSolid`, `add_effect Fractal Noise`, `render_frame`, `save_project` todos ok.
- Lottie: expressões NÃO vão para o Lottie por padrão. Assar antes: `prop.convertExpressionToKeyframes`
  (a mola virou 75 keyframes) e exportar com `textAsShapes: true`.
- Ponte com o motor: o mesmo cartão em Lottie (`@remotion/lottie`) e em ProRes 4444 (`<OffthreadVideo transparent>`)
  ficou idêntico no Remotion. Arquivos: `estudio/craft/provas/`.
- FilmCraft: import de 2 clipes, `file.newSequenceFromClip`, faixa de legenda, `captions.setStyle` Inter 50,
  export H.264+AAC com legenda queimada (7 s para 8 s de vídeo) e FCPXML/OTIO. O FCPXML 1.10 não levou a legenda.
- VectorCraft: `.ai` (PDF) → SVG em 1 comando.
- Não testado: app com janela (não há tela na nuvem), GPU, arquivos grandes, os outros 4 apps.

## Como nos conectar
- Na nuvem: `bash estudio/craft/instalar.sh` e eu chamo os `*-cli` direto pelo terminal. MCP não é necessário aqui,
  o CLI faz tudo e é mais simples.
- No PC do Vítor (Windows): baixar o `.msi` ou o portátil da release; para o Claude Code do PC, registrar
  `claude mcp add effectcraft -- "C:\...\effectcraft-cli.exe" mcp`. Com o app aberto em `--control 9877`,
  `mcp --bridge 9877` deixa o Claude mexer na janela ao vivo e tirar print.

## Limites que importam
- App de 1 semana: comportamento ainda difere do AE/Premiere; bugs aparecem e são corrigidos no mesmo dia. Fixar
  a versão usada em cada obra (anotar no ESTADO.md) para o render não mudar no meio.
- Encoders próprios (H.264 sem as otimizações do x264): para o master final continuar com ffmpeg.
- Não lê projetos da Adobe; templates do AE baixados não abrem. Scripts `.jsx` e expressões do AE funcionam.
- O demo deles é cheio de glow/degradê azul-roxo: é estilo do demo, não do motor. Nosso DESIGN-SYSTEM continua valendo.
