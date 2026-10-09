"""Transcreve texto-1/2 (ElevenLabs scribe, tempo por palavra) -> transcricao.json"""
import json, os, uuid, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = '/mnt/project-files/anuncio-vslplay/trabalho/.env'
key = [l.split('=', 1)[1].strip() for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY=')][0]
out = {}
for n in ('texto-1', 'texto-2'):
    data = open(os.path.join(HERE, '..', 'brutos', n + '.mp3'), 'rb').read()
    bnd = '----' + uuid.uuid4().hex
    body = (f'--{bnd}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n'
            f'--{bnd}\r\nContent-Disposition: form-data; name="language_code"\r\n\r\npor\r\n'
            f'--{bnd}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n').encode() + data + f'\r\n--{bnd}--\r\n'.encode()
    r = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'xi-api-key': key, 'Content-Type': f'multipart/form-data; boundary={bnd}'})
    d = json.load(urllib.request.urlopen(r, timeout=180))
    words = [{'w': w['text'], 's': round(w['start'], 3), 'e': round(w['end'], 3)} for w in d['words'] if w.get('type') == 'word']
    out[n] = {'text': d['text'], 'words': words}
    print(n, '|', d['text'])
json.dump(out, open(os.path.join(HERE, 'transcricao.json'), 'w'), ensure_ascii=False, indent=1)
