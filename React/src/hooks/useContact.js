import { useState, useCallback } from 'react';
import api, { fetchCsrfCookie } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export function useContact() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setSuccess(false);
    setError(null);
  }, []);

  const send = useCallback(async (formData) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await fetchCsrfCookie();
      await api.post('/contact/messages', formData);
      setSuccess(true);
      return true;
    } catch (err) {
      if (err.status === 429) {
        setError(t('contacto.error_limite'));
      } else if (err.status === 419) {
        setError(t('contacto.error_sesion'));
      } else if (err.status) {
        setError(err.message || t('contacto.error_envio'));
      } else {
        setError(t('error.red'));
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  return { send, loading, success, error, reset };
}

export default useContact;
