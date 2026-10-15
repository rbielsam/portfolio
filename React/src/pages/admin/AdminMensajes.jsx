import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyData from '../../components/EmptyData.jsx';
import { usePermissions } from '../../hooks/usePermissions.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

function formatDate(value, locale) {
  const date = new Date(value);
  return date.toLocaleString(locale);
}

function AdminMensajes() {
  const { can } = usePermissions();
  const { t, locale } = useLanguage();
  const canEdit = can('messages');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/messages')
      .then(setData)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  async function markAsRead(id) {
    const result = await api.put(`/admin/messages/${id}/read`);
    setData((current) => current.map((m) => (m.id === id ? result : m)));
  }

  async function handleDelete(id) {
    await api.delete(`/admin/messages/${id}`);
    setData((current) => current.filter((m) => m.id !== id));
  }

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error.message || t('common.error_cargar')} />;
  if (data.length === 0) return <EmptyData />;

  const unread = data.filter((m) => !m.is_read).length;

  return (
    <div className="admin-view">
      <h2 className="admin-view__title">
        {t('admin.mensajes')} {unread > 0 && <span className="admin-view__badge">{t('mensajes.sin_leer', { n: unread })}</span>}
      </h2>

      <ul className="admin-messages">
        {data.map((msg) => (
          <li
            key={msg.id}
            className={`admin-messages__item ${msg.is_read ? '' : 'admin-messages__item--unread'}`}
          >
            <div className="admin-messages__header">
              <strong>{msg.name}</strong>
              <a href={`mailto:${msg.email}`}>{msg.email}</a>
              <time>{formatDate(msg.created_at, locale)}</time>
            </div>
            <p className="admin-messages__body">{msg.message}</p>
            <div className="admin-messages__actions">
              {canEdit && !msg.is_read && (
                <button onClick={() => markAsRead(msg.id)}>{t('mensajes.atendido')}</button>
              )}
              {canEdit && <button onClick={() => handleDelete(msg.id)}>{t('common.eliminar')}</button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminMensajes;
