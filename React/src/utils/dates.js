import { resolverIdioma } from '../i18n/index.js';

export const MESES = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  ca: ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

const ANIO_ACTUAL = new Date().getFullYear();

export const ANIO_MINIMO = ANIO_ACTUAL - 30;
// No se ofrecen años futuros: lo que siga en curso se expresa con «Actual».
export const ANIO_MAXIMO = ANIO_ACTUAL;

export function aniosDisponibles(anio) {
  const anios = [];

  for (let candidato = ANIO_MAXIMO; candidato >= ANIO_MINIMO; candidato -= 1) {
    anios.push(candidato);
  }

  if (anio && !anios.includes(Number(anio))) {
    anios.push(Number(anio));
    anios.sort((a, b) => b - a);
  }

  return anios;
}

export function formatMonthYear(value, lang = 'es') {
  if (typeof value !== 'string') {
    return '';
  }

  const parts = value.split('-');

  if (parts.length !== 2) {
    return '';
  }

  const [year, month] = parts;

  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    return '';
  }

  const index = Number(month) - 1;

  if (index < 0 || index > 11) {
    return '';
  }

  return `${MESES[resolverIdioma(lang)][index]} ${year}`;
}

export default formatMonthYear;
