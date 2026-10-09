@echo off
REM Baixa 4 videos do portfolio da Rei da VSL (YouTube) para o carrossel do Criativo 02.
REM Rode no PC (a nuvem foi bloqueada pelo YouTube). Os arquivos ficam na pasta Videos\portfolio-rei.
python -m pip install -U yt-dlp
mkdir "%USERPROFILE%\Videos\portfolio-rei"
cd /d "%USERPROFILE%\Videos\portfolio-rei"
python -m yt_dlp -S "res:720,ext:mp4:m4a" --merge-output-format mp4 -o "01-motion-expert-02.%%(ext)s" https://www.youtube.com/watch?v=IcoKWQUwUVs
python -m yt_dlp -S "res:720,ext:mp4:m4a" --merge-output-format mp4 -o "02-dopaminetica-01.%%(ext)s" https://www.youtube.com/watch?v=x2hw3tkYynE
python -m yt_dlp -S "res:720,ext:mp4:m4a" --merge-output-format mp4 -o "03-ugc-avatar-ia.%%(ext)s" https://www.youtube.com/watch?v=c6jgQelgsu4
python -m yt_dlp -S "res:720,ext:mp4:m4a" --merge-output-format mp4 -o "04-quebra-de-padrao-04.%%(ext)s" https://www.youtube.com/watch?v=2N6ZDnC7Y4g
explorer .
