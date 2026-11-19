# Limpeza das falas (18/11/2026)

**Escolhido: DeepFilterNet3** (modelo aberto de 48 kHz, banda cheia), com limite de atenuação de 30 dB, depois passa-alta 80 Hz e −16 LUFS.
Script: `../trabalho/scripts/limpar_voz.py <entrada> <saida.wav>` (pronto para os áudios dos outros 7 participantes).

## Comparação (fala WA0018; amostras em `amostras-ab/`, mesmo volume)
| Versão | Ruído nas pausas | Brilho (4–12 kHz) | Veredito |
|---|---|---|---|
| Original (WhatsApp) | −48 dB | referência | ruído de fundo constante, alguns picos clipados |
| A · ffmpeg afftdn | −48 dB | igual | quase não limpa; subir mais deixa "água" |
| B · Meta denoiser (dns64) | −67 dB | corta tudo acima de 8 kHz (modelo de 16 kHz) | limpa, mas é o "abafado" que o Vítor odeia |
| C · Meta Demucs (htdemucs) | −49 dB | igual | feito para separar voz de MÚSICA; não reconhece ruído de ambiente como "outra coisa" |
| **D · DeepFilterNet3** | **−67 dB** | **+0,5 dB (mais claro)** | **limpa ~18 dB e preserva o ar da voz** |
| F · Demucs + DeepFilterNet3 | −66 dB | igual a D | mesmo resultado, 3x mais lento |

Final (`limpo/`): ruído nas pausas −68 a −72 dB, fala −14,5 dB. O limite de 30 dB deixa um fundo mínimo para não ter "vácuo" nem artefato metálico.
Obs.: o repositório da Meta que o Vítor lembrou é o Demucs (separa voz de música) ou o `facebookresearch/denoiser`; os dois foram testados e perderam aqui.
Instalação na nuvem: `pip install deepfilternet`; o modelo vem de `raw.githubusercontent.com/Rikorose/DeepFilterNet/main/models/DeepFilterNet3.zip`
(o link `github.com/.../raw/` dá 403 na nuvem) e o `df/io.py` precisa de remendo no import `torchaudio.backend.common` (torchaudio 2.x).
