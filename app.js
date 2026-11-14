import { analisaDados, criaLUTdeDados } from './visao.js';

function leCanvas(imagem, recorte) {
  const largura = recorte ? recorte.w : imagem.naturalWidth || imagem.width;
  const altura = recorte ? recorte.h : imagem.naturalHeight || imagem.height;
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const contexto = canvas.getContext('2d', { willReadFrequently: true });

  if (recorte) {
    contexto.drawImage(
      imagem,
      recorte.x, recorte.y, recorte.w, recorte.h,
      0, 0, recorte.w, recorte.h
    );
  } else {
    contexto.drawImage(imagem, 0, 0, largura, altura);
  }

  return contexto.getImageData(0, 0, largura, altura);
}

export function pixels(img, r) {
  const dados = leCanvas(img, r.mapa);
  const colorbar = leCanvas(r.colorbar);
  const linha = colorbar.data.slice(
    Math.floor(colorbar.height / 2) * colorbar.width * 4,
    (Math.floor(colorbar.height / 2) + 1) * colorbar.width * 4
  );
  const lut = criaLUTdeDados(linha);

  return analisaDados(
    dados,
    lut,
    r.track,
    r.banda || 'global',
    r.COLS || 64
  );
}
