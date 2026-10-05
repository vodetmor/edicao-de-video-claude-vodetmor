# Plano · Edição do vídeo "Racismo Ambiental"

> **Atualização 29/09/2026:** a rede foi liberada e as chaves do Jamendo e do Freesound estão no `.env`. Pesquisa de motion e acervo feita: ver `PESQUISA-2026-09-29.md`, `PROMPTS-FLOW.md` e `FONTES-IMAGENS.md`. Fotos candidatas já baixadas em `assets/fotos-candidatas/` (com licença em `catalogo.json`). Continua valendo: ao chegarem os 7 vídeos, primeiro transcrever e entregar o plano de arquitetura para aprovação; só depois editar.

## O que preciso do Vítor antes de editar

| # | O quê | Por quê | Como |
|---|---|---|---|
| 1 | Liberar domínios na rede do ambiente | hoje a nuvem bloqueia o download de fotos, músicas, efeitos e do modelo de transcrição | Configurações do projeto → Environment → Network access: nível mais amplo **ou** adicionar os domínios da lista abaixo |
| 2 | Chave do **Jamendo** (client_id) | buscar e baixar trilhas Creative Commons | criar conta grátis em devportal.jamendo.com |
| 3 | Chave do **Freesound** | chuva, trovão, água, goteira reais | criar conta grátis em freesound.org/apiv2/apply |
| 4 | Chave do **Pexels** (opcional) | vídeos de apoio de chuva, cidade, rios | pexels.com/api |
| 5 | Os 7 vídeos, um por pessoa, com o nome no arquivo | material bruto | mandar aqui na thread; eu ponho em ordem |
| 6 | Aprovar 5 quadros de teste antes do render completo | evitar retrabalho | eu mando as imagens aqui |

Domínios a liberar:
```
openaipublic.azureedge.net      (modelo Whisper, transcrição grátis)
commons.wikimedia.org
upload.wikimedia.org            (fotos históricas de domínio público)
api.jamendo.com
prod-1.storage.jamendo.com      (arquivos de música)
freesound.org
cdn.freesound.org               (efeitos sonoros)
api.pexels.com
images.pexels.com
videos.pexels.com               (vídeos de apoio)
agenciabrasil.ebc.com.br
imagens.ebc.com.br              (fotos jornalísticas CC BY)
```

Se preferir não liberar a rede: dá para você mesmo baixar as fotos e músicas e mandar aqui, ou eu rodo essa parte numa pasta do seu computador pelo Remote Control.

## Fases

| Fase | O que eu faço | Entrega | Depende de |
|---|---|---|---|
| 0. Preparação (agora) | Estudo da referência, regras visuais, pipeline | `SPEC.md`, `ARQUITETURA.md`, este plano | — |
| 1. Acervo | Busco e baixo fotos históricas, B-roll, trilhas e efeitos; anoto licença de cada um em `assets/CREDITOS.md` | pasta `assets/` pronta | itens 1 a 4 |
| 2. Ingestão | Normalizo os 7 vídeos, transcrevo com tempo por palavra, corto silêncios e escolho os melhores takes | corte bruto só com as vozes, em ordem | item 5 |
| 3. Quadros de teste | Renderizo 5 quadros: abertura, nome na tela, etiqueta de data, número em tela cheia, clímax | 5 imagens para aprovar | fase 2 |
| 4. Montagem | `timeline.json` + Remotion: B-roll, textos, zooms, cor | prévia 720p sem mixagem final | item 6 |
| 5. Som | Trilha por bloco, efeitos no quadro exato, ducking da música sob a voz, master em -14 LUFS | prévia 720p com som | fase 4 |
| 6. Crítica | Uma sessão separada compara com a referência e só aprova com 8/10 | lista de correções aplicada | fase 5 |
| 7. Final | Render 1080p | MP4 final aqui na thread | fase 6 |

## Sugestão de acervo por bloco (a confirmar na busca)

| Bloco | Imagens |
|---|---|
| Vítor | ruas alagadas (Agência Brasil), foto do Rio no fim do século XIX (Marc Ferrez, domínio público) |
| Maria Eduarda | Morro da Providência e o "Bota-abaixo" do centro do Rio (Augusto Malta, domínio público); protestos de Warren County em 1982 (arquivos da UNC e do estado da Carolina do Norte, uso educativo com crédito) |
| Cainã | encostas, córregos, lixões; mapa desenhado em Remotion; números do Censo 2022 |
| Luísa | prédios públicos, filas, obras paradas |
| Anna Augusta | valas abertas, casas alagadas, falta de saneamento |
| Maria Alice | mobilizações por moradia, comunidades quilombolas, mutirões |
| Anna Júlia | a mesma rua alagada da abertura; tela preta final |

## Riscos

- **Transcrição**: sem o domínio do Whisper liberado, a legenda cinética e o corte fino ficam mais lentos (dá para usar o texto do roteiro e marcar o tempo pelos silêncios, mas a fala real vai mudar).
- **Qualidade das gravações**: celular vertical, eco ou luz ruim limitam o resultado. As dicas de gravação estão em `../notas-de-edicao.md`.
- **Direitos**: fotos de 1982 não são de domínio público; uso educativo com crédito. Tudo o que entrar vai para `assets/CREDITOS.md` e para os créditos finais.
