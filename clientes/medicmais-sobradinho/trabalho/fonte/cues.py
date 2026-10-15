"""v3 (15/10/2026): v2 até K21 ("...em prova", 136,5 s) + locução da proposta (voz/transcricao-v3.json) a partir de 137,0 s
(brutos/voz/locucao-v3-completa.wav = as duas emendadas). Cenas P01-P17 da proposta, e K23 reaproveitada no "no ar e no mapa".
Cues do vídeo v2 (site + Google Meu Negócio): início de cada cena e eventos presos às palavras da locução
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
}
# cortes: cada cena começa alguns quadros antes da primeira palavra dela (a imagem chega antes da fala)
INI = {
    'K01': 0, 'K02': f(12) - 6, 'K03': f(27) - 8, 'K04': f(33) - 6, 'K05': f(41) - 6, 'K06': f(50) - 6, 'K07': f(66) - 6,
    'K08': f(77) - 6, 'K09': f(96) - 6, 'K10': f(115) - 6, 'K11': f(127) - 6, 'K12': f(133) - 6, 'K13': f(149) - 6,
    'K14': f(162) - 6, 'K15': f(181) - 6, 'K16': f(201) - 6, 'K17': f(224) - 6, 'K18': f(239) - 6, 'K19': f(276) - 6,
    'K20': f(290) - 6, 'K21': f(312) - 6, }

# ---- v3: a proposta (segunda locução, emendada em OFF segundos)
OFF = 137.0
W3 = json.load(open(os.path.join(HERE, '..', 'voz', 'transcricao-v3.json')))['words']
if '--lista3' in sys.argv:
    print(' '.join(f"{i}:{w['w']}@{w['s']}" for i, w in enumerate(W3))); sys.exit()
g = lambda i: round((OFF + W3[i]['s']) * FPS)
P = {  # nome do evento: índice da palavra na transcricao-v3
    'p_nota': 5, 'p_47': 6, 'p_google': 8, 'p_noventa': 10, 'p_avaliacoes': 13,
    'p_mas': 14, 'p_funcionar': 18, 'p_casa': 22, 'p_arrumada': 25, 'p_olhou': 29, 'p_presenca': 31,
    'p_encontramos': 35, 'p_seis': 36, 'p_perder': 44, 'p_pacientes': 45,
    'd1': 46, 'd1site': 50, 'd2': 52, 'd2antigo': 55, 'd2end': 62, 'd2tel': 65, 'd2velhos': 66,
    'd3': 67, 'd3gmn': 69, 'd3metade': 74, 'd4': 75, 'd4dif': 79, 'd4lugar': 82,
    'd5': 83, 'd5link': 85, 'd5insta': 91, 'd5nao': 92, 'd6': 94, 'd6videos': 97, 'd6bons': 99, 'd6padrao': 105,
    'c_tem': 106, 'c_atencao': 111, 'c_cnpj': 113, 'c_inapto': 118, 'c_receita': 120, 'c_declaracoes': 122,
    'c_travar': 127, 'c_verif': 129, 'c_nota': 133, 'c_maquininha': 138,
    'c_orienta': 141, 'c_contador': 148, 'c_mesmo': 154, 'c_endereco': 155, 'c_atualizada': 161,
    'e_entao': 162, 'e_quatro': 166, 'e_entregas': 167,
    'e1': 168, 'e1noar': 171, 'e1mantido': 174, 'e1mes': 175, 'e1end': 178,
    'e2': 181, 'e2presenca': 183, 'e2google': 185, 'e2insta': 186, 'e2face': 187, 'e2wa': 189,
    'e2mesmo': 192, 'e2end': 193, 'e2tel': 194, 'e2hor': 196, 'e2pub': 198, 'e2semana': 200, 'e2resp': 202, 'e2aval': 206,
    'e3': 207, 'e3crm': 209, 'e3lista': 213, 'e3chamou': 217, 'e3marcou': 219, 'e3faltou': 221, 'e3voltar': 224,
    'e3wa': 228, 'e3lembrete': 230, 'e3menos': 233, 'e3mais': 235, 'e3nenhum': 238,
    'e4': 241, 'e4org': 243, 'e4roteiro': 247, 'e4trein': 250, 'e4painel': 255, 'e4decidir': 259, 'e4numero': 261, 'e4achismo': 265,
    'v_video': 269, 'v_gravam': 271, 'v_celular': 274, 'v_transforma': 278, 'v_prof': 281,
    'v_roteiro': 282, 'v_legenda': 286, 'v_capa': 288, 'v_logo': 289, 'v_trilha': 290, 'v_chamada': 292,
    's_saude': 297, 's_convite': 301, 's_resumo': 305, 's_agenda': 309, 's_cheia': 310,
    'n_noventa': 315, 'n_m1': 321, 'n_casa': 324, 'n_m2': 327, 'n_ritmo': 329, 'n_m3': 331, 'n_medimos': 333, 'n_ajust': 335,
    'r_quanto': 336, 'r_impl': 339, 'r_umavez': 341, 'r_site': 343, 'r_crm': 344, 'r_org': 346, 'r_mil': 349, 'r_tres': 356,
    'r_depois': 358, 'r_presenca': 361, 'r_497': 363, 'r_mes': 370, 'r_recom': 373, 'r_mais': 375, 'r_859': 378, 'r_oito': 388,
    'r_contrato': 391, 'r_seis': 394, 'r_validos': 398, 'r_quinze': 400,
    'f_sobradinho': 402, 'f_confia': 404, 'f_falta': 408, 'f_celular': 410, 'f_mostrar': 411,
    'vamos': 413, 'noar': 418, 'mapa': 422,
}
for k, i in P.items():
    EV[k] = g(i)
INI.update({
    'P01': g(0),  # a K21 ganha 0,5 s para a frase final assentar (crítica v7)
    'P02': g(14) - 6, 'P03': g(35) - 6, 'P04': g(46) - 6, 'P05': g(106) - 6, 'P06': g(139) - 6,
    'P07': g(162) - 6, 'P08': g(168) - 6, 'P09': g(181) - 6, 'P10': g(207) - 6, 'P11': g(241) - 6,
    'P12': g(266) - 6, 'P13': g(296) - 6, 'P14': g(314) - 6, 'P15': g(336) - 6, 'P16': g(358) - 6,
    'P17': g(402) - 6, 'K23': g(413) - 6,
})
DUR = round((OFF + W3[-1]['e']) * FPS) + 54  # 1,8 s de respiro no fim para a chamada assentar
json.dump({'fps': FPS, 'dur': DUR, 'ini': INI, 'ev': EV}, open(os.path.join(HERE, 'src', 'cues.json'), 'w'), indent=1)
print('dur', DUR, 'quadros =', round(DUR / FPS, 2), 's')
ks = list(INI)
for i, k in enumerate(ks):
    b = INI[ks[i + 1]] if i + 1 < len(ks) else DUR
    print(k, INI[k], round((b - INI[k]) / FPS, 1), 's')
