import { useState } from 'react';
import useContact from '../../hooks/useContact.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

const EMPTY_FORM = { name: '', email: '', message: '', website: '' };

function Contacto() {
  const { send, loading, success, error, reset } = useContact();
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);

  function update(field) {
    return (e) => {
      setForm({ ...form, [field]: e.target.value });
      if (error) reset();
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const sent = await send(form);
    if (sent) {
      setForm(EMPTY_FORM);
    }
  }

  return (
    <section className="contact">
      <h2 className="contact__title">{t('contacto.titulo')}</h2>

      {success ? (
        <div className="contact__success">
          <p>{t('contacto.exito')}</p>
          <button className="contact__button" onClick={reset}>
            {t('contacto.enviar_otro')}
          </button>
        </div>
      ) : (
        <form className="contact__form" onSubmit={handleSubmit} noValidate={false}>
          <label className="contact__label">
            {t('common.nombre')}
            <input
              className="contact__input"
              type="text"
              value={form.name}
              onChange={update('name')}
              required
              maxLength={255}
            />
          </label>

          <label className="contact__label">
            {t('common.email')}
            <input
              className="contact__input"
              type="email"
              value={form.email}
              onChange={update('email')}
              required
              maxLength={255}
            />
          </label>

          <label className="contact__label">
            {t('contacto.mensaje')}
            <textarea
              className="contact__textarea"
              value={form.message}
              onChange={update('message')}
              required
              maxLength={5000}
              rows={6}
            />
          </label>

          <div className="contact__honeypot" aria-hidden="true">
            <label>
              {t('contacto.honeypot')}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={update('website')}
              />
            </label>
          </div>

          {error && <p className="contact__error">{error}</p>}

          <button className="contact__button" type="submit" disabled={loading}>
            {loading ? t('contacto.enviando') : t('contacto.enviar')}
          </button>
        </form>
      )}
    </section>
  );
}

export default Contacto;
