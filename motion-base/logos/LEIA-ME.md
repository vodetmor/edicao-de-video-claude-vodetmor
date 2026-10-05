# Logos reais em vetor (SVG)

Estes são os desenhos reais das marcas, tirados de bibliotecas abertas via npm. Não são redesenhos.

| Arquivo | Marca | Origem |
|---|---|---|
| `lobehub-claude-color.svg` | Símbolo do Claude (laranja) | [@lobehub/icons](https://github.com/lobehub/lobe-icons) (pacote MIT) |
| `lobehub-openai.svg` / `lobehub-openai-text.svg` | Símbolo e nome da OpenAI | idem |
| `lobehub-anthropic*.svg`, `lobehub-gemini-color.svg`, `lobehub-kling-color.svg`, `lobehub-runway.svg`, `lobehub-google-color.svg` | outras marcas de IA | idem |
| `simpleicons-*.svg` | Claude, Anthropic, Gemini (monocromáticos) | [Simple Icons](https://simpleicons.org) (CC0). A OpenAI saiu dessa biblioteca, então use a do LobeHub |

**Arquivos oficiais:** a Anthropic mantém um kit no [Brandfolder](https://brandfolder.com/anthropic/). Para outras marcas, o [Brandfetch](https://brandfetch.com/claude.ai) reúne os kits. Não é preciso nenhum conector novo: o npm funciona no ambiente e baixa essas bibliotecas direto.

**Direitos:** as marcas pertencem às empresas. Em comparativos editoriais, usar o logo para identificar o produto costuma ser aceito. Em anúncio pago, leia as regras de marca de cada empresa antes, e nunca dê a entender que a marca patrocina o vídeo.

**No código:** no Remotion, importe o SVG e troque `fill="currentColor"` pela cor desejada. Cada `<path>` pode ser animado separadamente (traço desenhando, pétalas montando).
