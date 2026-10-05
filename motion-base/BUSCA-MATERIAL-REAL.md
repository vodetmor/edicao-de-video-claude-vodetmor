# Buscar material real (estoque, arquivo, notícia, referência, som)

Ferramenta: `/mnt/project-files/ferramentas/busca/busca.py` (Python, sem instalar nada além de `pillow` e `yt-dlp`).
Regra do projeto: material REAL vem daqui; IA (Google Flow) só como apoio/clima, nunca fingindo ser arquivo.

## Em 3 passos
1. **Buscar** (não baixa nada, só mostra):
   `python3 busca.py "person watching video on smartphone" -t video --vertical`
   → cria `resultados/<data>-<tipo>-<consulta>/` com `folha.jpg` (miniaturas numeradas e coloridas por licença), `resultados.json` e `LICENCAS.md`.
2. **Olhar a folha.jpg** e escolher os números.
3. **Baixar só os escolhidos** (reaproveita a busca, sem buscar de novo):
   `python3 busca.py --de resultados/<pasta> --baixar 2,6`
   → baixa e grava a licença de cada arquivo em `ferramentas/busca/registro-licencas.csv` (histórico geral).

## Tipos (`-t`)
| tipo | fontes padrão | serve para |
|---|---|---|
| `video` (padrão) | Pexels, Pixabay*, Mixkit, Wikimedia | B-roll de estoque para anúncio |
| `foto` | Pexels, Pixabay*, Openverse (Flickr etc.), Wikimedia, Library of Congress | fotos reais |
| `arquivo` | Internet Archive, Wikimedia, LoC, NASA | imagens históricas, cinejornais, espaço |
| `noticia` | Google Notícias, Dailymotion (telejornais BR), YouTube (só link) | pauta, prova social, recortes de TV |
| `ref` | YouTube, Dailymotion, Openverse | referência de estilo/cena |
| `som` | Freesound, Openverse | efeitos sonoros |
| `musica` | Jamendo | trilha |
\* Pixabay só depois que houver chave (ver abaixo).

Outras opções: `-f pexels,archive` (escolher fontes), `-n 10` (resultados por fonte), `--vertical` (9:16), `--livre` (esconde o que não pode ir em anúncio), `--pegar URL` (baixa um link solto, ex.: vídeo do Dailymotion ou mp4 direto), `--fontes` (lista fontes e se têm chave).

## Cores/etiquetas de uso (na folha e no LICENCAS.md)
- **livre** (verde): pode usar em anúncio sem crédito (Pexels, Pixabay, Mixkit, NASA, CC0/domínio público).
- **atribuir** (amarelo): pode usar, mas coloca o crédito (CC BY / BY-SA). O LICENCAS.md já escreve a linha de crédito.
- **nao-comercial** (laranja): NÃO usar em anúncio pago.
- **referencia** (azul): notícia/TV/YouTube. Direitos do veículo. Só estudar, ou trecho curto como citação jornalística em conteúdo editorial (nunca em anúncio sem autorização).
- **verificar**: Internet Archive / LoC sem licença clara; abrir a página antes.

## Dicas de busca
- Estoque (Pexels, Mixkit, Pixabay) acha muito mais em **inglês**; notícia acha mais em **português**.
- Mixkit não informa orientação: no `--vertical` ele pode trazer vídeo deitado (confira na folha).
- Wikimedia limita velocidade: se der 429, espere uns minutos (o script já espera e tenta de novo).

## O que funciona daqui (testado 2026-10-02)
Funciona: Pexels (API, chave já existe), Mixkit (página, às vezes pede pausa), Openverse, Wikimedia Commons, Internet Archive (busca + download), NASA, Library of Congress, Freesound, Jamendo, Google Notícias RSS, Dailymotion (busca + download, **só 288–384p**), YouTube (**só busca**, download bloqueado).
Não funciona daqui: site do Pixabay (só a API com chave), Unsplash (anti-robô), Vecteezy/Videvo/Freepik (403), Coverr (maioria é IA), Reddit (403), Bing Imagens (devolve resultados aleatórios para robôs), DuckDuckGo (conexão cortada), Vimeo (pede login), GDELT (limite de 1 pedido a cada 5 s).

## Chaves
O script lê `ferramentas/busca/chaves.env` e `escola-consciencia-negra/edicao/.env` (Pexels, Freesound e Jamendo já estão lá). Nunca imprime as chaves.
Falta só **Pixabay** (grátis): criar conta em pixabay.com, abrir pixabay.com/api/docs, copiar a "key" e colocar uma linha `PIXABAY_API_KEY=...` em `ferramentas/busca/chaves.env`.
