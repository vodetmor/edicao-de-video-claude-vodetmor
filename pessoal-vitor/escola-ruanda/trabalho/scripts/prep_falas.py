"""Prepara cada fala para o vídeo: corta respiros longos/tropeços, corrige o texto da legenda e
gera video/public/falas/<id>.wav + <id>.json (palavras com tempo novo + frases de legenda).
Uso: prep_falas.py [id ...]   (sem id = todas que tiverem transcrição)
Fonte: audio/limpo/<id>.wav (limpo, -16 LUFS) + transcricoes/groq/<id>.json (Whisper large-v3 na Groq, palavra a palavra).
Para a Ana Isabel: rodar scripts/transcrever_groq.sh ana-isabel e depois este script."""
import json, sys, os, re, subprocess
B = '/mnt/project-files/ruanda/trabalho'
OUT = f'{B}/video/public/falas'; os.makedirs(OUT, exist_ok=True)

# Correções de transcrição/concordância na LEGENDA (a voz fica como foi gravada).
# Correções de FATO (8 mil, 1984) também vão certas na legenda e aparecem riscadas no selo de checagem.
TROCA = {
  'anna-julia': [('juvenal', 'Juvénal'), ('Pau', 'Paul'), ('Hutu,', 'hutu,')],
  'maria-alice': [('crime', 'clima'), ('juvenal', 'Juvénal'), ('as extremidades huts', 'os extremistas hutus'),
                  ('Iterhant', 'Interahamwe'), ('hut moderado,', 'hutu moderado'), ('dos tutsis', 'tutsi'),
                  ('uma arma simples,', 'armas simples,'), ('furacões', 'facões,'), ('os vizinhos,', 'vizinhos,'),
                  ('8 mil', '800 mil'), ('assassinadas e quase', 'assassinadas, quase')],
  'joao-victor': [('1984,', '1994,'), ('Hutu', 'hutu'), ('E o', 'e o')],
  'eustaquio': [('Pau', 'Paul')],
  'ana-isabel': [('Hutu Juwenao', 'hutu Juvénal'), ('1903,', '1993,'), ('sob a forte', 'sob forte'), ('ofereceu', 'enfureceu'), ('impor armas', 'importar armas')],
  'joaquim': [('criadas tribunais', 'criados tribunais'), ('as responsáveis', 'os responsáveis'),
              ('tribunais comentados de Gacaca.', 'tribunais comunitários Gacaca.'), ('criadas memoriais', 'criados memoriais'),
              ('memorial do genocídio', 'Memorial do Genocídio')],
}
# Trechos de áudio a remover (segundos no áudio limpo): tropeços / retomadas.
CORTE = {
  # (nenhum: o 'tropeço' do Joaquim era alucinação da transcrição local; conferido palavra a palavra)
}
PAUSA_MAX = 0.9     # respiro maior que isso vira PAUSA_NOVA
PAUSA_NOVA = 0.7
ANTES, DEPOIS = 0.25, 0.45

def lufs(p):
    r = subprocess.run(['ffmpeg', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True).stderr.decode()
    return float(r.rsplit('I:', 1)[1].split('LUFS')[0])

def fala(i):
    d = json.load(open(f'{B}/transcricoes/groq/{i}.json'))
    dur = d['duration']
    W = [dict(w=x['word'], a=x['start'], b=x['end']) for x in d['words'] if x['start'] < dur - 0.05]
    # tira palavras dentro dos cortes
    cortes = CORTE.get(i, [])
    W = [w for w in W if not any(c0 - 0.05 <= w['a'] and w['b'] <= c1 + 0.3 for c0, c1 in cortes)]
    # janelas que ficam: da 1ª palavra até a última, sem cortes, comprimindo respiros longos
    keep = []; ini = max(0, W[0]['a'] - ANTES)
    for k in range(1, len(W)):
        gap0, gap1 = W[k - 1]['b'], W[k]['a']
        corte_aqui = [c for c in cortes if gap0 - 0.4 <= c[0] and c[1] <= gap1 + 0.6]
        if gap1 - gap0 > PAUSA_MAX or corte_aqui:
            fim = gap0 + PAUSA_NOVA / 2 if not corte_aqui else min(gap0 + PAUSA_NOVA / 2, corte_aqui[0][0])
            keep.append((ini, fim)); ini = max(gap1 - PAUSA_NOVA / 2, corte_aqui[-1][1] if corte_aqui else 0)
    keep.append((ini, min(dur, W[-1]['b'] + DEPOIS)))
    # mapa de tempo velho -> novo
    def novo(t):
        acc = 0
        for a, b in keep:
            if t <= b: return acc + max(0, t - a)
            acc += b - a
        return acc
    total = sum(b - a for a, b in keep)
    # áudio editado com micro-fades de 12 ms em cada emenda
    filt = ''.join(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={b-a-0.012:.3f}:d=0.012[s{n}];' for n, (a, b) in enumerate(keep))
    filt += ''.join(f'[s{n}]' for n in range(len(keep))) + f'concat=n={len(keep)}:v=0:a=1[o]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{B}/audio/limpo/{i}.wav', '-filter_complex', filt, '-map', '[o]', '-ar', '48000', '-c:a', 'pcm_s16le', f'{OUT}/{i}.wav'], check=True)
    pal = [dict(w=w['w'], a=round(novo(w['a']), 3), b=round(novo(w['b']), 3)) for w in W]
    # legenda: texto corrigido, quebrado em frases (pontuação) de até ~2 linhas
    txt = ' '.join(p['w'] for p in pal)
    for velho, certo in TROCA.get(i, []):
        if velho not in txt: print('  aviso: não achei', repr(velho), 'em', i)
        txt = txt.replace(velho, certo)
    frases = legenda(pal, txt)
    json.dump(dict(id=i, dur=round(total, 3), palavras=pal, frases=frases), open(f'{OUT}/{i}.json', 'w'), ensure_ascii=False, indent=1)
    print(f'{i}: {dur:.1f}s -> {total:.1f}s, {len(frases)} legendas, {lufs(f"{OUT}/{i}.wav"):.1f} LUFS')

