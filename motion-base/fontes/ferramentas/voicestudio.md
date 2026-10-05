# VoiceStudio (voicestudio.sh), avaliado em 02/10/2026

- O que é: app desktop open source (Electron, ex "OmniVoice Studio") para clonar voz, desenhar voz, dublar vídeo, transcrever. Windows/macOS/Linux/Docker. Também tem API local compatível com OpenAI e servidor MCP (dá para Claude chamar direto).
- Repositório: github.com/debpalash/VoiceStudio. App AGPL-3.0 (grátis). Versão Pro/Lifetime paga (US$ 99/ano ou 299) é outro build, com licença comercial.
- Motor padrão: k2-fsa/OmniVoice (base Qwen3-0.6B, 600+ línguas, tem pt). Clona com ~3 a 15 s de referência + o texto exato do que a referência diz.
- ATENÇÃO LICENÇA: o código do OmniVoice é Apache 2.0, mas os PESOS do modelo são CC-BY-NC (não comercial), por causa dos dados de treino (Emilia). Ou seja: anúncio de cliente (uso comercial) com OmniVoice fica em zona proibida pela licença do modelo. Para comercial, olhar os outros motores do app (CosyVoice 3, VoxCPM2, IndexTTS, etc.) e conferir a licença de cada um antes.
- Hardware: roda em CPU (8 GB RAM basta para começar), GPU só acelera. No Windows só GPU NVIDIA acelera (o PC do Vítor não tem: roda em CPU, mais lento). Nuvem do projeto: CPU 4 núcleos, 15 GB RAM; OmniVoice CPU instalou em /opt/ovenv (torch 2.8.0+cpu + pip omnivoice), mas /opt some no reinício.
- Instalação Windows: `powershell -ep bypass -c "irm https://voicestudio.sh/install.ps1|iex"` ou instalador em voicestudio.sh/download. ~5 GB livres para o PyTorch CPU.
- Dica de velocidade: sempre preencher a transcrição da voz de referência; sem ela o app roda Whisper a cada geração.
- Ética/permissão: clonar só voz com autorização do dono (do Vítor, de clientes que concordaram). Ambiente da nuvem bloqueia clonagem sem autorização explícita registrada do dono da voz.

## Teste PT-BR na nuvem (02/10/2026, CPU 4 núcleos, sem voz de pessoa real)
- Vozes sintéticas: OmniVoice "voice design" (instruct "male, middle-aged, low pitch") e "female, young adult"; a voz masculina gerada virou referência para testar clonagem. Amostras em ferramentas/voz/amostras/.
- Inteligibilidade (Whisper small): Edge Antonio perfeito; OmniVoice entende tudo, só "quarenta e oito e cinquenta" sai ambíguo (escrever preço por extenso com vírgula/pausa); dots.tts trocou "AB" por "ebi" e "com" por "como".
- Velocidade CPU: OmniVoice ~4 a 10x mais lento que tempo real (12 s de fala em 50 a 130 s). dots.tts soar (2B) levou 40 min para 12 s: inviável em CPU, só com GPU (Kaggle). No Windows o dots.tts nem roda (só Linux/macOS).
- Conclusão: para o PC do Vítor (sem NVIDIA), OmniVoice é o motor prático. Para anúncio comercial com licença limpa: dots.tts ou MOSS (Apache-2.0) no Kaggle GPU.
- Gotcha: `pgrep -f "python x"` dentro de `bash -c '... pgrep ...'` casa com o próprio bash e trava a espera; `pkill -f` mata o próprio shell. Esperar por PID.
- Veredito do Vítor (02/10/2026): qualidade ruim em todos (OmniVoice, dots.tts, clone). Ferramenta em stand-by; ElevenLabs continua a referência de qualidade.
