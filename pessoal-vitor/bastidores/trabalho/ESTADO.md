# Bastidores (TikTok 9:16) — estado em 05/10/2026
Pedido do Vítor (04/10 noite): editar o pré-edit dos bastidores da aula de lançamento oblíquo, plano e render já aprovados, postar 05/10 ao meio-dia.

## Feito
- brutos/bastidor_pre-edit_v2.mp4 (1:49, só câmera, 1080x1920). prints/ = interface do Claude (escuro).
- Voz: DeepFilterNet3 (aberto, CPU; modelo salvo em ferramentas/modelos/DeepFilterNet3.zip) + EQ/compressor -> audio/voz_final.wav. Mesmo número de amostras (sincronia labial intacta). Ruído de fundo ~20 dB mais baixo.
  Meta SAM Audio: código aberto, mas pesos com acesso controlado no Hugging Face + precisa GPU; não usado.
- Transcrição: faster-whisper large-v3 -> audio/palavras.json.
- Edição Remotion em fonte/remotion (Bastidores.tsx). Mapa de tempo em fonte/prepara.py: pausa de 3 s inserida em 68,98 s (3D) e cartão final de 3,5 s (CTA seguir) no lugar do clique. Total 1:54,9.
- Som: fonte/sons.py (voz + Wallpaper de Kevin MacLeod com ducking + efeitos) -> audio/mix.wav (-14 LUFS, -1 dBTP).
- Componentes reutilizáveis da interface do Claude: motion-base/componentes/claude-ui/.

## Reconstruir
```
python3 -m venv /opt/va && /opt/va/bin/pip install faster-whisper deepfilternet soundfile scipy && /opt/va/bin/pip install torch==2.3.1 torchaudio==2.3.1 --index-url https://download.pytorch.org/whl/cpu
mkdir -p ~/.cache/DeepFilterNet && cd ~/.cache/DeepFilterNet && unzip /mnt/project-files/ferramentas/modelos/DeepFilterNet3.zip
cp -r trabalho/fonte/remotion /root/bast && cd /root/bast && npm ci
mkdir -p public/video && ffmpeg -i ../brutos/... -an -c:v libx264 -crf 14 -g 15 public/video/face.mp4 ; idem aula.mp4 (estudio/aula-lancamento-obliquo/renders/lancamento-obliquo.mp4)
OUT=/root/bast/src/data python3 trabalho/fonte/prepara.py
/opt/va/bin/python trabalho/fonte/sons.py
npx remotion render src/index.ts Bastidores out/video.mp4 --muted --concurrency=4 --crf=17 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
ffmpeg -i out/video.mp4 -i trabalho/audio/mix.wav -c:v copy -c:a aac -b:a 256k -shortest bastidores-final.mp4
```
## Próximo
- Esperar opinião do Vítor; ajustar só o que ele citar.
