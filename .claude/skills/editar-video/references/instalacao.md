# Instalação no computador do usuário

Confira antes de instalar (rode e leia a saída): `python3 --version` (3.10+), `node --version` (18+), `ffmpeg -version`.

| Falta | Windows | Mac | Linux |
|---|---|---|---|
| Python | python.org (marcar "Add to PATH") | `brew install python` | já vem |
| Node | nodejs.org (LTS) | `brew install node` | `apt install nodejs npm` |
| ffmpeg | `winget install Gyan.FFmpeg` | `brew install ffmpeg` | `apt install ffmpeg` |

Depois, uma vez:
```
python3 -m pip install faster-whisper opencv-python-headless numpy scipy
cd estudio/editor/remotion && npm i
```
- O modelo de fala baixa na primeira transcrição (~1,6 GB `large-v3-turbo`). PC fraco ou pouco disco: `--modelo small`.
- O Remotion baixa um Chrome próprio na primeira renderização (~100 MB). Já tem um? `REMOTION_BROWSER=<caminho>`.
- Sem placa de vídeo está tudo certo: tudo roda na CPU.
- Erro `metadata_errors` do pacote `av`: já contornado (o áudio é extraído com ffmpeg antes de transcrever).

Teste rápido: `python3 estudio/editor/pipeline/novo_projeto.py teste --video <qualquer vídeo curto>` e depois `limpar.py teste`.
Nunca salve chave de API em arquivo do repositório: use `estudio/editor/.env` (ignorado pelo Git).
