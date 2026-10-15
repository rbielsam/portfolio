export function mensajeDe(err, t, claveRespaldo = 'common.error_cargar') {
  if (err?.status && err?.message) {
    return err.message;
  }

  if (err?.status) {
    return t('error.codigo', { status: err.status });
  }

  return t(claveRespaldo);
}

export default mensajeDe;