FRACAS={'a','o','as','os','de','do','da','dos','das','em','no','na','e','um','uma','que','por','pelo','pela','com','para','se','sua','seu'}
limpa=lambda w: re.sub(r'[^\wáéíóúâêôãõç]','',w.lower())

def legenda(pal, txt_corrigido, MAXC=64, LINHA=34):
    """Agrupa palavras em blocos de legenda; o texto vem da versão corrigida, alinhado pela contagem de palavras
    quando possível (correções que mudam a contagem usam o texto corrigido do bloco inteiro)."""
    blocos, cur = [], []
    for k, p in enumerate(pal):
        cur.append(k)
        txt = ' '.join(pal[j]['w'] for j in cur)
        fim_frase = re.search(r'[.,;:?!]$', p['w'])
        prox_gap = pal[k + 1]['a'] - p['b'] if k + 1 < len(pal) else 9
        fraca = limpa(p['w']) in FRACAS and k + 1 < len(pal)
        if ((fim_frase and len(txt) > 22) or (len(txt) > MAXC - 10 and not fraca) or len(txt) > MAXC + 6 or prox_gap > 0.6 or k == len(pal) - 1):
            blocos.append(cur); cur = []
    # bloco curtinho ("XX.", "colonial.") volta para o anterior
    k = 1
    while k < len(blocos):
        if len(' '.join(pal[j]['w'] for j in blocos[k])) < 12 and pal[blocos[k][0]]['a'] - pal[blocos[k-1][-1]]['b'] < 0.6:
            blocos[k-1] += blocos.pop(k)
        else: k += 1
    # alinha o texto corrigido aos blocos usando âncoras de palavras
    corr = txt_corrigido.split(' ')
    orig = [p['w'] for p in pal]
    import difflib
    sm = difflib.SequenceMatcher(a=orig, b=corr, autojunk=False)
    mapa = {}  # índice orig -> índice corr (início)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        for n in range(i1, i2):
            mapa[n] = j1 + min(n - i1, max(0, j2 - j1 - 1)) if tag != 'delete' else j1
    out = []
    for bi, bl in enumerate(blocos):
        j0 = mapa[bl[0]]
        j1 = mapa[blocos[bi + 1][0]] if bi + 1 < len(blocos) else len(corr)
        t = ' '.join(corr[j0:j1]).strip()
        out.append(dict(a=pal[bl[0]]['a'], b=pal[bl[-1]]['b'], t=quebra(t, LINHA)))
    # cada legenda fica até a próxima (sem piscar) se o intervalo for curto
    for k in range(len(out) - 1):
        if out[k + 1]['a'] - out[k]['b'] < 0.5: out[k]['b'] = out[k + 1]['a']
    return out

def quebra(t, L):
    if len(t) <= L: return t
    L = max(L, (len(t) + 1) // 2)
    ws = t.split(); best = None
    for k in range(1, len(ws)):
        a, b = ' '.join(ws[:k]), ' '.join(ws[k:])
        s = max(len(a), len(b))
        if best is None or s < best[0]: best = (s, a + '\n' + b)
    return best[1]

if __name__ == '__main__':
    ids = sys.argv[1:] or [os.path.basename(p)[:-5] for p in sorted(os.listdir(f'{B}/transcricoes/groq')) if p.endswith('.json')]
    for i in ids: fala(i if not i.endswith('.json') else i[:-5])
