"""Gera a locução (ElevenLabs) linha a linha. Uso: python3 gera.py [voice_id] [ids...]
A chave fica em ../.env (ELEVENLABS_API_KEY), nunca impressa."""
import json, os, sys, urllib.request, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
key = [l.split('=', 1)[1].strip() for l in open(os.path.join(HERE, '..', '.env')) if l.startswith('ELEVENLABS_API_KEY=')][0]
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'cjVigY5qzO86Huf0OWal'  # Eric (premade; the free API plan blocks library voices)
MODEL = os.environ.get('MODEL', 'eleven_v3')
only = set(sys.argv[2:])
lines = json.load(open(os.path.join(HERE, 'roteiro.json')))
os.makedirs(os.path.join(HERE, 'clips'), exist_ok=True)
for i, L in enumerate(lines):
    if only and L['id'] not in only:
        continue
    body = {
        'text': L['text'], 'model_id': MODEL, 'language_code': 'pt',
    }
    if MODEL != 'eleven_v3':
        body['previous_text'] = lines[i - 1]['text'] if i else None
        body['next_text'] = lines[i + 1]['text'] if i + 1 < len(lines) else None
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',
                                 data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    p = os.path.join(HERE, 'clips', L['id'])
    if not (os.environ.get('REUSE') and os.path.exists(p + '.mp3')):
        try:
            mp3 = urllib.request.urlopen(req, timeout=120).read()
        except urllib.error.HTTPError as e:
            print(L['id'], 'HTTP', e.code, e.read()[:300]); continue
        open(p + '.mp3', 'wb').write(mp3)
    # 48 kHz WAV, leading/trailing silence trimmed
    tempo = os.environ.get('TEMPO', '1.0')  # atempo (pitch kept) to tighten a slow read
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p + '.mp3', '-af',
                    f'atempo={tempo},silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',
                    '-ar', '48000', '-ac', '1', p + '.wav'], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p + '.wav'], capture_output=True, text=True).stdout)
    print(L['id'], f'{d:.2f}s', f'{len(L["text"].split()) / d:.2f} palavras/s')
