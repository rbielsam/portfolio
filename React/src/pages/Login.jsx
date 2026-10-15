import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useSection } from '../context/SectionContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

function Login() {
  const { login } = useAuth();
  const { setActiveSection } = useSection();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch {
      setError(t('login.error_credenciales'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login">
      <button
        type="button"
        className="login__back"
        onClick={() => setActiveSection('Inicio')}
        aria-label={t('nav.volver_inicio')}
      >
        <span aria-hidden="true">←</span>
      </button>
      <h2 className="login__title">{t('login.titulo')}</h2>
      <form className="login__form" onSubmit={handleSubmit}>
        <label className="login__label">
          {t('common.email')}
          <input
            type="email"
            className="login__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="login__label">
          {t('login.password')}
          <input
            type="password"
            className="login__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="login__error">{error}</p>}
        <button type="submit" className="login__button" disabled={loading}>
          {loading ? t('login.entrando') : t('login.entrar')}
        </button>
      </form>
    </section>
  );
}

export default Login;
