import assert from 'node:assert/strict';
import test from 'node:test';
import { analisaDados, criaLUTdeDados } from '../visao.js';

const cores = [
  [10, 20, 30],
  [40, 50, 60],
  [70, 80, 90],
  [100, 110, 120],
  [130, 140, 150],
  [160, 170, 180],
  [190, 200, 210],
  [220, 230, 240]
];
const track = { vmin: -7, vmax: 14 };

function criaImagem() {
  const data = new Uint8ClampedArray(8 * 4 * 4);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 8; x++) {
      const offset = (y * 8 + x) * 4;
      data.set([...cores[x], 255], offset);
    }
  }
  return { data, width: 8, height: 4 };
}

function criaLUT() {
  return criaLUTdeDados(
    new Uint8ClampedArray(cores.flatMap((cor) => [...cor, 255]))
  );
}

function valoresEsperados() {
  return cores.map((_, i) => track.vmin + (i / 7) * (track.vmax - track.vmin));
}

function afirmaValores(actual, expected) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < 1e-10));
}

test('mapeia as oito cores linearmente entre vmin e vmax', () => {
  const valores = analisaDados(criaImagem(), criaLUT(), track, 'global', 8);
  afirmaValores(valores, valoresEsperados());
});

test('ignora pixels transparentes e cores fora da tolerância', () => {
  const imagem = criaImagem();
  const transparente = (0 * imagem.width + 1) * 4;
  imagem.data.set([220, 230, 240, 0], transparente);
  const foraDaTolerancia = (1 * imagem.width + 5) * 4;
  imagem.data.set([255, 0, 0, 255], foraDaTolerancia);

  const valores = analisaDados(imagem, criaLUT(), track, 'global', 8);
  afirmaValores(valores, valoresEsperados());
});

test('retorna NaN para uma coluna sem pixels válidos', () => {
  const imagem = criaImagem();
  for (let y = 0; y < imagem.height; y++) {
    const offset = (y * imagem.width + 3) * 4;
    imagem.data.set([0, 0, 0, 0], offset);
  }

  const valores = analisaDados(imagem, criaLUT(), track, 'global', 8);
  assert.ok(Number.isNaN(valores[3]));
});

test('a banda norte ignora linhas do hemisfério sul', () => {
  const imagem = criaImagem();
  for (let y = 2; y < 4; y++) {
    for (let x = 0; x < 8; x++) {
      const offset = (y * imagem.width + x) * 4;
      imagem.data.set([...cores[7 - x], 255], offset);
    }
  }

  const valores = analisaDados(imagem, criaLUT(), track, 'norte', 8);
  afirmaValores(valores, valoresEsperados());
});
