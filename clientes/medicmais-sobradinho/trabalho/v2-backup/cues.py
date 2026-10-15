"""Cues do vídeo v2 (site + Google Meu Negócio): início de cada cena e eventos presos às palavras da locução
(voz/transcricao-v2.json, ElevenLabs Scribe da locução Ana Dias de 14/10/2026).
Índices = posição da palavra na transcrição (imprimir com: python3 cues.py --lista). Saída: src/cues.json (quadros a 30 fps).
v1 (88 s, só site) guardado em ../v1-backup/."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, '..', 'voz', 'transcricao-v2.json')))['words']
if '--lista' in sys.argv:
    print(' '.join(f"{i}:{w['w']}@{w['s']}" for i, w in enumerate(W))); sys.exit()
FPS = 30
f = lambda i: round(W[i]['s'] * FPS)
fe = lambda i: round(W[i]['e'] * FPS)
EV = {
    'pronto': f(11), 'quinhentos': f(22), 'quadrados': f(26), 'medico': f(27), 'dentista': f(29), 'lugar1': f(32),
    'trinta': f(36), 'saudeday': f(39), 'internet': f(43), 'espalhado': f(47), 'feed': f(49),
    'implante': f(52), 'protese': f(53), 'lentes': f(56), 'pesquisa': f(60), 'google0': f(62), 'decidir': f(65),
    'buscando': f(67), 'nome': f(69), 'encontra': f(72), 'catalogos': f(73), 'outras': f(75), 'clinicas': fe(76),
    'em2023': f(77), 'terco': f(80), 'agendava': f(86), 'umano': f(89), 'treze': f(93),
    'porisso': f(96), 'nao': f(101), 'so': f(103), 'site0': f(105), 'colocar': f(107), 'certo': f(112), 'internet2': f(114),
    'duas': f(118), 'partes': f(119), 'site1': f(121), 'gmn1': f(124),
    'primeiro': f(127), 'site2': f(129), 'quatro': f(131), 'frentes': f(132),
    'um': f(133), 'tratamento': f(135), 'nome2': f(142), 'digita': f(146), 'busca': f(148),
    'dois': f(149), 'qualquer': f(151), 'toque': f(156), 'abre': f(157), 'whatsapp': f(159),
    'tres': f(162), 'prova': f(164), 'estrutura': f(167), 'depoimentos': f(168), 'saudeday2': f(170), 'conhece': f(179),
    'quatro2': f(181), 'endereco': f(184), 'anuncio': f(187), 'google': f(188), 'instagram': f(190), 'levam': f(191),
    'porta': f(195), 'vinte': f(197),
    'agora': f(201), 'segunda': f(203), 'gmn2': f(206), 'perfil': f(211), 'procura': f(216), 'google2': f(220), 'maps': f(223),
    'end': f(224), 'fotos': f(225), 'telefone': f(226), 'avaliacoes': f(228), 'gente': f(229), 'completo': f(234), 'ligado': f(236), 'site3': f(238),
    'chegarem': f(243), 'plaquinha': f(246), 'balcao': f(250), 'fim': f(252), 'aproxima': f(257), 'celularN': f(259), 'toca': fe(259) - 5,
    'tela': f(262), 'avaliacao': f(264), 'googleR': f(266), 'abreR': f(268), 'sembaixar': f(269), 'semprocurar': f(272),
    'cada': f(276), 'satisfeito': f(278), 'estrela': f(281), 'proximo': f(284), 've': f(286), 'escolher': f(289),
    'cara': f(294), 'vermelho': f(298), 'sinal': f(300), 'servicos': f(304), 'celular': f(311),
    'site4': f(313), 'recebe': f(314), 'google4': f(318), 'mostra': f(319), 'plaquinha2': f(324), 'transforma': f(325), 'prova2': f(329),
    'faltam': f(330), 'detalhes': f(333), 'horario': f(334), 'cnpj': f(335), 'responsaveis': f(336), 'logo': f(340),
    'vamos': f(342), 'noar': f(347), 'mapa': f(350),
}
# cortes: cada cena começa alguns quadros antes da primeira palavra dela (a imagem chega antes da fala)
INI = {
    'K01': 0, 'K02': f(12) - 6, 'K03': f(27) - 8, 'K04': f(33) - 6, 'K05': f(41) - 6, 'K06': f(50) - 6, 'K07': f(66) - 6,
    'K08': f(77) - 6, 'K09': f(96) - 6, 'K10': f(115) - 6, 'K11': f(127) - 6, 'K12': f(133) - 6, 'K13': f(149) - 6,
    'K14': f(162) - 6, 'K15': f(181) - 6, 'K16': f(201) - 6, 'K17': f(224) - 6, 'K18': f(239) - 6, 'K19': f(276) - 6,
    'K20': f(290) - 6, 'K21': f(312) - 6, 'K22': f(330) - 6, 'K23': f(342) - 6,
}
DUR = fe(len(W) - 1) + 54  # 1,8 s de respiro no fim para a chamada assentar
json.dump({'fps': FPS, 'dur': DUR, 'ini': INI, 'ev': EV}, open(os.path.join(HERE, 'src', 'cues.json'), 'w'), indent=1)
print('dur', DUR, 'quadros =', round(DUR / FPS, 2), 's')
ks = list(INI)
for i, k in enumerate(ks):
    b = INI[ks[i + 1]] if i + 1 < len(ks) else DUR
    print(k, INI[k], round((b - INI[k]) / FPS, 1), 's')
