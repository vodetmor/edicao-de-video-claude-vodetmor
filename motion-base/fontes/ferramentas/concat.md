# Concat (github.com/jub0t/Concat) · avaliado em 31/10/2026

**O que é:** editor de vídeo de timeline grátis e open source, "substituto do CapCut" para Windows, macOS, Linux, Android e iOS. Versão 0.2.8, ainda em beta, mas muito ativo (vários commits por dia em out/2026). Motor nativo em Rust (FFmpeg 7 + compositor na GPU via wgpu, com adaptador por software quando não há GPU).

**O que faz:** corte multi-pista, keyframes com editor de curva, 100 efeitos/transições, títulos com presets, legenda automática com Whisper local, TTS e clonagem de voz locais (sherpa-onnx/Kokoro), remoção de fundo, limpeza de voz e nivelamento de loudness, export H.264/HEVC/AV1 até 4K60. Tudo offline, sem marca d'água nem conta.

**Para agentes:** traz um servidor MCP embutido (`concat --mcp`), com modo `headless` (sem janela) ou pela janela aberta. Ferramentas: criar projeto, importar mídia, `clip_add`/`clip_trim`/`clips_split`, `title_add`, `captions_add`, `keyframe_set`, `effect_layer_add`, `preview_frame`, `export_start`. Também tem API JSON-RPC por socket e uma CLI se compilado do código.

**Licença:** AGPL-3.0. Usar o programa (inclusive para clientes) e os vídeos gerados são livres. Só obriga a abrir código se a gente modificar o Concat e distribuir ou oferecer como serviço.

**Teste ao vivo:** não rodou na nuvem (o download dos releases do GitHub é bloqueado pelo proxy desta sessão, e compilar exige Rust + libs do FFmpeg). Teste real teria que ser no PC do Vítor.

## Veredito: ignorar para o motor; opcional no PC como substituto do CapCut
- **Não serve ao nosso motor.** O nosso padrão é motion escrito em código (Remotion: molas, tipografia cinética, eventos presos à palavra falada, GLSL). O Concat é um editor de timeline estilo CapCut: keyframes e presets de efeito/título, sem molas nem componentes React. Levar uma peça nossa para ele seria descer a régua do DESIGN-SYSTEM.
- **Sobreposição com o que já temos:** corte de vídeo falado + legenda automática por MCP é o que o `estudio/editor` (skill `editar-video`) já faz com ffmpeg + Whisper, e lá a legenda segue o nosso padrão (Inter 500, 87% da altura).
- **Onde pode ajudar:** (1) no PC do Vítor, como editor manual grátis para ajustes rápidos, versões verticais ou cortes de bastidores, no lugar do CapCut; (2) referência de ideias para o nosso editor (remoção de fundo local, limpeza de voz numa chave, export AV1).
- **Reavaliar quando:** sair do beta (1.0) ou se o Vítor quiser um editor visual onde ele mesmo mexe na timeline que o Claude montou (o "live mode" do MCP, issue #337 deles, ainda planejado).
