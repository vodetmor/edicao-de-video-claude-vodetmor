// Identidade visual. Quem usa troca em projeto/marca.json (ou no roteiro, chave "marca"); o resto herda daqui.
// Padrão: disciplina Apple do DESIGN-SYSTEM (fundo claro, um azul, Inter, cantos de squircle, sem degradê, sem vidro, sem brilho).
export type Marca = {
  fundo: string; // fundo das áreas de explicação
  papel: string; // cartões
  tinta: string; // texto principal
  suave: string; // texto de apoio
  linha: string; // bordas finas e divisores
  destaque: string; // a ÚNICA cor de ênfase
  ok: string; // check de lista
  legenda: string; // cor da legenda sobre vídeo
  destaqueLegenda: string; // palavra falada nas legendas palavra a palavra, sobre vídeo (o azul some em fundo escuro)
  fonteTexto: string;
  fonteTitulo: string;
  pesoTitulo: number;
  raio: number; // raio dos cartões a 1080 de largura
};

export const MARCA_PADRAO: Marca = {
  fundo: '#F5F5F7',
  papel: '#FFFFFF',
  tinta: '#1D1D1F',
  suave: '#6E6E73',
  linha: '#E3E3E8',
  destaque: '#0A66E8',
  ok: '#0A66E8',
  legenda: '#FFFFFF',
  destaqueLegenda: '#FFD23F',
  fonteTexto: "'Inter Variable', 'Inter', sans-serif",
  fonteTitulo: "'Inter Variable', 'Inter', sans-serif",
  pesoTitulo: 700,
  raio: 34,
};

const FONTES: Record<string, string> = {
  inter: "'Inter Variable', 'Inter', sans-serif",
  archivo: "'Archivo Variable', 'Archivo', sans-serif",
};

export const montaMarca = (...camadas: (Partial<Marca> | undefined)[]): Marca => {
  const m = Object.assign({}, MARCA_PADRAO, ...camadas.filter(Boolean)) as Marca;
  m.fonteTexto = FONTES[m.fonteTexto.toLowerCase()] ?? m.fonteTexto;
  m.fonteTitulo = FONTES[m.fonteTitulo.toLowerCase()] ?? m.fonteTitulo;
  return m;
};
