// Monta as props do editor a partir da pasta de um projeto (usado pelo render e pelo painel de revisão).
import {execFileSync} from 'node:child_process';
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
  // efeitos sonoros nossos (sintetizados em estudio/motor/audio/sons.py, livres)
  const sons = path.join(path.dirname(new URL(import.meta.url).pathname), 'sons');
  fs.mkdirSync(path.join(pub, 'sons'), {recursive: true});
  for (const f of fs.readdirSync(sons)) liga(path.join(sons, f), path.join(pub, 'sons', f));
  if (fs.existsSync(pj('pessoa.webm'))) liga(pj('pessoa.webm'), path.join(pub, 'pessoa.webm')); // recorte da pessoa (recortar.py)
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

// um quadro pequeno do vídeo: vira o fundo desfocado do visual "vidro" do painel
export const fazFundo = (video, destino) => {
  fs.mkdirSync(path.dirname(destino), {recursive: true});
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '1', '-i', video, '-frames:v', '1', '-vf', 'scale=320:-2', '-q:v', '5', destino]);
  } catch { /* sem o quadro o fundo fica só preto */ }
};
