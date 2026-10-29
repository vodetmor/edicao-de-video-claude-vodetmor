// Monta as props do editor a partir da pasta de um projeto (usado pelo render e pelo painel de revisão).
import fs from 'node:fs';
import path from 'node:path';

export const caminhos = (raiz) => {
  const pj = (...p) => path.join(raiz, 'projeto', ...p);
  return {pj, pub: pj('.publico'), assets: path.join(raiz, 'assets'), notas: pj('revisao', 'notas.json')};
};

const ler = (p, padrao) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : padrao);

// pasta pública só com o que o vídeo usa (links, sem copiar o bruto nem os originais)
export const preparaPublico = (raiz) => {
  const {pj, pub, assets} = caminhos(raiz);
  fs.rmSync(pub, {recursive: true, force: true});
  fs.mkdirSync(path.join(pub, 'assets'), {recursive: true});
  const liga = (de, para) => {
    try { fs.linkSync(de, para); } catch { fs.copyFileSync(de, para); }
  };
  liga(pj('base.mp4'), path.join(pub, 'base.mp4'));
  if (fs.existsSync(assets)) {
    for (const f of fs.readdirSync(assets)) {
      if (fs.statSync(path.join(assets, f)).isFile()) liga(path.join(assets, f), path.join(pub, 'assets', f));
    }
  }
  return pub;
};

export const montaEntrada = (raiz) => {
  const {pj} = caminhos(raiz);
  if (!fs.existsSync(pj('base.mp4'))) throw new Error(`não achei ${pj('base.mp4')}: rode a limpeza antes (pipeline/limpar.py)`);
  if (!fs.existsSync(pj('roteiro-visual.json'))) throw new Error(`falta ${pj('roteiro-visual.json')} (o Claude escreve a partir da transcrição)`);
  const bp = ler(pj('base-palavras.json'));
  return {
    roteiro: ler(pj('roteiro-visual.json')),
    palavras: bp.palavras.map(({w, s, e}) => ({w, s, e})),
    rosto: ler(pj('rosto.json'), null),
    base: {arquivo: 'base.mp4', fps: bp.fps, duracao: bp.duracao, largura: bp.largura, altura: bp.altura},
    marca: ler(path.join(raiz, 'marca.json'), ler(pj('marca.json'), undefined)),
  };
};

// arquivos que, se mudarem, mudam o vídeo (o painel recarrega sozinho)
export const vigiados = (raiz) => {
  const {pj} = caminhos(raiz);
  return [pj('roteiro-visual.json'), pj('base-palavras.json'), pj('rosto.json'), pj('marca.json'), pj('base.mp4'), path.join(raiz, 'marca.json')];
};
