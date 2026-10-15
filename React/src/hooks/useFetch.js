import { useState, useEffect } from 'react';
import api from '../api/client.js';
import mensajeDe from '../api/mensajes.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export function useFetch(url) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const result = await api.get(url);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  const mensaje = error ? mensajeDe(error, t) : null;

  return { data, loading, error: mensaje, isEmpty: !loading && !mensaje && (!data || (Array.isArray(data) && data.length === 0)) };
}

export default useFetch;
