const DISTANCIA_MAXIMA = 40 * 40 * 3;
const TROPICO_LATITUDE = 23.5;

export function criaLUTdeDados(data) {
  if (!(data instanceof Uint8ClampedArray) || data.length % 4 !== 0) {
    throw new TypeError('data deve ser um Uint8ClampedArray com bytes RGBA.');
  }

  const lut = [];
  for (let i = 0; i < data.length; i += 4) {
    lut.push([data[i], data[i + 1], data[i + 2]]);
  }
  return lut;
}

function latitudeDaLinha(y, height) {
  return 90 - ((y + 0.5) / height) * 180;
}

function incluiLatitude(latitude, banda) {
  switch (banda) {
    case 'norte':
      return latitude >= 0;
    case 'sul':
      return latitude < 0;
    case 'trópicos':
    case 'tropicos':
      return Math.abs(latitude) <= TROPICO_LATITUDE;
    case 'global':
      return true;
    default:
      throw new RangeError(`Banda de latitude inválida: ${banda}`);
  }
}

export function analisaDados({ data, width, height }, lut, track, banda, COLS) {
  if (!Number.isInteger(width) || width <= 0 ||
      !Number.isInteger(height) || height <= 0 ||
      data.length !== width * height * 4) {
    throw new RangeError('As dimensões da imagem não correspondem aos dados RGBA.');
  }
  if (!Array.isArray(lut) || lut.length === 0) {
    throw new RangeError('A LUT deve conter ao menos uma cor.');
  }
  if (!Number.isInteger(COLS) || COLS <= 0) {
    throw new RangeError('COLS deve ser um inteiro positivo.');
  }
  if (!Number.isFinite(track.vmin) || !Number.isFinite(track.vmax) ||
      track.vmin === track.vmax) {
    throw new RangeError('A faixa deve ter vmin e vmax finitos e diferentes.');
  }

  const somas = new Array(COLS).fill(0);
  const pesos = new Array(COLS).fill(0);
  const cache = new Map();
  const valores = lut.map((_, i) =>
    track.vmin + (i / (lut.length - 1 || 1)) * (track.vmax - track.vmin)
  );

  for (let y = 0; y < height; y++) {
    const latitude = latitudeDaLinha(y, height);
    if (!incluiLatitude(latitude, banda)) continue;

    const peso = Math.cos((latitude * Math.PI) / 180);
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const alpha = data[offset + 3];
      if (alpha === 0) continue;

      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const chave = `${r},${g},${b}`;
      let indice = cache.get(chave);
      if (indice === undefined) {
        let distanciaMinima = Infinity;
        indice = -1;
        for (let i = 0; i < lut.length; i++) {
          const dr = r - lut[i][0];
          const dg = g - lut[i][1];
          const db = b - lut[i][2];
          const distancia = dr * dr + dg * dg + db * db;
          if (distancia < distanciaMinima) {
            distanciaMinima = distancia;
            indice = i;
          }
        }
        if (distanciaMinima > DISTANCIA_MAXIMA) indice = -1;
        cache.set(chave, indice);
      }
      if (indice < 0) continue;

      const coluna = Math.floor((x * COLS) / width);
      somas[coluna] += valores[indice] * peso;
      pesos[coluna] += peso;
    }
  }

  return somas.map((soma, coluna) =>
    pesos[coluna] === 0 ? NaN : soma / pesos[coluna]
  );
}
